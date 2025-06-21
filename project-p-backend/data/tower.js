const ITEMS = require('./items');
const { getRarityByTowerLevel } = require('../utils/rarityUtils');

function getRewardForLevel(level) {
  const base = ITEMS[level % ITEMS.length];
  return {
    ...base,
    name: `${base.name} of the Tower`,
    rarity: getRarityByTowerLevel(level),
  };
}

function getEnemyForLevel(level) {
  return {
    name: `Tower Guardian ${level}`,
    level,
    STR: 5 + level * 2,
    AGI: 4 + level * 2,
    INT: 3 + level,
    VIT: 6 + level * 2,
  };
}

module.exports = { getRewardForLevel, getEnemyForLevel };
