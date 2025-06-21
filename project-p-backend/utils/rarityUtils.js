const crypto = require('crypto');

const INCREMENT_PER_LEVEL = {
  legendary: 0.2, // percentage points per level
  rare: 0.5,
  epic: 1.0,
  uncommon: 1.5,
};

function calculateRarityDistribution(level, _context = 'quest') {
  const dist = {
    legendary: level * INCREMENT_PER_LEVEL.legendary,
    rare: level * INCREMENT_PER_LEVEL.rare,
    epic: level * INCREMENT_PER_LEVEL.epic,
    uncommon: level * INCREMENT_PER_LEVEL.uncommon,
    common: 0,
  };
  let total =
    dist.legendary + dist.rare + dist.epic + dist.uncommon;
  if (total < 100) {
    dist.common = 100 - total;
    return dist;
  }
  dist.common = 0;
  let excess = total - 100;
  const order = ['uncommon', 'epic', 'rare', 'legendary'];
  for (const r of order) {
    if (excess <= 0) break;
    const take = Math.min(dist[r], excess);
    dist[r] -= take;
    excess -= take;
  }
  return dist;
}

function getWeightedRarity(dist) {
  const rand = crypto.randomInt(0, 100000) / 1000; // 0..100 with precision
  let cumulative = 0;
  for (const [rarity, weight] of Object.entries(dist)) {
    cumulative += weight;
    if (rand < cumulative) return rarity;
  }
  return 'common';
}

function getRarityByPlayerLevel(level) {
  const dist = calculateRarityDistribution(level, 'player');
  return getWeightedRarity(dist);
}

function getRarityByTowerLevel(level) {
  const dist = calculateRarityDistribution(level, 'tower');
  return getWeightedRarity(dist);
}

module.exports = {
  calculateRarityDistribution,
  getRarityByPlayerLevel,
  getRarityByTowerLevel,
  getWeightedRarity,
};
