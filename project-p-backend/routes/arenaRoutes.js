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

module.exports = router;