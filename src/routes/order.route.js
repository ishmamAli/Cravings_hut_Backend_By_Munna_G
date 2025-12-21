const express = require("express");
const Order = require("../models/order.model.js");
const MenuItem = require("../models/menuItem.model.js");
const { requireSignin } = require("../middlewares/auth.js");

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
    } = req.body;

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

// Update status (kitchen)
router.patch("/:id/status", requireSignin, async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const allowedStatus = ["PENDING", "IN_PROGRESS", "DONE"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Prepare updated data
    const updatedData = { status };

    if (status === "DONE") {
      updatedData.endTime = new Date(); // set current time
    } else {
      updatedData.endTime = null; // reset when not DONE
    }

    // Update order
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updatedData }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("order:update", order);
    }
    res.json(order);
  } catch (err) {
    console.error("Error updating order:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH /admin/order/:id
router.patch("/:id/modify", requireSignin, async (req, res) => {
  try {
    const { id } = req.params;
    let { applyDiscount, discountPer, applyCgtTax, cgtTaxPer, items, customerName, customerPhone, customerAddress } =
      req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const clamp = (v) => {
      const n = Number(v) || 0;
      return Math.min(30, Math.max(0, n));
    };

    if (typeof applyDiscount === "undefined") {
      applyDiscount = order.applyDiscount;
    }
    if (typeof applyCgtTax === "undefined") {
      applyCgtTax = order.applyCgtTax;
    }

    discountPer = discountPer != null ? clamp(discountPer) : order.discountPer || 0;
    cgtTaxPer = cgtTaxPer != null ? clamp(cgtTaxPer) : order.cgtTaxPer || 0;

    // 🔹 If client sends items, rebuild order.items from MenuItem (including full deal info, like POST /)
    if (Array.isArray(items)) {
      const menuItemIds = items.map((i) => i.menuItem).filter(Boolean);

      // IMPORTANT: populate dealItems.item so we can read name/ids same as create order
      const menuDocs = await MenuItem.find({
        _id: { $in: menuItemIds },
        isAvailable: true,
      }).populate("dealItems.item");

      const menuMap = new Map(menuDocs.map((m) => [m._id.toString(), m]));

      const sanitizedItems = items
        .filter((i) => i.menuItem && menuMap.has(i.menuItem.toString()))
        .map((i) => {
          const m = menuMap.get(i.menuItem.toString());
          const qty = Number(i.qty) || 1;

          // same logic as POST /
          const isDeal = m.type === "deal";

          let dealItems = [];
          if (isDeal && Array.isArray(m.dealItems)) {
            dealItems = m.dealItems.map((d) => ({
              menuItem: d.item?._id || d.item,
              name: d.item?.name || "",
              qty: d.quantity || d.qty || 1,
            }));
          }

          const baseItem = {
            menuItem: m._id,
            name: m.name,
            price: m.price, // deal price if deal
            qty,
            notes: i.notes || "",
            isDeal,
          };

          if (dealItems.length) {
            baseItem.dealItems = dealItems;
          }

          return baseItem;
        });

      order.items = sanitizedItems;
    }

    // Customer info
    if (typeof customerName !== "undefined") {
      order.customerName = customerName;
    }
    if (typeof customerPhone !== "undefined") {
      order.customerPhone = customerPhone;
    }
    if (typeof customerAddress !== "undefined") {
      order.customerAddress = customerAddress;
    }

    const subtotal = (order.items || []).reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);

    const discountAmount = applyDiscount ? Math.round((discountPer / 100) * subtotal) : 0;
    const cgtTaxAmount = applyCgtTax ? Math.round((cgtTaxPer / 100) * subtotal) : 0;

    const finalTotal = Math.round(subtotal - discountAmount + cgtTaxAmount);

    order.applyDiscount = applyDiscount;
    order.discountPer = discountPer;
    order.discount = discountAmount;

    order.applyCgtTax = applyCgtTax;
    order.cgtTaxPer = cgtTaxPer;
    order.cgtTax = cgtTaxAmount;

    order.total = finalTotal;

    await order.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("order:update", order);
    }

    res.json(order);
  } catch (err) {
    console.error("Error updating order", err);
    res.status(500).json({ message: "Internal server error" });
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

module.exports = router;
