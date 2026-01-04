const express = require("express");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError.js");
const Order = require("../models/order.model.js");
const MenuItem = require("../models/menuItem.model.js");
const Inventory = require("../models/inventory.model.js");
const OrderInventoryLog = require("../models/orderInventoryLog.model.js");
const { CashOpening, BankDeposit } = require("../models");
const { requireSignin } = require("../middlewares/auth.js");
const { convertToInventoryUnit } = require("../utils/unitConversion.js");
const moment = require("moment-timezone");
const validate = require("../middlewares/validate.js");
const { orderValidation } = require("../validations");

const router = express.Router();

// List orders by status (for kitchen)
router.get("/", requireSignin, async (req, res) => {
  const status = req.query.status; // optional
  const q = status ? { status } : {};
  const orders = await Order.find(q)
    .sort({ createdAt: -1 })
    .populate({
      path: "items.menuItem",
      populate: {
        path: "category",
        model: "Category",
      },
    })
    .populate({
      path: "items.dealItems.menuItem",
      populate: {
        path: "category",
        model: "Category",
      },
    });
  res.json(orders);
});

// Create order (from waiter)
router.post("/", requireSignin, async (req, res) => {
  try {
    const {
      tableNumber,
      items,
      total,
      applyCgtTax,
      applyDiscount,
      cgtTax,
      discount,
      orderType,
      cgtTaxPer,
      discountPer,
      customerName,
      customerPhone,
      customerAddress,
      deliveryMode,
    } = req.body;
    if (orderType === "delivery" && deliveryMode === "self") {
      const phone = String(customerPhone || "").trim();
      if (!phone) {
        return res.status(400).json({
          message: "customerPhone is required for delivery (self).",
          field: "customerPhone",
        });
      }
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required to create an order." });
    }
    let { _id } = req.user;
    let createdBy = _id;
    const rawItems = Array.isArray(items) ? items : [];

    // Collect all menuItem ids: main items (deals or single) + selected flavours for deals
    const allMenuIdsSet = new Set();

    rawItems.forEach((i) => {
      if (i.menuItemId) allMenuIdsSet.add(String(i.menuItemId));
      if (Array.isArray(i.dealSelection)) {
        i.dealSelection.forEach((sel) => {
          (sel.items || []).forEach((id) => {
            if (id) allMenuIdsSet.add(String(id));
          });
        });
      }
    });

    const allMenuIds = Array.from(allMenuIdsSet);

    // Load all related menu items (deals + base items)
    const menuDocs = await MenuItem.find({
      _id: { $in: allMenuIds },
    }).populate("dealItems.item");

    const menuMap = new Map(menuDocs.map((m) => [m._id.toString(), m]));

    const orderItems = rawItems
      .map((i) => {
        const m = menuMap.get(String(i.menuItemId));
        if (!m) return null;

        const isDeal = m.type === "deal";
        const qty = i.qty || 1;

        const baseItem = {
          menuItem: m._id,
          name: m.name,
          price: m.price, // for deals: deal price
          qty,
          notes: i.notes || "",
          isDeal,
        };

        if (isDeal) {
          const dealItems = [];

          // 1) Fixed deal items (item set directly on MenuItem.dealItems)
          if (Array.isArray(m.dealItems)) {
            m.dealItems.forEach((d) => {
              if (d.item) {
                const itemDoc = menuMap.get(String(d.item?._id || d.item)) || {};
                const baseName = itemDoc.name || d.item?.name || "Deal Item";
                const q = d.quantity || 1;

                dealItems.push({
                  menuItem: d.item._id || d.item,
                  name: baseName,
                  qty: q,
                });
              }
            });
          }

          // 2) Category-based rows resolved from dealSelection
          if (Array.isArray(i.dealSelection)) {
            i.dealSelection.forEach((sel) => {
              const itemIds = Array.isArray(sel.items) ? sel.items : [];
              itemIds.forEach((miId) => {
                const baseItemDoc = menuMap.get(String(miId));
                if (!baseItemDoc) return;
                dealItems.push({
                  menuItem: baseItemDoc._id,
                  name: baseItemDoc.name,
                  qty: 1,
                });
              });
            });
          }

          baseItem.dealItems = dealItems;
        }

        return baseItem;
      })
      .filter(Boolean);

    const order = await Order.create({
      tableNumber,
      items: orderItems,
      total, // from frontend
      applyCgtTax,
      applyDiscount,
      cgtTax,
      discount,
      orderType,
      cgtTaxPer,
      discountPer,
      customerName,
      customerPhone,
      customerAddress,
      deliveryMode,
      createdBy,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("order:new", order);
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("Error in create order:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

async function decrementInventoryAndLog({ order, userId }) {
  try {
    const items = Array.isArray(order?.items) ? order.items : [];
    if (!order?._id || items.length === 0) {
      return { ok: true, updated: 0, skipped: 0, logId: null };
    }

    // Collect menuItem ids we need to consume
    // - normal item => itself
    // - deal => consume ingredients of each dealItems.menuItem
    const menuIds = new Set();

    for (const line of items) {
      if (!line) continue;

      if (line.isDeal && Array.isArray(line.dealItems)) {
        for (const di of line.dealItems) {
          if (di?.menuItem) menuIds.add(String(di.menuItem));
        }
      } else if (line.menuItem) {
        menuIds.add(String(line.menuItem));
      }
    }

    const menuIdArr = Array.from(menuIds);
    if (menuIdArr.length === 0) {
      return { ok: true, updated: 0, skipped: 0, logId: null };
    }

    // Load menu items with ingredients
    const menuDocs = await MenuItem.find({ _id: { $in: menuIdArr } })
      .select("_id ingredients")
      .lean();

    const menuMap = new Map(menuDocs.map((m) => [String(m._id), m]));

    // Build raw requirements per inventory item: invId -> [{qty, unit}, ...]
    const rawReq = new Map();

    const pushReq = (invId, qty, unit) => {
      const id = String(invId);
      const n = Number(qty);
      if (!id || !Number.isFinite(n) || n <= 0) return;

      const arr = rawReq.get(id) || [];
      arr.push({ qty: n, unit });
      rawReq.set(id, arr);
    };

    for (const line of items) {
      const lineQty = Number(line?.qty || 1);
      if (!Number.isFinite(lineQty) || lineQty <= 0) continue;

      if (line.isDeal && Array.isArray(line.dealItems)) {
        for (const di of line.dealItems) {
          const miId = di?.menuItem ? String(di.menuItem) : null;
          if (!miId) continue;

          const diQty = Number(di?.qty || 1);
          if (!Number.isFinite(diQty) || diQty <= 0) continue;

          const menu = menuMap.get(miId);
          const ingredients = Array.isArray(menu?.ingredients) ? menu.ingredients : [];

          for (const ing of ingredients) {
            if (!ing?.inventoryItem) continue;
            pushReq(ing.inventoryItem, Number(ing.quantity) * lineQty * diQty, ing.unit);
          }
        }
      } else {
        const miId = line?.menuItem ? String(line.menuItem) : null;
        if (!miId) continue;

        const menu = menuMap.get(miId);
        const ingredients = Array.isArray(menu?.ingredients) ? menu.ingredients : [];

        for (const ing of ingredients) {
          if (!ing?.inventoryItem) continue;
          pushReq(ing.inventoryItem, Number(ing.quantity) * lineQty, ing.unit);
        }
      }
    }

    const invIds = Array.from(rawReq.keys());
    if (invIds.length === 0) {
      return { ok: true, updated: 0, skipped: 0, logId: null };
    }

    const invDocs = await Inventory.find({ _id: { $in: invIds } })
      .select("_id itemName quantity unit")
      .lean();

    const invMap = new Map(invDocs.map((i) => [String(i._id), i]));

    // Convert requirements to each inventory's unit and SUM
    // invId -> needQtyInInvUnit
    const needMap = new Map();
    const entries = [];

    for (const invId of invIds) {
      const inv = invMap.get(invId);

      if (!inv) {
        entries.push({
          inventoryItem: invId,
          skipped: true,
          reason: "NOT_FOUND",
        });
        continue;
      }

      const currentQty = Number(inv.quantity);
      if (!Number.isFinite(currentQty)) {
        entries.push({
          inventoryItem: inv._id,
          inventoryName: inv.itemName,
          inventoryUnit: inv.unit,
          skipped: true,
          reason: "INVALID_STOCK_QTY",
        });
        continue;
      }

      let totalNeed = 0;
      const list = rawReq.get(invId) || [];

      let unitMismatch = false;
      for (const r of list) {
        try {
          const converted = convertToInventoryUnit(r.qty, r.unit, inv.unit);
          const n = Number(converted);
          if (Number.isFinite(n) && n > 0) totalNeed += n;
        } catch (e) {
          unitMismatch = true;
          break;
        }
      }

      if (unitMismatch || totalNeed <= 0) {
        entries.push({
          inventoryItem: inv._id,
          inventoryName: inv.itemName,
          inventoryUnit: inv.unit,
          requiredQty: totalNeed || 0,
          skipped: true,
          reason: unitMismatch ? "UNIT_MISMATCH" : "INVALID_REQUIRED_QTY",
        });
        continue;
      }

      needMap.set(invId, totalNeed);
    }

    // Now decrement one-by-one so we can log before/after properly
    let updatedCount = 0;
    let skippedCount = 0;

    for (const [invId, needQty] of needMap.entries()) {
      const inv = invMap.get(invId);
      if (!inv) continue;

      // Try atomic decrement only if enough exists
      const updated = await Inventory.findOneAndUpdate(
        { _id: inv._id, quantity: { $gte: needQty } },
        { $inc: { quantity: -needQty } },
        { new: true } // gives afterQty
      ).lean();

      if (!updated) {
        skippedCount++;
        entries.push({
          inventoryItem: inv._id,
          inventoryName: inv.itemName,
          inventoryUnit: inv.unit,
          requiredQty: needQty,
          deductedQty: 0,
          skipped: true,
          reason: "INSUFFICIENT_STOCK",
        });
        continue;
      }

      updatedCount++;
      const afterQty = Number(updated.quantity);
      const beforeQty = afterQty + needQty;

      entries.push({
        inventoryItem: inv._id,
        inventoryName: inv.itemName,
        inventoryUnit: inv.unit,
        requiredQty: needQty,
        deductedQty: needQty,
        beforeQty,
        afterQty,
        skipped: false,
        reason: "DEDUCTED",
      });
    }

    // Create log doc (don’t crash if log fails)
    let logDoc = null;
    try {
      logDoc = await OrderInventoryLog.create({
        order: order._id,
        orderId: order.orderId,
        action: "DECREMENT",
        createdBy: userId,
        entries,
        summary: { updated: updatedCount, skipped: skippedCount },
      });
    } catch (e) {
      // if log already exists (unique index), ignore
      // or any issue, still do not crash
      console.warn("OrderInventoryLog create skipped:", e?.message);
    }

    return { ok: true, updated: updatedCount, skipped: skippedCount, logId: logDoc?._id || null };
  } catch (err) {
    console.error("decrementInventoryAndLog error:", err);
    return { ok: false, updated: 0, skipped: 0, error: err.message };
  }
}

// Update status (kitchen)
router.patch("/:id/status", requireSignin, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["PENDING", "IN_PROGRESS", "DONE"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const existing = await Order.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Order not found" });

    const isTransitionToDone = existing.status !== "DONE" && status === "DONE" && existing.inventoryDeducted !== true;

    const updatedData = { status };

    if (status === "DONE") {
      updatedData.endTime = new Date();
      if (isTransitionToDone) {
        updatedData.inventoryDeducted = true;
        updatedData.inventoryDeductedAt = new Date();
      }
    } else {
      updatedData.endTime = null;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updatedData }, { new: true }).populate([
      // populate normal items -> menuItem -> category
      {
        path: "items.menuItem",
        select: "name price category", // optional
        populate: {
          path: "category",
        },
      },

      // populate dealItems -> menuItem -> category
      {
        path: "items.dealItems.menuItem",
        select: "name price category", // optional
        populate: {
          path: "category",
        },
      },
    ]);

    // ✅ Decrement + store log ONLY once when moved to DONE
    if (isTransitionToDone) {
      const userId = req.user?._id; // depends on your auth middleware
      const result = await decrementInventoryAndLog({ order: existing, userId });

      if (!result.ok) {
        console.warn("Inventory decrement/log failed but order update succeeded:", result);
      }
    }

    const io = req.app.get("io");
    if (io) io.emit("order:update", order);

    return res.json(order);
  } catch (err) {
    console.error("Error updating order:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

const isOrderFromToday = (order) => {
  const tz = "Asia/Karachi";
  const businessStartHour = 8;

  // Get today's date at 8:00 AM (start of business day)
  const todayStart = moment.tz(tz).startOf("day").add(businessStartHour, "hours");

  // Get tomorrow's date at 8:00 AM (end of business day)
  const tomorrowStart = todayStart.clone().add(1, "day");

  // Get the order's created date
  const orderDate = moment(order.createdAt).tz(tz);

  // If it's before today's 8:00 AM, we need to check if it's from yesterday after 8 AM
  if (orderDate.isBefore(todayStart)) {
    // Check if the order was made after 8 AM on the previous day
    const yesterdayStart = todayStart.clone().subtract(1, "day");
    return orderDate.isBetween(yesterdayStart, todayStart, null, "[]");
  }

  // Check if the order is within today (from 8 AM today to 8 AM tomorrow)
  return orderDate.isBetween(todayStart, tomorrowStart, null, "[]"); // '[]' includes start and end
};

// PATCH /admin/order/:id
router.patch("/:id/modify", requireSignin, async (req, res) => {
  try {
    const { id } = req.params;
    let { _id } = req.user;
    let updatedBy = _id;

    let { applyDiscount, discountPer, applyCgtTax, cgtTaxPer, items, customerName, customerPhone, customerAddress } =
      req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required to update an order." });
    }

    const order = await Order.findById(id).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!isOrderFromToday(order)) {
      return res.status(400).json({ message: "Invalid permission for edit old order" });
    }

    const clamp = (v) => Math.min(30, Math.max(0, Number(v) || 0));

    applyDiscount = typeof applyDiscount !== "undefined" ? applyDiscount : order.applyDiscount;
    applyCgtTax = typeof applyCgtTax !== "undefined" ? applyCgtTax : order.applyCgtTax;

    discountPer = discountPer != null ? clamp(discountPer) : order.discountPer || 0;
    cgtTaxPer = cgtTaxPer != null ? clamp(cgtTaxPer) : order.cgtTaxPer || 0;

    // 🔹 Load MenuItems for validation & price
    const menuItemIds = items.map((i) => i.menuItem).filter(Boolean);

    const menuDocs = await MenuItem.find({
      _id: { $in: menuItemIds },
      isAvailable: true,
    })
      .populate("dealItems.item")
      .lean();

    const menuMap = new Map(menuDocs.map((m) => [m._id.toString(), m]));

    // 🔹 Map existing order items for reuse
    const existingItemMap = new Map((order.items || []).map((i) => [i.menuItem.toString(), i]));

    // 🔥 BUILD FINAL ITEMS (SAFE)
    const finalItems = items
      .filter((i) => i.menuItem && menuMap.has(i.menuItem.toString()))
      .map((i) => {
        const menu = menuMap.get(i.menuItem.toString());
        const existingItem = existingItemMap.get(i.menuItem.toString());

        const qty = Number(i.qty) || 1;
        const isDeal = menu.type === "deal";

        const baseItem = {
          menuItem: menu._id,
          name: menu.name,
          price: menu.price,
          qty,
          notes: i.notes || "",
          isDeal,
        };

        // ✅ DEAL ITEMS RESOLUTION (CRITICAL)
        if (isDeal) {
          // 1️⃣ frontend sent dealItems
          if (Array.isArray(i.dealItems) && i.dealItems.length) {
            baseItem.dealItems = i.dealItems.map((d) => ({
              menuItem: d.menuItem,
              name: d.name,
              qty: Number(d.qty) || 1,
            }));
          }
          // 2️⃣ reuse existing order dealItems
          else if (existingItem?.dealItems?.length) {
            baseItem.dealItems = existingItem.dealItems;
          }
          // 3️⃣ fallback for newly added deal
          else if (Array.isArray(menu.dealItems)) {
            baseItem.dealItems = menu.dealItems.map((d) => ({
              menuItem: d.item?._id,
              name: d.item?.name || "",
              qty: d.quantity || 1,
            }));
          }
        }

        return baseItem;
      });

    // 🔹 Apply updates
    const orderDoc = await Order.findById(id);
    orderDoc.items = finalItems;

    if (typeof customerName !== "undefined") orderDoc.customerName = customerName;
    if (typeof customerPhone !== "undefined") orderDoc.customerPhone = customerPhone;
    if (typeof customerAddress !== "undefined") orderDoc.customerAddress = customerAddress;

    // 🔹 Recalculate totals
    const subtotal = finalItems.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);

    const discountAmount = applyDiscount ? Math.round((discountPer / 100) * subtotal) : 0;
    const cgtTaxAmount = applyCgtTax ? Math.round((cgtTaxPer / 100) * subtotal) : 0;

    orderDoc.applyDiscount = applyDiscount;
    orderDoc.discountPer = discountPer;
    orderDoc.discount = discountAmount;

    orderDoc.applyCgtTax = applyCgtTax;
    orderDoc.cgtTaxPer = cgtTaxPer;
    orderDoc.cgtTax = cgtTaxAmount;

    orderDoc.total = Math.round(subtotal - discountAmount + cgtTaxAmount);
    orderDoc.updatedBy = updatedBy;

    await orderDoc.save();

    res.json(orderDoc);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id/kitchen-print", requireSignin, async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          kitchenSlipPrinted: true,
          kitchenSlipPrintedAt: new Date(),
        },
        $inc: { kitchenSlipPrintCount: 1 },
      },
      { new: true }
    ).populate([
      // populate normal items -> menuItem -> category
      {
        path: "items.menuItem",
        select: "name price category", // optional
        populate: {
          path: "category",
        },
      },

      // populate dealItems -> menuItem -> category
      {
        path: "items.dealItems.menuItem",
        select: "name price category", // optional
        populate: {
          path: "category",
        },
      },
    ]);

    if (!updated) return res.status(404).json({ message: "Order not found" });

    // ✅ If you have socket.io attached to app:
    const io = req.app.get("io");
    if (io) io.emit("order:update", updated);

    return res.json(updated);
  } catch (err) {
    console.error("Error updating order kitchen print", err);
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
});

router.patch("/:id/payment-received", requireSignin, async (req, res) => {
  try {
    const { method, amount } = req.body;

    if (!["cash", "easypaisa"].includes(method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const order = await Order.findById(req.params.id).populate([
      // populate normal items -> menuItem -> category
      {
        path: "items.menuItem",
        select: "name price category", // optional
        populate: {
          path: "category",
        },
      },

      // populate dealItems -> menuItem -> category
      {
        path: "items.dealItems.menuItem",
        select: "name price category", // optional
        populate: {
          path: "category",
        },
      },
    ]);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.payment?.received) {
      return res.status(400).json({ message: "Payment already received" });
    }

    order.payment = {
      received: true,
      method,
      amount,
      receivedAt: new Date(),
    };

    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Error updating order payment received", err);
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
});

// Get single order (for printing)
router.get("/:id", requireSignin, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: "items.menuItem",
      populate: {
        path: "category",
        model: "Category",
      },
    })
    .populate({
      path: "items.dealItems.menuItem",
      populate: {
        path: "category",
        model: "Category",
      },
    });
  res.json(order);
});

router.post("/set/cash-opening", requireSignin, validate(orderValidation.setCashOpening), async (req, res) => {
  try {
    const { businessDate, amount } = req.body;
    if (!businessDate) throw new ApiError(httpStatus.BAD_REQUEST, "businessDate is required");

    // 1) check if exists
    const existing = await CashOpening.findOne({ businessDate }).select("_id");

    // 2) insert/update with correct user fields
    const doc = await CashOpening.findOneAndUpdate(
      { businessDate },
      existing
        ? {
            $set: { amount: Number(amount) || 0, updatedBy: req.user?._id },
          }
        : {
            $set: { amount: Number(amount) || 0 },
            $setOnInsert: { createdBy: req.user?._id, businessDate },
          },
      { upsert: true, new: true }
    );

    return res.status(200).send(doc);
  } catch (error) {
    return res.status(500).json({ message: error?.message || "Server error" });
  }
});

router.get("/get/cash-opening", requireSignin, async (req, res) => {
  try {
    const { businessDate } = req.query;

    if (!businessDate) {
      return res.status(400).json({ message: "businessDate is required" });
    }

    const doc = await CashOpening.findOne({ businessDate }).lean();

    // ✅ if not set, return null (frontend expects null)
    return res.json(doc || null);
  } catch (err) {
    console.error("getOpeningCash error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/create/bank-deposit", requireSignin, validate(orderValidation.createBankDeposit), async (req, res) => {
  try {
    const { businessDate, amount, bankName, referenceNo, notes } = req.body;
    if (!businessDate) throw new ApiError(400, "businessDate is required");
    if (!amount || Number(amount) <= 0) throw new ApiError(400, "amount must be > 0");

    const dep = await BankDeposit.create({
      businessDate,
      amount: Number(amount),
      bankName: bankName || "",
      referenceNo: referenceNo || "",
      notes: notes || "",
      createdBy: req.user?._id,
    });

    res.status(201).send(dep);
  } catch (error) {
    return res.status(500).json({ message: error?.message || "Server error" });
  }
});

router.get("/list/bank-deposit", requireSignin, async (req, res) => {
  const { businessDate } = req.query;
  const list = await BankDeposit.find({ businessDate }).sort({ createdAt: -1 });
  res.status(200).send({ results: list });
});

module.exports = router;
