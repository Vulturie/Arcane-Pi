const { getStatsForClass, getEquipmentStatTotals, calculateCombatScore } = require("./combat");

function generateEnemy(player, difficulty = 1) {
  const baseStats = getStatsForClass(player.class, player.level);
  const equipStats = getEquipmentStatTotals(player);
  const combatScore = calculateCombatScore(player.level, baseStats, equipStats);

  // Random factor to keep encounters varied
  const randomness = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
  const scale = difficulty * randomness;

  const base = Math.max(1, Math.round((combatScore / 10) * scale));
  return {
    name: "Goblin Raider",
    level: player.level,
    STR: base + Math.floor(Math.random() * 3),
    AGI: base + Math.floor(Math.random() * 3),
    INT: base + Math.floor(Math.random() * 2),
    VIT: base + Math.floor(Math.random() * 4),
  };
}

module.exports = { generateEnemy };