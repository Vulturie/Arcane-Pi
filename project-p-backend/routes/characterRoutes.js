const express = require("express");
const router = express.Router();
const Character = require("../models/Character");
const { generateEnemy } = require("../utils/enemyGenerator");
const { getStatsForClass, simulateCombat } = require("../utils/combat");

const getXpForNextLevel = (level) => 100 + (level - 1) * 50;

function logHistory(char, quest, combatResult) {
  const entry = {
    questName: quest.name,
    result: combatResult ? combatResult.result : "completed",
    playerHP: combatResult ? combatResult.playerHP : undefined,
    enemyHP: combatResult ? combatResult.enemyHP : undefined,
    enemyName: combatResult ? quest.enemy.name : undefined,
    timestamp: new Date(),
  };
  if (!char.history) char.history = [];
  char.history.push(entry);
  if (char.history.length > 20) char.history.shift();
}

// GET /account/:owner/characters
router.get("/account/:owner/characters", async (req, res) => {
  const { owner } = req.params;
  try {
    const chars = await Character.find({ owner });
    res.json(chars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /account/:owner/characters
router.post("/account/:owner/characters", async (req, res) => {
  const { owner } = req.params;
  const { name, className } = req.body;
  try {
    const count = await Character.countDocuments({ owner });
    if (count >= 4) return res.status(400).json({ error: "Character limit reached" });

    const trimmed = name ? name.trim() : "";
    if (!trimmed || trimmed.length < 3 || trimmed.length > 15) {
      return res.status(400).json({ error: "Name must be between 3 and 15 characters" });
    }

    const existing = await Character.findOne({ name: new RegExp(`^${trimmed}$`, "i") });
    if (existing) {
      return res.status(400).json({ error: "Name already taken" });
    }

    const character = await Character.create({ owner, name: trimmed, class: className });
    res.json(character);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Name already taken" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /characters/:id
router.delete("/characters/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Character.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Middleware to load character by ID
async function loadCharacter(req, res, next) {
  try {
    const char = await Character.findById(req.params.id);
    if (!char) return res.status(404).json({ error: "Character not found" });
    // Energy regeneration
    const now = new Date();
    const elapsed = (now - new Date(char.lastEnergyUpdate)) / 1000;
    const ENERGY_REGEN_INTERVAL = 10;
    const MAX_ENERGY = 100;
    const energyToAdd = Math.floor(elapsed / ENERGY_REGEN_INTERVAL);
    if (energyToAdd > 0 && char.energy < MAX_ENERGY) {
      char.energy = Math.min(char.energy + energyToAdd, MAX_ENERGY);
      char.lastEnergyUpdate = new Date(now - (elapsed % ENERGY_REGEN_INTERVAL) * 1000);
      await char.save();
    }
    req.character = char;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

// GET /characters/:id
router.get("/characters/:id", loadCharacter, (req, res) => {
  res.json(req.character);
});

// POST /characters/:id/class
router.post("/characters/:id/class", loadCharacter, async (req, res) => {
  const { className } = req.body;
  try {
    req.character.class = className;
    await req.character.save();
    res.json(req.character);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /characters/:id/energy
router.post("/characters/:id/energy", loadCharacter, async (req, res) => {
  const { energy } = req.body;
  try {
    req.character.energy = energy;
    req.character.lastEnergyUpdate = new Date();
    await req.character.save();
    res.json(req.character);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /characters/:id/quest/status
router.get("/characters/:id/quest/status", loadCharacter, async (req, res) => {
  const char = req.character;
  const quest = char.activeQuest;
  if (!quest) return res.json({ quest: null });
  const now = new Date();
  const startedAt = new Date(quest.startedAt);
  const elapsed = (now - startedAt) / 1000;
  if (elapsed >= quest.duration) {
    let combatResult = null;
    if (quest.isCombat) {
      const playerStats = getStatsForClass(char.class, char.level);
      combatResult = simulateCombat(playerStats, quest.enemy);
      if (combatResult.result === "win") {
        char.gold += quest.gold;
        char.xp += quest.xp;
      }
    } else {
      char.gold += quest.gold;
      char.xp += quest.xp;
    }
    let xpToLevel = getXpForNextLevel(char.level);
    while (char.xp >= xpToLevel) {
      char.xp -= xpToLevel;
      char.level += 1;
      xpToLevel = getXpForNextLevel(char.level);
    }
    logHistory(char, quest, combatResult);
    char.activeQuest = null;
    await char.save();
    return res.json({ completed: true, character: char, combat: combatResult });
  } else {
    const timeLeft = Math.ceil(quest.duration - elapsed);
    return res.json({ completed: false, timeLeft, quest });
  }
});

// POST /characters/:id/quest/start
router.post("/characters/:id/quest/start", loadCharacter, async (req, res) => {
  const { id, name, duration, xp, gold, energyCost, isCombat } = req.body;
  const char = req.character;
  if (char.energy < energyCost) {
    return res.status(400).json({ error: "Not enough energy" });
  }
  if (char.activeQuest && Object.keys(char.activeQuest).length > 0) {
    return res.status(400).json({ error: "Quest already in progress" });
  }
  char.energy -= energyCost;
  char.activeQuest = {
    id,
    name,
    duration,
    xp,
    gold,
    isCombat: !!isCombat,
    enemy: isCombat ? generateEnemy(char) : undefined,
    startedAt: new Date(),
  };
  await char.save();
  res.json(char);
});

// POST /characters/:id/quest/complete
router.post("/characters/:id/quest/complete", loadCharacter, async (req, res) => {
  const char = req.character;
  const quest = char.activeQuest;
  if (!quest) return res.status(400).json({ error: "No active quest" });
  const now = new Date();
  const startedAt = new Date(quest.startedAt);
  const timeElapsed = (now - startedAt) / 1000;
  if (timeElapsed < quest.duration) {
    return res.status(400).json({ error: "Quest is still in progress" });
  }
  let combatResult = null;
  if (quest.isCombat) {
    const playerStats = getStatsForClass(char.class, char.level);
    combatResult = simulateCombat(playerStats, quest.enemy);
    if (combatResult.result === "win") {
      char.gold += quest.gold;
      char.xp += quest.xp;
    }
  } else {
    char.gold += quest.gold;
    char.xp += quest.xp;
  }
  let xpToLevel = getXpForNextLevel(char.level);
  while (char.xp >= xpToLevel) {
    char.xp -= xpToLevel;
    char.level += 1;
    xpToLevel = getXpForNextLevel(char.level);
  }
  logHistory(char, quest, combatResult);
  char.activeQuest = null;
  await char.save();
  res.json(combatResult ? { character: char, combat: combatResult } : char);
});

// POST /characters/:id/quest/cancel
router.post("/characters/:id/quest/cancel", loadCharacter, async (req, res) => {
  const char = req.character;
  if (!char.activeQuest) {
    return res.status(400).json({ error: "No active quest" });
  }
  char.activeQuest = null;
  await char.save();
  res.json(char);
});

// GET /characters/:id/history
router.get("/characters/:id/history", loadCharacter, (req, res) => {
  res.json(req.character.history || []);
});

module.exports = router;