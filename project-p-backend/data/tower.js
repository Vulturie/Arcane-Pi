const ITEMS = require('./items');

function getRewardRarity(level) {
  if (level >= 120) return 'legendary';
  if (level >= 80) return 'epic';
  if (level >= 50) return 'rare';
  if (level >= 20) return 'uncommon';
  return 'common';
}

function getRewardForLevel(level) {
  const base = ITEMS[level % ITEMS.length];
  return {
    ...base,
    name: `${base.name} of the Tower`,
    rarity: getRewardRarity(level),
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
