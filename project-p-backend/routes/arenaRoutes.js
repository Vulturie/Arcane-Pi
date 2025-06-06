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

function shuffle(arr) {
  return arr
    .map((a) => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1]);
}

// Fetch arena profile for a character
router.get("/profile/:id", async (req, res) => {
  try {
    const char = await Character.findById(req.params.id);
    if (!char) return res.status(404).json({ error: "Character not found" });
    const base = getStatsForClass(char.class, char.level);
    const equip = getEquipmentStatTotals(char);
    const combatScore = calculateCombatScore(char.level, base, equip);
    res.json({
      mmr: char.mmr || 1000,
      wins: char.arenaWins || 0,
      losses: char.arenaLosses || 0,
      combatScore,
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

    const mmr = char.mmr || 1000;

    const candidates = await Character.find({
      _id: { $ne: char._id },
      mmr: { $gte: mmr - 200, $lte: mmr + 200 },
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

// Start an arena match and return the result
router.post("/match/:id", async (req, res) => {
  try {
    const char = await Character.findById(req.params.id);
    if (!char) return res.status(404).json({ error: "Character not found" });
    const mmr = char.mmr || 1000;

    const ranges = [100, 200, 400, 800];
    let opponent = null;
    for (const r of ranges) {
      opponent = await Character.findOne({
        _id: { $ne: char._id },
        mmr: { $gte: mmr - r, $lte: mmr + r },
      }).lean();
      if (opponent) break;
    }
    if (!opponent) {
      opponent = await Character.findOne({ _id: { $ne: char._id } }).lean();
      if (!opponent) return res.status(400).json({ error: "No opponents" });
    }

    const playerStats = getPlayerStats(char);
    const opponentChar = await Character.findById(opponent._id);
    const oppStats = getPlayerStats(opponentChar);
    const combat = simulateCombat(playerStats, { ...oppStats, name: opponentChar.name });

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

    if (String(char._id) === String(opponentChar._id)) {
      return res.status(400).json({ error: "Cannot fight yourself" });
    }

    const playerStats = getPlayerStats(char);
    const oppStats = getPlayerStats(opponentChar);
    const combat = simulateCombat(playerStats, {
      ...oppStats,
      name: opponentChar.name,
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