// const { convertToInventoryUnit } = require("./unitConversion");
// const calculateIngredientCost = (ingredient, inventory) => {
//   try {
//     if (!inventory?.unitPrice || !inventory?.quantity) return 0;
//     const ingredientQtyInInventoryUnit = convertToInventoryUnit(ingredient.quantity, ingredient.unit, inventory.unit);
//     const costPerUnit = inventory.unitPrice / inventory.quantity;
//     const ingredientCost = ingredientQtyInInventoryUnit * costPerUnit;
//     return Number(ingredientCost.toFixed(4));
//   } catch (err) {
//     console.error(`❌ Cost calc failed for inventory ${inventory?._id}:`, err.message);
//     return 0;
//   }
// };

// module.exports = { calculateIngredientCost };

const { convertToInventoryUnit } = require("./unitConversion");

const calculateIngredientCost = (ingredient, inventory) => {
  try {
    // 🔒 basic guards
    if (!inventory) return 0;
    if (!inventory.unitPrice || inventory.unitPrice <= 0) return 0;
    if (!inventory.quantity || inventory.quantity <= 0) return 0;
    if (!ingredient?.quantity || ingredient.quantity <= 0) return 0;

    let ingredientQtyInInventoryUnit;

    try {
      // ✅ convert ingredient qty into inventory unit
      ingredientQtyInInventoryUnit = convertToInventoryUnit(ingredient.quantity, ingredient.unit, inventory.unit);
    } catch (err) {
      // ✅ silently skip incompatible units
      console.warn(`⚠️ Skipping incompatible units: ${ingredient.unit} → ${inventory.unit}`);
      return 0;
    }

    // 🔒 extra safety against bad conversions
    if (!isFinite(ingredientQtyInInventoryUnit) || ingredientQtyInInventoryUnit <= 0) {
      return 0;
    }

    // ✅ cost per inventory unit
    const costPerUnit = inventory.unitPrice / inventory.quantity;

    if (!isFinite(costPerUnit) || costPerUnit <= 0) return 0;

    // ✅ final ingredient cost
    const ingredientCost = ingredientQtyInInventoryUnit * costPerUnit;

    return Number(ingredientCost.toFixed(4));
  } catch (err) {
    console.error(`❌ Cost calc failed for inventory ${inventory?._id}:`, err.message);
    return 0;
  }
};

module.exports = { calculateIngredientCost };
