const cron = require("node-cron");
const { MenuItem } = require("../models");
const { calculateMenuItemSystemCost } = require("../services/menuCost.service");

const startMenuCostCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("🔄 Running menu system cost cron...");

      const menuItems = await MenuItem.find({
        ingredients: { $exists: true, $ne: [] },
      }).lean();

      for (const item of menuItems) {
        const newCost = await calculateMenuItemSystemCost(item);

        // ✅ update only when changed
        if (Number(item.systemCost || 0) !== newCost) {
          await MenuItem.updateOne({ _id: item._id }, { $set: { systemCost: newCost } });
        }
      }

      console.log("✅ Menu system cost cron completed");
    } catch (err) {
      console.error("❌ Menu cost cron error:", err);
    }
  });
};

module.exports = startMenuCostCron;
