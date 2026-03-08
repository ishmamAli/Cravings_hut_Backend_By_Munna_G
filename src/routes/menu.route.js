const express = require("express");
const { requireSignin } = require("../middlewares/auth");
const { MenuItem, Inventory, Supplier, SupplierLog, Expense, Buyer, User, EmployeeProfile } = require("../models");
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

router.get("/buyer", requireSignin, async (req, res) => {
  const items = await Buyer.find({}).sort({ createdAt: -1 });
  res.json(items);
});

router.get("/expense", requireSignin, async (req, res) => {
  const items = await Expense.find({}).sort({ createdAt: -1 });
  res.json(items);
});

router.get("/user", requireSignin, async (req, res) => {
  const items = await User.find({ user_type: "user" }).sort({ createdAt: -1 });
  res.json(items);
});

router.get("/employee", requireSignin, async (req, res) => {
  const items = await EmployeeProfile.find({}).populate("user").sort({ createdAt: -1 });
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

router.patch("/supplier/logs/:logId", requireSignin, async (req, res) => {
  try {
    const { logId } = req.params;
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

    // Check if all items have a valid quantity > 0
    for (const item of items) {
      const { quantity } = item;
      if (quantity <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Quantity must be > 0" });
      }
    }

    const userId = req.user?._id;

    // Load existing log (and ensure ownership if needed)
    const existingLog = await SupplierLog.findById(logId);
    if (!existingLog) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Supplier log not found" });
    }

    // Rollback inventory if updating existing log
    if (Array.isArray(existingLog.items) && existingLog.items.length) {
      for (const oldItem of existingLog.items) {
        await updateInventoryForItem({
          inventoryItem: oldItem.inventoryItem,
          quantity: Number(oldItem.quantity || 0),
          unit: oldItem.unit,
          rate: Number(oldItem.rate || 0),
          totalAmount: Number(oldItem.totalAmount || 0),
          userId,
        });
      }
    }

    // Apply new inventory updates + calculate grandTotal
    let grandTotal = 0;
    const normalizedItems = [];

    for (const item of items) {
      const { inventoryItem, quantity, unit, rate, totalAmount } = item;

      if (!inventoryItem) throw new Error("inventoryItem is required for all items");

      await updateInventoryForItem({
        inventoryItem,
        quantity,
        unit,
        rate,
        totalAmount,
        userId,
      });

      const q = Number(quantity);
      const r = Number(rate);
      const t = Number(totalAmount);

      grandTotal += t;

      normalizedItems.push({
        inventoryItem,
        quantity: q,
        unit,
        rate: r,
        totalAmount: t,
      });
    }

    if (!grandTotal || grandTotal <= 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Grand total must be > 0" });
    }

    // Split grandTotal into cash + credit based on paymentMethod
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
      creditAmt = grandTotal - enteredCash;
    } else if (paymentMethod === "credit") {
      if (!enteredCredit || enteredCredit <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Credit amount is required" });
      }
      if (enteredCredit > grandTotal) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Credit amount cannot exceed grand total" });
      }
      creditAmt = enteredCredit;
      cashAmt = grandTotal - enteredCredit;
    } else {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid paymentMethod" });
    }

    // Update log
    existingLog.supplier = supplier;
    existingLog.paymentMethod = paymentMethod;
    existingLog.billId = billId;
    existingLog.paymentDate = paymentDate;
    existingLog.remarks = remarks;
    existingLog.grandTotal = grandTotal;
    existingLog.cashAmount = cashAmt || undefined;
    existingLog.creditAmount = creditAmt || undefined;
    existingLog.items = normalizedItems;
    existingLog.updatedBy = userId;

    await existingLog.save();

    await existingLog.populate([
      { path: "supplier", select: "name" },
      { path: "items.inventoryItem", select: "itemName unit" },
    ]);

    return res.status(httpStatus.OK).json(existingLog);
  } catch (err) {
    console.error("Error updating supplier log:", err);
    return res.status(httpStatus.BAD_REQUEST).json({
      message: err?.message || "Failed to update supplier log",
    });
  }
});

router.get("/supplier/logs", requireSignin, async (req, res) => {
  try {
    const { filterType, supplierId, inventoryItemId, paymentMethod, page = 1, limit = 10 } = req.query;

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
    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.max(parseInt(limit), 1);
    const skip = (pageNumber - 1) * pageSize;
    const [logs, total] = await Promise.all([
      SupplierLog.find(query)
        .populate("supplier", "name contactNumber")
        .populate("items.inventoryItem", "itemName unit")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      SupplierLog.countDocuments(query),
    ]);

    res.json({
      data: logs,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: pageNumber * pageSize < total,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching supplier logs:", err);
    return res.status(500).json({ message: err?.message || "Failed to fetch supplier logs" });
  }
});

function safeNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function formatInvoice(prefix, id) {
  const s = String(id || "");
  return `${prefix}-${s.slice(-6).toUpperCase()}`;
}

function getPurchaseTotalFromLog(log) {
  // Prefer stored grandTotal
  if (safeNumber(log.grandTotal) > 0) return safeNumber(log.grandTotal);

  // Otherwise sum items
  if (Array.isArray(log.items) && log.items.length) {
    return log.items.reduce((sum, it) => sum + safeNumber(it.totalAmount), 0);
  }

  // Legacy single-item
  if (safeNumber(log.totalAmount) > 0) return safeNumber(log.totalAmount);

  return 0;
}

function getPaidNowFromPurchaseLog(log) {
  // In your model: cashAmount is immediate paid amount, creditAmount is remaining owed (NOT paid)
  return safeNumber(log.cashAmount);
}

function getPurchaseStatus(purchaseTotal, paidNow) {
  if (purchaseTotal <= 0) return "N/A";
  if (paidNow <= 0) return "UNPAID";
  if (paidNow >= purchaseTotal) return "PAID";
  return "PARTIAL";
}

async function getSupplierLedgerDetailed(supplierId, { order = "desc" } = {}) {
  // 1) Supplier
  const supplier = await Supplier.findById(supplierId).select("name").lean();

  // 2) Raw data
  const [logs, expenses] = await Promise.all([
    SupplierLog.find({ supplier: supplierId }).sort({ createdAt: 1 }).lean(),
    Expense.find({ supplier: supplierId }).sort({ date: 1, createdAt: 1 }).lean(),
  ]);

  // 3) Convert to unified events
  const events = [];

  // SupplierLog -> Purchase OR Payment-only
  for (const log of logs) {
    const date = log.paymentDate || log.createdAt;
    const purchaseTotal = getPurchaseTotalFromLog(log);
    const paidNow = getPaidNowFromPurchaseLog(log);

    // A) Purchase bill (with optional partial payment)
    if (purchaseTotal > 0) {
      const status = getPurchaseStatus(purchaseTotal, paidNow);

      events.push({
        source: "SupplierLog",
        sourceId: log._id,
        type: "purchase",
        date,
        supplierName: supplier?.name || "Supplier",
        invoiceNumber: log.billId || log?.credit?.billId || formatInvoice("INV", log._id),

        amountOwed: purchaseTotal,
        amountPaid: paidNow, // paid at purchase time
        paymentStatus: status,

        purchaseAmount: purchaseTotal,
        paymentAmount: paidNow, // show in payment column (optional)
        remarks: log.remarks || "",

        // delta increases payable balance by (owed - paidNow)
        delta: purchaseTotal - paidNow,
      });

      continue;
    }

    // B) Payment-only log (Cash out etc.)
    const paymentOnlyAmount = safeNumber(log.cashAmount) + safeNumber(log.creditAmount);
    // (If you store pure payments in cashAmount, it will work; if you used creditAmount for payments too, it will also count)
    if (paymentOnlyAmount > 0) {
      events.push({
        source: "SupplierLog",
        sourceId: log._id,
        type: "payment",
        date,
        supplierName: supplier?.name || "Supplier",
        invoiceNumber: log.billId || formatInvoice("PAY", log._id),

        amountOwed: 0,
        amountPaid: paymentOnlyAmount,
        paymentStatus: log.paymentMethod === "credit" ? "CREDIT_PAYMENT" : "PAYMENT",

        purchaseAmount: 0,
        paymentAmount: paymentOnlyAmount,
        remarks: log.remarks || "",

        // delta reduces payable balance
        delta: -paymentOnlyAmount,
        paymentMethod: log.paymentMethod,
      });
    }
  }

  // Expense -> treat supplier expense as a PAYMENT to supplier
  for (const exp of expenses) {
    const date = exp.date || exp.createdAt;
    const amt = safeNumber(exp.amount);

    if (amt <= 0) continue;

    events.push({
      source: "Expense",
      sourceId: exp._id,
      type: "payment",
      date,
      supplierName: supplier?.name || "Supplier",
      invoiceNumber: formatInvoice("EXP", exp._id),

      amountOwed: 0,
      amountPaid: amt,
      paymentStatus: exp.paymentMethod === "online" ? "ONLINE_PAYMENT" : "CASH_PAYMENT",

      purchaseAmount: 0,
      paymentAmount: amt,
      remarks: exp.name || "",

      delta: -amt,
      paymentMethod: exp.paymentMethod,
    });
  }

  // 4) Sort ascending for correct running balance
  events.sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (da !== db) return da - db;

    // same time: purchases first then payments (so balance increases then decreases)
    if (a.type === b.type) return 0;
    return a.type === "purchase" ? -1 : 1;
  });

  // 5) Running balance (positive means "You'll Give" / you owe supplier)
  let runningBalance = 0;

  let totalPurchases = 0;
  let totalPaid = 0;

  for (const e of events) {
    totalPurchases += safeNumber(e.purchaseAmount);
    totalPaid += safeNumber(e.paymentAmount);

    runningBalance += safeNumber(e.delta);
    e.runningBalance = runningBalance;
  }

  // 6) return rows (desc for UI like your screenshot)
  const rows = order === "asc" ? events : [...events].sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    supplier: {
      _id: supplierId,
      name: supplier?.name || "Supplier",
    },
    summary: {
      totalPurchases,
      totalPaid,
      balance: runningBalance, // + => you owe supplier
    },
    rows,
  };
}

router.get("/supplier/ledger/:supplierId", requireSignin, async (req, res) => {
  try {
    const { supplierId } = req.params;
    const order = req.query.order || "desc"; // desc default
    const ledger = await getSupplierLedgerDetailed(supplierId, { order });

    return res.status(httpStatus.OK).json(ledger);
  } catch (err) {
    console.error("Error fetching supplier ledger:", err);
    return res.status(httpStatus.BAD_REQUEST).json({
      message: err?.message || "Failed to fetch supplier ledger",
    });
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
