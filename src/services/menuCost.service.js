const { Inventory } = require("../models");
const { calculateIngredientCost } = require("../utils/ingredientCost");

const calculateMenuItemSystemCost = async (menuItem) => {
  if (!menuItem.ingredients?.length) return 0;

  let totalCost = 0;

  // 🔹 batch fetch inventories (IMPORTANT optimization)
  const inventoryIds = menuItem.ingredients.map((i) => i.inventoryItem);

  const inventories = await Inventory.find({
    _id: { $in: inventoryIds },
  }).lean();

  const inventoryMap = new Map(inventories.map((inv) => [inv._id.toString(), inv]));

  // 🔹 calculate each ingredient cost
  for (const ing of menuItem.ingredients) {
    const inventory = inventoryMap.get(ing.inventoryItem.toString());
    if (!inventory) continue;

    const cost = calculateIngredientCost(ing, inventory);
    totalCost += cost;
  }

  return Number(totalCost.toFixed(2));
};

module.exports = { calculateMenuItemSystemCost };
