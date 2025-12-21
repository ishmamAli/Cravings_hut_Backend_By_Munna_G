const UNIT_GROUPS = {
  weight: ["g", "kg"],
  volume: ["ml", "l"],
  pcs: ["pcs"],
};

const CONVERSION = {
  g: { g: 1, kg: 1 / 1000 },
  kg: { g: 1000, kg: 1 },
  ml: { ml: 1, l: 1 / 1000 },
  l: { ml: 1000, l: 1 },
  pcs: { pcs: 1 },
};

const getUnitGroup = (unit) => {
  if (UNIT_GROUPS.weight.includes(unit)) return "weight";
  if (UNIT_GROUPS.volume.includes(unit)) return "volume";
  if (UNIT_GROUPS.pcs.includes(unit)) return "pcs";
  return null;
};

const convertToInventoryUnit = (quantity, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return quantity;

  const groupFrom = getUnitGroup(fromUnit);
  const groupTo = getUnitGroup(toUnit);

  if (!groupFrom || !groupTo || groupFrom !== groupTo) {
    throw new Error(`Incompatible units: cannot convert ${fromUnit} to ${toUnit}`);
  }

  const map = CONVERSION[fromUnit];
  const factor = map[toUnit];

  if (factor === undefined) {
    throw new Error(`Conversion not defined from ${fromUnit} to ${toUnit}`);
  }

  return quantity * factor;
};

module.exports = { convertToInventoryUnit };
