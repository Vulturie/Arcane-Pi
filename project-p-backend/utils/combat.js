// Utility functions for calculating stats and running simple auto-combat

const RARITY_MULTIPLIER = {
  common: 1,
  uncommon: 1.2,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.0,
};

const CLASS_BASE_STATS = {
  Warrior: { STR: 7, AGI: 4, INT: 2, VIT: 7 },
  Rogue: { STR: 5, AGI: 8, INT: 2, VIT: 5 },
  Assassin: { STR: 6, AGI: 7, INT: 2, VIT: 5 },
  Mage: { STR: 2, AGI: 4, INT: 9, VIT: 5 },
  // Fallback for characters that haven't chosen a class yet
  Novice: { STR: 3, AGI: 3, INT: 3, VIT: 3 },
};

const CLASS_GROWTH = {
  Warrior: { STR: 2, AGI: 1, INT: 0, VIT: 2 },
  Rogue: { STR: 1, AGI: 2, INT: 0, VIT: 1 },
  Assassin: { STR: 2, AGI: 2, INT: 0, VIT: 1 },
  Mage: { STR: 0, AGI: 1, INT: 3, VIT: 1 },
  Novice: { STR: 1, AGI: 1, INT: 1, VIT: 1 },
};

function getStatsForClass(className, level) {
  const base = CLASS_BASE_STATS[className] || CLASS_BASE_STATS.Novice;
  const growth = CLASS_GROWTH[className] || CLASS_GROWTH.Novice;

  return {
    STR: base.STR + growth.STR * (level - 1),
    AGI: base.AGI + growth.AGI * (level - 1),
    INT: base.INT + growth.INT * (level - 1),
    VIT: base.VIT + growth.VIT * (level - 1),
  };
}

// Combine base stats with bonuses from equipped items
function getPlayerStats(player) {
  const stats = getStatsForClass(player.class, player.level);

  if (player.equippedItems) {
    Object.values(player.equippedItems).forEach((item) => {
      if (item && item.statBonus) {
        const mult = RARITY_MULTIPLIER[item.rarity] || 1;
        Object.entries(item.statBonus).forEach(([k, v]) => {
          stats[k] = (stats[k] || 0) + v * mult;
        });
      }
    });
  }

  return stats;
}

// Sum up stat bonuses provided by equipped items
function getEquipmentStatTotals(player) {
  const totals = { STR: 0, AGI: 0, INT: 0, VIT: 0 };
  if (player.equippedItems) {
    Object.values(player.equippedItems).forEach((item) => {
      if (item && item.statBonus) {
        const mult = RARITY_MULTIPLIER[item.rarity] || 1;
        Object.entries(item.statBonus).forEach(([k, v]) => {
          totals[k] = (totals[k] || 0) + v * mult;
        });
      }
    });
  }
  return totals;
}

// Calculate a simple combat score used for scaling enemies
function calculateCombatScore(level, baseStats, equipStats) {
  const baseTotal = Object.values(baseStats).reduce((a, b) => a + b, 0);
  const equipTotal = Object.values(equipStats).reduce((a, b) => a + b, 0);
  return Math.round(level * 2 + baseTotal + equipTotal);
}

function calculateDamage(attacker, defender) {
  const baseDamage = attacker.STR * 2;
  const mitigation = defender.VIT * 0.5;
  const damage = Math.max(1, baseDamage - mitigation);
  return Math.round(damage);
}

function simulateCombat(playerStats, enemyStats) {
  const log = [];
  let playerHP = playerStats.VIT * 10;
  let enemyHP = enemyStats.VIT * 10;

  // Determine who goes first based on AGI
  let playerTurn = playerStats.AGI >= enemyStats.AGI;

  const DODGE_RATE = 0.02; // 2% dodge chance per AGI point
  const MAX_DODGE = 0.9; // never reach 100% dodge
  const MAX_ROUNDS = 1000; // safety cap to prevent infinite loops
  let rounds = 0;

  while (playerHP > 0 && enemyHP > 0 && rounds < MAX_ROUNDS) {
    if (playerTurn) {
      const dodgeChance = Math.min(enemyStats.AGI * DODGE_RATE, MAX_DODGE);
      if (Math.random() < dodgeChance) {
        log.push(`Player attacks but ${enemyStats.name} dodges!`);
      } else {
        const dmg = calculateDamage(playerStats, enemyStats);
        enemyHP = Math.max(0, enemyHP - dmg);
        log.push(`Player hits ${enemyStats.name} for ${dmg} damage (Enemy HP: ${enemyHP})`);
      }
    } else {
      const dodgeChance = Math.min(playerStats.AGI * DODGE_RATE, MAX_DODGE);
      if (Math.random() < dodgeChance) {
        log.push(`${enemyStats.name} attacks but player dodges!`);
      } else {
        const dmg = calculateDamage(enemyStats, playerStats);
        playerHP = Math.max(0, playerHP - dmg);
        log.push(`${enemyStats.name} hits player for ${dmg} damage (Player HP: ${playerHP})`);
      }
    }
    playerTurn = !playerTurn;
    rounds += 1;
  }

  const result = playerHP > 0 ? "win" : "loss";

  return {
    result,
    log,
    playerHP,
    enemyHP,
    rounds,
  };
}

module.exports = {
  CLASS_BASE_STATS,
  CLASS_GROWTH,
  getStatsForClass,
  getPlayerStats,
  getEquipmentStatTotals,
  calculateCombatScore,
  calculateDamage,
  simulateCombat,
};
