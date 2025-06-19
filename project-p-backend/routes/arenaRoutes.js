const express = require("express");
const router = express.Router();
const Character = require("../models/Character");
const {
  getPlayerStats,
  getStatsForClass,
  getEquipmentStatTotals,
  calculateCombatScore,
  simulateCombat,
} = require("../utils/combat");
const { logStat } = require("../utils/statsLogger");

const MAX_HISTORY_ENTRIES = 100;

function resetArenaCounters(char) {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let updated = false;
  if (!char.arenaFightReset || char.arenaFightReset < todayUTC) {
    char.dailyArenaFights = 0;
    char.arenaFightReset = now;
    updated = true;
  }
  if (!char.arenaRefreshReset || char.arenaRefreshReset < todayUTC) {
    char.dailyArenaRefreshes = 0;
    char.arenaRefreshReset = now;
    updated = true;
  }
  return updated;
}

function shuffle(arr) {
  return arr
    .map((a) => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1]);
}

function logArenaHistory(char, opponentName, result, mmrChange) {
  const entry = {
    questName: "Arena Battle",
    questType: "arena",
    opponentName,
    result,
    mmrChange,
    timestamp: new Date(),
  };
  if (!char.history) char.history = [];
  char.history.push(entry);
  if (char.history.length > MAX_HISTORY_ENTRIES) char.history.shift();
}

// Fetch arena profile for a character
router.get("/profile/:id", async (req, res) => {
  try {
    const char = await Character.findById(req.params.id);
    if (!char) return res.status(404).json({ error: "Character not found" });
    let updated = resetArenaCounters(char);
    if (!char.hasEnteredArena) {
      char.hasEnteredArena = true;
      updated = true;
    }
    if (updated) await char.save();
    const base = getStatsForClass(char.class, char.level);
    const equip = getEquipmentStatTotals(char);
    const combatScore = calculateCombatScore(char.level, base, equip);
    res.json({
      mmr: char.mmr || 1000,
      wins: char.arenaWins || 0,
      losses: char.arenaLosses || 0,
      combatScore,
      fightsRemaining: Math.max(0, 5 - (char.dailyArenaFights || 0)),
      refreshesRemaining: Math.max(0, 3 - (char.dailyArenaRefreshes || 0)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a list of potential opponents for a character
router.get("/opponents/:id", async (req, res) => {
  try {
    const char = await Character.findById(req.params.id);
    if (!char) return res.status(404).json({ error: "Character not found" });
    if (resetArenaCounters(char)) await char.save();

    const mmr = char.mmr || 1000;

    const candidates = await Character.find({
      _id: { $ne: char._id },
      mmr: { $gte: mmr - 200, $lte: mmr + 200 },
      hasEnteredArena: true,
    }).lean();

    const shuffled = shuffle(candidates);
    const max = Math.min(shuffled.length, 5);
    const min = Math.min(3, max);
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const selected = shuffled.slice(0, count);

    const result = selected.map((op) => {
      const base = getStatsForClass(op.class, op.level);
      const equip = getEquipmentStatTotals(op);
      const combatScore = calculateCombatScore(op.level, base, equip);
      return {
        id: op._id,
        name: op.name,
        class: op.class,
        level: op.level,
        mmr: op.mmr || 1000,
        combatScore,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Refresh the list of opponents and count towards daily limit
router.post("/opponents/:id/refresh", async (req, res) => {
  try {
    const char = await Character.findById(req.params.id);
    if (!char) return res.status(404).json({ error: "Character not found" });
    if (resetArenaCounters(char)) await char.save();
    if ((char.dailyArenaRefreshes || 0) >= 3) {
      return res.status(400).json({ error: "No more refreshes today" });
    }
    char.dailyArenaRefreshes = (char.dailyArenaRefreshes || 0) + 1;

    const mmr = char.mmr || 1000;
    const candidates = await Character.find({
      _id: { $ne: char._id },
      mmr: { $gte: mmr - 200, $lte: mmr + 200 },
      hasEnteredArena: true,
    }).lean();

    const shuffled = shuffle(candidates);
    const max = Math.min(shuffled.length, 5);
    const min = Math.min(3, max);
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const selected = shuffled.slice(0, count);

    const result = selected.map((op) => {
      const base = getStatsForClass(op.class, op.level);
      const equip = getEquipmentStatTotals(op);
      const combatScore = calculateCombatScore(op.level, base, equip);
      return {
        id: op._id,
        name: op.name,
        class: op.class,
        level: op.level,
        mmr: op.mmr || 1000,
        combatScore,
      };
    });
    await char.save();
    res.json({ opponents: result, refreshesRemaining: Math.max(0, 3 - char.dailyArenaRefreshes) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start an arena match and return the result
router.post("/match/:id", async (req, res) => {
  try {
    const char = await Character.findById(req.params.id);
    if (!char) return res.status(404).json({ error: "Character not found" });
    if (resetArenaCounters(char)) await char.save();
    if ((char.dailyArenaFights || 0) >= 5) {
      return res.status(400).json({ error: "Daily arena fight limit reached" });
    }
    const mmr = char.mmr || 1000;

    const ranges = [100, 200, 400, 800];
    let opponent = null;
    for (const r of ranges) {
      opponent = await Character.findOne({
        _id: { $ne: char._id },
        mmr: { $gte: mmr - r, $lte: mmr + r },
        hasEnteredArena: true,
      }).lean();
      if (opponent) break;
    }
    if (!opponent) {
      opponent = await Character.findOne({
        _id: { $ne: char._id },
        hasEnteredArena: true,
      }).lean();
      if (!opponent) return res.status(400).json({ error: "No opponents" });
    }

    const playerStats = getPlayerStats(char);
    const opponentChar = await Character.findById(opponent._id);
    if (resetArenaCounters(opponentChar)) await opponentChar.save();
    const oppStats = getPlayerStats(opponentChar);
    const combat = simulateCombat(playerStats, { ...oppStats, name: opponentChar.name });
    logStat({
      type: "combat",
      timestamp: Date.now(),
      playerId: char._id,
      class: char.class,
      level: char.level,
      win: combat.result === "win",
      rounds: combat.rounds,
      damageTaken: playerStats.VIT * 10 - combat.playerHP,
      enemyType: opponentChar.name,
    });
    logStat({
      type: "combat",
      timestamp: Date.now(),
      playerId: opponentChar._id,
      class: opponentChar.class,
      level: opponentChar.level,
      win: combat.result !== "win",
      rounds: combat.rounds,
      damageTaken: oppStats.VIT * 10 - combat.enemyHP,
      enemyType: char.name,
    });

    const DELTA = 30;
    if (combat.result === "win") {
      char.mmr = (char.mmr || 1000) + DELTA;
      char.arenaWins = (char.arenaWins || 0) + 1;
      opponentChar.mmr = (opponentChar.mmr || 1000) - DELTA;
      opponentChar.arenaLosses = (opponentChar.arenaLosses || 0) + 1;
    } else {
      char.mmr = (char.mmr || 1000) - DELTA;
      char.arenaLosses = (char.arenaLosses || 0) + 1;
      opponentChar.mmr = (opponentChar.mmr || 1000) + DELTA;
      opponentChar.arenaWins = (opponentChar.arenaWins || 0) + 1;
    }
    const mmrChange = combat.result === "win" ? DELTA : -DELTA;
    logArenaHistory(char, opponentChar.name, combat.result, mmrChange);
    logArenaHistory(opponentChar, char.name, combat.result === "win" ? "loss" : "win", -mmrChange);
    char.dailyArenaFights = (char.dailyArenaFights || 0) + 1;
    opponentChar.dailyArenaFights = (opponentChar.dailyArenaFights || 0) + 1;
    await char.save();
    await opponentChar.save();

    const base = getStatsForClass(char.class, char.level);
    const equip = getEquipmentStatTotals(char);
    const combatScore = calculateCombatScore(char.level, base, equip);
    const baseO = getStatsForClass(opponentChar.class, opponentChar.level);
    const equipO = getEquipmentStatTotals(opponentChar);
    const combatScoreO = calculateCombatScore(opponentChar.level, baseO, equipO);

    res.json({
      result: combat.result,
      log: combat.log,
      player: {
        mmr: char.mmr,
        wins: char.arenaWins,
        losses: char.arenaLosses,
        combatScore,
      },
      opponent: {
        id: opponentChar._id,
        name: opponentChar.name,
        mmr: opponentChar.mmr,
        combatScore: combatScoreO,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Challenge a specific opponent
router.post("/challenge/:id/:oppId", async (req, res) => {
  try {
    const char = await Character.findById(req.params.id);
    const opponentChar = await Character.findById(req.params.oppId);
    if (!char || !opponentChar)
      return res.status(404).json({ error: "Character not found" });
    if (resetArenaCounters(char)) await char.save();
    if (resetArenaCounters(opponentChar)) await opponentChar.save();
    if ((char.dailyArenaFights || 0) >= 5) {
      return res.status(400).json({ error: "Daily arena fight limit reached" });
    }

    if (String(char._id) === String(opponentChar._id)) {
      return res.status(400).json({ error: "Cannot fight yourself" });
    }

    const playerStats = getPlayerStats(char);
    const oppStats = getPlayerStats(opponentChar);
    const combat = simulateCombat(playerStats, {
      ...oppStats,
      name: opponentChar.name,
    });
    logStat({
      type: "combat",
      timestamp: Date.now(),
      playerId: char._id,
      class: char.class,
      level: char.level,
      win: combat.result === "win",
      rounds: combat.rounds,
      damageTaken: playerStats.VIT * 10 - combat.playerHP,
      enemyType: opponentChar.name,
    });
    logStat({
      type: "combat",
      timestamp: Date.now(),
      playerId: opponentChar._id,
      class: opponentChar.class,
      level: opponentChar.level,
      win: combat.result !== "win",
      rounds: combat.rounds,
      damageTaken: oppStats.VIT * 10 - combat.enemyHP,
      enemyType: char.name,
    });

    const DELTA = 30;
    if (combat.result === "win") {
      char.mmr = (char.mmr || 1000) + DELTA;
      char.arenaWins = (char.arenaWins || 0) + 1;
      opponentChar.mmr = (opponentChar.mmr || 1000) - DELTA;
      opponentChar.arenaLosses = (opponentChar.arenaLosses || 0) + 1;
    } else {
      char.mmr = (char.mmr || 1000) - DELTA;
      char.arenaLosses = (char.arenaLosses || 0) + 1;
      opponentChar.mmr = (opponentChar.mmr || 1000) + DELTA;
      opponentChar.arenaWins = (opponentChar.arenaWins || 0) + 1;
    }
    const mmrChange = combat.result === "win" ? DELTA : -DELTA;
    logArenaHistory(char, opponentChar.name, combat.result, mmrChange);
    logArenaHistory(opponentChar, char.name, combat.result === "win" ? "loss" : "win", -mmrChange);
    char.dailyArenaFights = (char.dailyArenaFights || 0) + 1;
    opponentChar.dailyArenaFights = (opponentChar.dailyArenaFights || 0) + 1;
    await char.save();
    await opponentChar.save();

    const base = getStatsForClass(char.class, char.level);
    const equip = getEquipmentStatTotals(char);
    const combatScore = calculateCombatScore(char.level, base, equip);
    const baseO = getStatsForClass(opponentChar.class, opponentChar.level);
    const equipO = getEquipmentStatTotals(opponentChar);
    const combatScoreO = calculateCombatScore(opponentChar.level, baseO, equipO);

    res.json({
      result: combat.result,
      log: combat.log,
      player: {
        mmr: char.mmr,
        wins: char.arenaWins,
        losses: char.arenaLosses,
        combatScore,
      },
      opponent: {
        id: opponentChar._id,
        name: opponentChar.name,
        mmr: opponentChar.mmr,
        combatScore: combatScoreO,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;