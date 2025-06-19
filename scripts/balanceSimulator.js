const { simulateCombat, getStatsForClass } = require('../project-p-backend/utils/combat');
const { generateEnemy } = require('../project-p-backend/utils/enemyGenerator');
const { SAFE_QUEST_TIERS, RISKY_QUEST_TIERS } = require('../project-p-backend/data/quests');
const { XP_GAIN_MULTIPLIER, GOLD_SCALING } = require('../project-p-backend/utils/balanceConfig');

function runBattles(levels = 50, perLevel = 200) {
  const results = [];
  for (let lvl = 1; lvl <= levels; lvl++) {
    let wins = 0;
    let totalRounds = 0;
    for (let i = 0; i < perLevel; i++) {
      const player = { class: 'Warrior', level: lvl };
      const pStats = getStatsForClass(player.class, player.level);
      const enemy = generateEnemy(player);
      const combat = simulateCombat(pStats, enemy);
      if (combat.result === 'win') wins++;
      totalRounds += combat.rounds;
    }
    results.push({ level: lvl, winRate: wins / perLevel, avgRounds: totalRounds / perLevel });
  }
  return results;
}

function scaleReward(value, level, factor) {
  return Math.round(value * (1 + factor * (level - 1)));
}

function randomQuest(level) {
  const pool = Math.random() < 0.5 ? SAFE_QUEST_TIERS : RISKY_QUEST_TIERS;
  const tier = Math.floor(Math.random() * pool.length);
  const q = pool[tier][Math.floor(Math.random() * pool[tier].length)];
  return {
    duration: q.duration,
    xp: scaleReward(q.xp, level, XP_GAIN_MULTIPLIER),
    gold: scaleReward(q.gold, level, GOLD_SCALING),
    isCombat: q.isCombat,
  };
}

function runQuests(trials = 5000) {
  let totalXp = 0;
  let totalGold = 0;
  let totalTime = 0;
  for (let i = 0; i < trials; i++) {
    const level = 1 + Math.floor(Math.random() * 50);
    const quest = randomQuest(level);
    totalXp += quest.xp;
    totalGold += quest.gold;
    totalTime += quest.duration;
    if (quest.isCombat) {
      const player = { class: 'Warrior', level };
      const pStats = getStatsForClass(player.class, player.level);
      const enemy = generateEnemy(player);
      simulateCombat(pStats, enemy);
    }
  }
  return {
    avgXp: totalXp / trials,
    avgGold: totalGold / trials,
    avgDuration: totalTime / trials,
  };
}

console.log('Battle simulation (levels 1-50):');
console.log(runBattles());
console.log('Quest simulation:');
console.log(runQuests());
