// Utility functions for calculating stats and running simple auto-combat

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
        Object.entries(item.statBonus).forEach(([k, v]) => {
          stats[k] = (stats[k] || 0) + v;
        });
      }
    });
  }

  return stats;
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

  while (playerHP > 0 && enemyHP > 0) {
    if (playerTurn) {
      if (Math.random() < enemyStats.AGI * 0.02) {
        log.push(`Player attacks but ${enemyStats.name} dodges!`);
      } else {
        const dmg = calculateDamage(playerStats, enemyStats);
        enemyHP = Math.max(0, enemyHP - dmg);
        log.push(`Player hits ${enemyStats.name} for ${dmg} damage (Enemy HP: ${enemyHP})`);
      }
    } else {
      if (Math.random() < playerStats.AGI * 0.02) {
        log.push(`${enemyStats.name} attacks but player dodges!`);
      } else {
        const dmg = calculateDamage(enemyStats, playerStats);
        playerHP = Math.max(0, playerHP - dmg);
        log.push(`${enemyStats.name} hits player for ${dmg} damage (Player HP: ${playerHP})`);
      }
    }
    playerTurn = !playerTurn;
  }

  const result = playerHP > 0 ? "win" : "loss";

  return {
    result,
    log,
    playerHP,
    enemyHP,
  };
}

module.exports = {
  CLASS_BASE_STATS,
  CLASS_GROWTH,
  getStatsForClass,
  getPlayerStats,
  calculateDamage,
  simulateCombat,
};