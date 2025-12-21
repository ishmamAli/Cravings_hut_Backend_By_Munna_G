const express = require("express");
const { requireSignin } = require("../middlewares/auth");
const { MenuItem, Inventory, Supplier, SupplierLog } = require("../models");
const { convertToInventoryUnit } = require("../utils/unitConversion");
const httpStatus = require("http-status");

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await MenuItem.find({ isAvailable: true }).populate("category").sort({ category: 1, name: 1 });
  res.json(items);
});

router.get("/inventory", requireSignin, async (req, res) => {
  const items = await Inventory.find({ inventoryType: "consumable" }).sort({ createdAt: -1 });
  res.json(items);
});

router.get("/supplier", requireSignin, async (req, res) => {
  const items = await Supplier.find({}).sort({ createdAt: -1 });
  res.json(items);
});

const updateInventoryForItem = async ({ inventoryItem, quantity, unit, rate, totalAmount, userId }) => {
  const inv = await Inventory.findById(inventoryItem);
  if (!inv) {
    throw new Error("Inventory item not found");
  }

  const quantityNumber = Number(quantity);
  const totalAmountNumber = Number(totalAmount);

  if (!quantityNumber || quantityNumber <= 0) {
    throw new Error("Quantity must be > 0");
  }

  if (!totalAmountNumber || totalAmountNumber <= 0) {
    throw new Error("Total amount must be > 0");
  }

  // convert to inventory unit
  const quantityToAdd = convertToInventoryUnit(quantityNumber, unit, inv.unit);

  const oldQty = inv.quantity || 0;
  const oldUnitPrice = inv.unitPrice || 0;
  const newQty = quantityToAdd;
  const combinedQty = oldQty + newQty;

  if (combinedQty > 0) {
    const oldValue = oldQty * oldUnitPrice;
    const newValue = totalAmountNumber;
    const newUnitPrice = (oldValue + newValue) / combinedQty;
    inv.unitPrice = newUnitPrice;
  } else {
    inv.unitPrice = totalAmountNumber / newQty;
  }

  inv.quantity = combinedQty;
  inv.updatedBy = userId || inv.updatedBy;
  await inv.save();
};

router.post("/supplier/logs", requireSignin, async (req, res) => {
  try {
    const {
      supplier,
      paymentMethod,
      billId,
      paymentDate,
      remarks,
      items = [], // [{ inventoryItem, quantity, unit, rate, totalAmount }]
      cashAmount,
      creditAmount,
    } = req.body;

    if (!supplier) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "supplier is required" });
    }

    if (!paymentMethod) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "paymentMethod is required" });
    }

    if (!Array.isArray(items) || !items.length) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "At least one item is required" });
    }

    const userId = req.user?._id;

    // 1) update inventory per item + calculate grandTotal
    let grandTotal = 0;
    const normalizedItems = [];

    for (const item of items) {
      const { inventoryItem, quantity, unit, rate, totalAmount } = item;

      if (!inventoryItem) {
        throw new Error("inventoryItem is required for all items");
      }

      await updateInventoryForItem({
        inventoryItem,
        quantity,
        unit,
        rate,
        totalAmount,
        userId,
      });

      const quantityNumber = Number(quantity);
      const rateNumber = Number(rate);
      const totalAmountNumber = Number(totalAmount);

      grandTotal += totalAmountNumber;

      normalizedItems.push({
        inventoryItem,
        quantity: quantityNumber,
        unit,
        rate: rateNumber,
        totalAmount: totalAmountNumber,
      });
    }

    if (!grandTotal || grandTotal <= 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Grand total must be > 0" });
    }

    // 2) split grandTotal into cash + credit based on paymentMethod
    let cashAmt = 0;
    let creditAmt = 0;

    const enteredCash = Number(cashAmount || 0);
    const enteredCredit = Number(creditAmount || 0);

    if (paymentMethod === "cash") {
      if (!enteredCash || enteredCash <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Cash amount is required" });
      }
      if (enteredCash > grandTotal) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Cash amount cannot exceed grand total" });
      }

      cashAmt = enteredCash;
      creditAmt = grandTotal - enteredCash; // pending credit
    } else if (paymentMethod === "credit") {
      if (!enteredCredit || enteredCredit <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Credit amount is required" });
      }
      if (enteredCredit > grandTotal) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Credit amount cannot exceed grand total" });
      }

      creditAmt = enteredCredit;
      cashAmt = grandTotal - enteredCredit; // already paid in cash
    } else {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid paymentMethod" });
    }

    // 3) create ONE log per bill
    const log = await SupplierLog.create({
      supplier,
      paymentMethod,
      billId,
      paymentDate,
      remarks,
      grandTotal,
      cashAmount: cashAmt || undefined,
      creditAmount: creditAmt || undefined,
      items: normalizedItems,
      createdBy: userId,
    });

    await log.populate([
      { path: "supplier", select: "name" },
      { path: "items.inventoryItem", select: "itemName unit" },
    ]);

    return res.status(httpStatus.CREATED).json(log);
  } catch (err) {
    console.error("Error creating supplier log:", err);
    return res.status(httpStatus.BAD_REQUEST).json({ message: err?.message || "Failed to create supplier log" });
  }
});

router.get("/supplier/logs", requireSignin, async (req, res) => {
  try {
    const { filterType, supplierId, inventoryItemId, paymentMethod } = req.query;

    const query = {};

    if (filterType === "supplier" && supplierId) {
      query.supplier = supplierId;
    }

    if (filterType === "item" && inventoryItemId) {
      query["items.inventoryItem"] = inventoryItemId;
    }

    if (filterType === "payment" && paymentMethod) {
      query.paymentMethod = paymentMethod.toLowerCase();
    }

    const logs = await SupplierLog.find(query)
      .populate("supplier", "name")
      .populate("items.inventoryItem", "itemName unit")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    console.error("Error fetching supplier logs:", err);
    return res.status(500).json({ message: err?.message || "Failed to fetch supplier logs" });
  }
});

router.get("/modify/deal-ingredients", async (req, res) => {
  try {
    // Get all menu items of type "deal"
    const deals = await MenuItem.find({ type: "deal" }).lean();

    let updatedCount = 0;

    for (const deal of deals) {
      if (!deal.dealItems || deal.dealItems.length === 0) continue;

      // Map for aggregated ingredients: key = inventoryItemId + unit
      const aggregated = {};

      // For each item inside the deal
      for (const dealItem of deal.dealItems) {
        if (!dealItem.item) continue;

        const item = await MenuItem.findById(dealItem.item).lean();
        if (!item || !item.ingredients || item.ingredients.length === 0) continue;

        const dealQuantity = dealItem.quantity || 1;

        for (const ing of item.ingredients) {
          if (!ing.inventoryItem || !ing.quantity) continue;

          // Group by inventoryItem + unit (so we can sum)
          const unit = ing.unit || "g";
          const key = `${ing.inventoryItem.toString()}::${unit}`;

          if (!aggregated[key]) {
            aggregated[key] = {
              inventoryItem: ing.inventoryItem,
              unit,
              quantity: 0,
            };
          }

          // Multiply ingredient quantity by number of that item in the deal
          aggregated[key].quantity += ing.quantity * dealQuantity;
        }
      }

      const newIngredients = Object.values(aggregated);
      console.log("deal?._id is", deal?._id);
      console.log("ingredients is", newIngredients);
      // Update deal with aggregated ingredients
      await MenuItem.updateOne({ _id: deal._id }, { $set: { ingredients: newIngredients } });

      updatedCount++;
    }

    return res.json(updatedCount);
  } catch (err) {
    console.error("Error fetching supplier logs:", err);
    return res.status(500).json({ message: err?.message || "Failed to fetch supplier logs" });
  }
});

module.exports = router;
