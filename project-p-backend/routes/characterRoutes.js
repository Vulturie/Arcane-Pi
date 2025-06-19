const express = require("express");
const router = express.Router();
const Character = require("../models/Character");
const { generateEnemy } = require("../utils/enemyGenerator");
const { getPlayerStats, simulateCombat } = require("../utils/combat");
const ITEMS = require("../data/items");
const { SAFE_QUEST_TIERS, RISKY_QUEST_TIERS } = require("../data/quests");
const { XP_GAIN_MULTIPLIER, GOLD_SCALING } = require("../utils/balanceConfig");
const { getRewardForLevel, getEnemyForLevel } = require("../data/tower");
const { logStat } = require("../utils/statsLogger");
const { flagCheat } = require("../utils/cheatDetector");

function getRandomRarity() {
  const r = Math.random();
  if (r < 0.005) return "legendary";
  if (r < 0.03) return "epic"; // 0.005 + 0.025
  if (r < 0.115) return "rare"; // +0.085
  if (r < 0.34) return "uncommon"; // +0.225
  return "common";
}

function randomQuest(tiers, tierIndex, path, level) {
  const quests = tiers[tierIndex];
  const q = quests[Math.floor(Math.random() * quests.length)];
  const lvlFactor = 1 + XP_GAIN_MULTIPLIER * (level - 1);
  const goldFactor = 1 + GOLD_SCALING * (level - 1);
  return {
    ...q,
    xp: Math.round(q.xp * lvlFactor),
    gold: Math.round(q.gold * goldFactor),
    tier: tierIndex + 1,
    path,
  };
}

function initQuestPools(char) {
  char.safeQuestPool = [0, 1, 2].map((i) => randomQuest(SAFE_QUEST_TIERS, i, "safe", char.level));
  char.riskyQuestPool = [0, 1, 2].map((i) => randomQuest(RISKY_QUEST_TIERS, i, "risky", char.level));
  char.lastQuestRefresh = new Date();
}

function initShopPool(char) {
  const shuffled = [...ITEMS].sort(() => 0.5 - Math.random());
  char.shopPool = shuffled.slice(0, Math.min(8, ITEMS.length));
  char.shopPool = shuffled
    .slice(0, Math.min(8, ITEMS.length))
    .map((it) => ({ ...it, rarity: "common" }));
}

function refreshShopPool(char) {
  initShopPool(char);
  char.lastShopRefresh = new Date();
}

function replaceQuest(char, type, tierIndex) {
  const quest = randomQuest(
    type === "safe" ? SAFE_QUEST_TIERS : RISKY_QUEST_TIERS,
    tierIndex,
    type,
    char.level
  );
  if (type === "safe") char.safeQuestPool[tierIndex] = quest;
  else char.riskyQuestPool[tierIndex] = quest;
}

function refreshQuestPool(char, type) {
  const tiers = type === "safe" ? SAFE_QUEST_TIERS : RISKY_QUEST_TIERS;
  const pool = [0, 1, 2].map((i) => randomQuest(tiers, i, type, char.level));
  if (type === "safe") char.safeQuestPool = pool;
  else char.riskyQuestPool = pool;
}

// Limit history stored per character to avoid unbounded growth
const MAX_HISTORY_ENTRIES = 100;

const getXpForNextLevel = (level) => 100 + (level - 1) * 50;

function logHistory(char, quest, combatResult, xpGain, goldGain, loot) {
  const entry = {
    questName: quest.name,
    questType: quest.path || (quest.isCombat ? "risky" : "safe"),
    result: combatResult && combatResult.result === "win" ? "success" : "failure",
    xp: xpGain,
    gold: goldGain,
    loot,
    playerHP: combatResult ? combatResult.playerHP : undefined,
    enemyHP: combatResult ? combatResult.enemyHP : undefined,
    enemyName: combatResult && quest.enemy ? quest.enemy.name : undefined,
    timestamp: new Date(),
  };
  if (!char.history) char.history = [];
  char.history.push(entry);
  // Remove the oldest entry when exceeding the cap
  if (char.history.length > MAX_HISTORY_ENTRIES) char.history.shift();
}

function logTowerHistory(char, level, result, floorName) {
  const entry = {
    questName: floorName || `Floor ${level}`,
    questType: "tower",
    result,
    level,
    floorName,
    timestamp: new Date(),
  };
  if (!char.history) char.history = [];
  char.history.push(entry);
  if (char.history.length > MAX_HISTORY_ENTRIES) char.history.shift();
}

async function grantLoot(char, isRisky) {
  const chance = isRisky ? 0.5 : 0.05;
  if (Math.random() < chance) {
    if (char.inventory.length < char.maxInventorySlots) {
      const base = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const rarity = getRandomRarity();
      const item = { ...base, rarity };
      char.inventory.push(item);
      await char.save();
      return item;
    }
  }
  return null;
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
  const { name, className, gender } = req.body;
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

    if (gender !== "male" && gender !== "female") {
      return res.status(400).json({ error: "Gender must be 'male' or 'female'" });
    }
    const character = await Character.create({ owner, name: trimmed, class: className, gender });
    initQuestPools(character);
    initShopPool(character);
    await character.save();
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
    let updated = false;
    // Populate missing gender for older records
    if (!char.gender) {
      char.gender = "male";
      updated = true;
    }
    // Energy regeneration
    const now = new Date();
    const lastUpdate = new Date(char.lastEnergyUpdate);
    const elapsed = (now - lastUpdate) / 1000;
    const ENERGY_REGEN_INTERVAL = 10;
    const MAX_ENERGY = 100;
    const energyToAdd = Math.floor(elapsed / ENERGY_REGEN_INTERVAL);

    if (energyToAdd > 0) {
      if (char.energy < MAX_ENERGY) {
        char.energy = Math.min(char.energy + energyToAdd, MAX_ENERGY);
        if (char.energy >= MAX_ENERGY) {
          char.lastEnergyUpdate = now;
        } else {
          char.lastEnergyUpdate = new Date(now - (elapsed % ENERGY_REGEN_INTERVAL) * 1000);
        }
        updated = true;
      } else {
        // Energy already capped but timestamp was old
        char.lastEnergyUpdate = now;
        updated = true;
      }
    }

    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    if (!char.lastQuestRefresh || char.lastQuestRefresh < todayUTC) {
      refreshQuestPool(char, "safe");
      refreshQuestPool(char, "risky");
      char.lastQuestRefresh = now;
      updated = true;
    }

    if (!char.lastShopRefresh || char.lastShopRefresh < todayUTC) {
      refreshShopPool(char);
      char.lastShopRefresh = now;
      updated = true;
    }

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

    if (!char.safeQuestPool || char.safeQuestPool.length === 0) {
      initQuestPools(char);
      updated = true;
    }

    if (!char.shopPool || char.shopPool.length === 0) {
      initShopPool(char);
      updated = true;
    }

    if (updated) {
      try {
        await char.save();
      } catch (err) {
        if (err.name === "VersionError") {
          await Character.findByIdAndUpdate(char._id, char.toObject());
          const fresh = await Character.findById(char._id);
          req.character = fresh || char;
        } else {
          throw err;
        }
      }
    }
    if (!req.character) {
      req.character = char;
    }
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
  if (!quest) {
    if (char.pendingQuestResult) {
      return res.json({ completed: true, questResult: char.pendingQuestResult, character: char });
    }
    return res.json({ quest: null });
  }
  const now = new Date();
  const startedAt = new Date(quest.startedAt);
  const elapsed = (now - startedAt) / 1000;
  if (elapsed >= quest.duration) {
    let combatResult = null;
    let loot = null;
    let playerStats = null;
    if (quest.isCombat) {
      playerStats = getPlayerStats(char);
      combatResult = simulateCombat(playerStats, quest.enemy);
      if (combatResult.result === "win") {
        loot = await grantLoot(char, quest.path === "risky");
      }
    } else {
      // Non-combat quests always succeed
      combatResult = { result: "win", log: [] };
    }

    const qType = quest.path || (quest.isCombat ? "risky" : "safe");
    const outcome = combatResult.result === "win" ? "success" : "failure";
    const message = outcome === "failure" ? "You were defeated by the enemy!" : null;

    const xpGain = outcome === "success" ? quest.xp : 0;
    const goldGain = outcome === "success" ? quest.gold : 0;

    if (outcome === "success") {
      char.gold += quest.gold;
      char.xp += quest.xp;
    }

    let xpToLevel = getXpForNextLevel(char.level);
    while (char.xp >= xpToLevel) {
      char.xp -= xpToLevel;
      char.level += 1;
      xpToLevel = getXpForNextLevel(char.level);
    }

    logHistory(char, quest, combatResult, xpGain, goldGain, loot);
    if (quest.isCombat) {
      const maxHP = playerStats.VIT * 10;
      logStat({
        type: "combat",
        timestamp: Date.now(),
        playerId: char._id,
        class: char.class,
        level: char.level,
        win: combatResult.result === "win",
        rounds: combatResult.rounds,
        damageTaken: maxHP - combatResult.playerHP,
        enemyType: quest.enemy.name,
      });
    }
    logStat({
      type: "quest",
      timestamp: Date.now(),
      playerId: char._id,
      questName: quest.name,
      questType: qType,
      gold: goldGain,
      xp: xpGain,
      duration: quest.duration,
      level: char.level,
      result: outcome === "success" ? "win" : "fail",
    });

        char.pendingQuestResult = {
          questName: quest.name,
          questType: qType,
          outcome,
          xp: xpGain,
          gold: goldGain,
          loot,
          message,
          log: combatResult.log,
        };

    char.activeQuest = null;
    if (!quest.isCombat || outcome === "success") {
      refreshQuestPool(char, qType);
    }

    await char.save();
    return res.json({ completed: true, character: char, questResult: char.pendingQuestResult });
  } else {
    const timeLeft = Math.ceil(quest.duration - elapsed);
    return res.json({ completed: false, timeLeft, quest });
  }
});

// POST /characters/:id/quest/start
router.post("/characters/:id/quest/start", loadCharacter, async (req, res) => {
  const { id, name, duration, xp, gold, energyCost, isCombat, rare, tier, path, force } = req.body;
  const char = req.character;
  if (char.energy < energyCost) {
    return res.status(400).json({ error: "Not enough energy" });
  }
  if (char.activeQuest && Object.keys(char.activeQuest).length > 0) {
    return res.status(400).json({ error: "Quest already in progress" });
  }

  if (char.inventory.length >= char.maxInventorySlots && !force) {
    return res.status(400).json({ error: "Inventory full", inventoryFull: true });
  }

  char.energy -= energyCost;
  char.activeQuest = {
    id,
    name,
    duration,
    xp,
    gold,
    tier,
    path,
    rare: !!rare,
    isCombat: !!isCombat,
    enemy: isCombat
      ? generateEnemy(char, 1 + (tier - 1) * 0.25)
      : undefined,
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
  const levelBefore = char.level;
  const now = new Date();
  const startedAt = new Date(quest.startedAt);
  const timeElapsed = (now - startedAt) / 1000;
  if (timeElapsed < quest.duration) {
    return res.status(400).json({ error: "Quest is still in progress" });
  }
  let combatResult = null;
  let loot = null;
  let playerStats = null;
  if (quest.isCombat) {
    playerStats = getPlayerStats(char);
    combatResult = simulateCombat(playerStats, quest.enemy);
    if (combatResult.result === "win") {
      loot = await grantLoot(char, quest.path === "risky");
    }
  } else {
    combatResult = { result: "win", log: [] };
  }

  const qType = quest.path || (quest.isCombat ? "risky" : "safe");
  const outcome = combatResult.result === "win" ? "success" : "failure";
  const message = outcome === "failure" ? "You were defeated by the enemy!" : null;
  const xpGain = outcome === "success" ? quest.xp : 0;
  const goldGain = outcome === "success" ? quest.gold : 0;

  if (outcome === "success") {
    char.gold += quest.gold;
    char.xp += quest.xp;
  }

  let xpToLevel = getXpForNextLevel(char.level);
  while (char.xp >= xpToLevel) {
    char.xp -= xpToLevel;
    char.level += 1;
    xpToLevel = getXpForNextLevel(char.level);
  }

  if (quest.duration < 3 && quest.isCombat) {
    flagCheat(char, 'Quest duration too short', { quest: quest.name });
  }

  if (char.level - levelBefore > 10 && now - startedAt < 10 * 60 * 1000) {
    flagCheat(char, 'Level jump', { before: levelBefore, after: char.level });
  }

  logHistory(char, quest, combatResult, xpGain, goldGain, loot);
  if (quest.isCombat) {
    const maxHP = playerStats.VIT * 10;
    logStat({
      type: "combat",
      timestamp: Date.now(),
      playerId: char._id,
      class: char.class,
      level: char.level,
      win: combatResult.result === "win",
      rounds: combatResult.rounds,
      damageTaken: maxHP - combatResult.playerHP,
      enemyType: quest.enemy.name,
    });
  }
  logStat({
    type: "quest",
    timestamp: Date.now(),
    playerId: char._id,
    questName: quest.name,
    questType: qType,
    gold: goldGain,
    xp: xpGain,
    duration: quest.duration,
    level: char.level,
    result: outcome === "success" ? "win" : "fail",
  });

    char.pendingQuestResult = {
      questName: quest.name,
      questType: qType,
      outcome,
      xp: xpGain,
      gold: goldGain,
      loot,
      message,
      log: combatResult.log,
    };

  char.activeQuest = null;
  if (!quest.isCombat || outcome === "success") {
    refreshQuestPool(char, qType);
  }

  await char.save();
  res.json({ character: char, questResult: char.pendingQuestResult });
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

// POST /characters/:id/quest/result/ack
router.post("/characters/:id/quest/result/ack", loadCharacter, async (req, res) => {
  const char = req.character;
  char.pendingQuestResult = null;
  await char.save();
  res.json({ success: true });
});

// GET /characters/:id/history
router.get("/characters/:id/history", loadCharacter, (req, res) => {
  res.json(req.character.history || []);
});

// ---------------- Inventory & Equipment -----------------

// GET /characters/:id/inventory
router.get("/characters/:id/inventory", loadCharacter, (req, res) => {
  const char = req.character;
  res.json({
    inventory: char.inventory,
    slots: char.inventory.length,
    maxSlots: char.maxInventorySlots,
  });
});

// POST /characters/:id/inventory
router.post("/characters/:id/inventory", loadCharacter, async (req, res) => {
  const { inventory } = req.body;
  const char = req.character;
  if (inventory.length > char.maxInventorySlots) {
    return res.status(400).json({ error: "Inventory exceeds capacity" });
  }
  char.inventory = inventory;
  await char.save();
  res.json({
    inventory: char.inventory,
    slots: char.inventory.length,
    maxSlots: char.maxInventorySlots,
  });
});

// POST /characters/:id/inventory/add
router.post("/characters/:id/inventory/add", loadCharacter, async (req, res) => {
  const { itemId } = req.body;
  const char = req.character;
  const item = ITEMS.find((it) => it.id === itemId);
  if (!item) return res.status(400).json({ error: "Invalid item" });
  if (char.inventory.length >= char.maxInventorySlots) {
    return res.status(400).json({ error: "Inventory full" });
  }
  char.inventory.push({ ...item, rarity: "common" });
  await char.save();
  res.json({
    inventory: char.inventory,
    slots: char.inventory.length,
    maxSlots: char.maxInventorySlots,
  });
});

// POST /characters/:id/buy
router.post("/characters/:id/buy", loadCharacter, async (req, res) => {
  const { itemId } = req.body;
  const char = req.character;
  const item = ITEMS.find((it) => it.id === itemId);
  if (!item) return res.status(400).json({ error: "Invalid item" });
  if (char.gold < item.cost) return res.status(400).json({ error: "Not enough gold" });
  if (char.inventory.length >= char.maxInventorySlots) {
    return res.status(400).json({ error: "Inventory full" });
  }
  char.gold -= item.cost;
  char.inventory.push({ ...item, rarity: "common" });
  await char.save();
  res.json({
    gold: char.gold,
    inventory: char.inventory,
    slots: char.inventory.length,
    maxSlots: char.maxInventorySlots,
  });
});

// POST /characters/:id/sell
router.post("/characters/:id/sell", loadCharacter, async (req, res) => {
  const { itemId } = req.body;
  const char = req.character;
  const idx = char.inventory.findIndex((it) => it.id === itemId);
  if (idx === -1) return res.status(404).json({ error: "Item not in inventory" });
  const item = char.inventory[idx];
  const itemData = ITEMS.find((it) => it.id === itemId);
  const sellPrice = itemData ? Math.floor(itemData.cost * 0.5) : 0;
  char.inventory.splice(idx, 1);
  char.gold += sellPrice;
  await char.save();
  res.json({
    gold: char.gold,
    inventory: char.inventory,
    slots: char.inventory.length,
    maxSlots: char.maxInventorySlots,
  });
});

// GET /characters/:id/shop
// Return a paginated list of shop items for the character
router.get("/characters/:id/shop", loadCharacter, (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "8", 10);
  const start = (page - 1) * limit;
  const items = req.character.shopPool.slice(start, start + limit);
  res.json({
    items,
    total: req.character.shopPool.length,
    page,
    limit,
    lastShopRefresh: req.character.lastShopRefresh,
  });
});

// POST /characters/:id/shop/refresh
// Debug route to force a shop refresh
router.post("/characters/:id/shop/refresh", loadCharacter, async (req, res) => {
  const char = req.character;
  refreshShopPool(char);
  await char.save();
  res.json({ shopPool: char.shopPool, lastShopRefresh: char.lastShopRefresh });
});

// GET /characters/:id/equipment
router.get("/characters/:id/equipment", loadCharacter, (req, res) => {
  res.json(req.character.equippedItems || {});
});

// POST /characters/:id/equip
router.post("/characters/:id/equip", loadCharacter, async (req, res) => {
  const { itemId } = req.body;
  const char = req.character;
  const idx = char.inventory.findIndex((it) => it.id === itemId);
  if (idx === -1) return res.status(404).json({ error: "Item not in inventory" });
  const item = char.inventory[idx];
  if (item.classRestriction && !item.classRestriction.includes(char.class)) {
    return res.status(400).json({ error: "Class cannot equip this item" });
  }
  const slot = item.type;
  if (char.equippedItems && char.equippedItems[slot]) {
    if (char.inventory.length >= char.maxInventorySlots) {
      return res.status(400).json({ error: "Inventory full" });
    }
    char.inventory.push(char.equippedItems[slot]);
  }
  char.inventory.splice(idx, 1);
  char.equippedItems[slot] = item;
  await char.save();
  res.json({
    inventory: char.inventory,
    equippedItems: char.equippedItems,
    slots: char.inventory.length,
    maxSlots: char.maxInventorySlots,
  });
});

// POST /characters/:id/unequip
router.post("/characters/:id/unequip", loadCharacter, async (req, res) => {
  const { slot } = req.body;
  const char = req.character;
  const item = char.equippedItems && char.equippedItems[slot];
  if (item) {
    if (char.inventory.length >= char.maxInventorySlots) {
      return res.status(400).json({ error: "Inventory full" });
    }
    char.inventory.push(item);
    char.equippedItems[slot] = null;
    await char.save();
  }
  res.json({
    inventory: char.inventory,
    equippedItems: char.equippedItems,
    slots: char.inventory.length,
  maxSlots: char.maxInventorySlots,
  });
});

// ---------------- Tower -----------------

// Get tower status and next challenge info
router.get("/characters/:id/tower/status", loadCharacter, (req, res) => {
  const char = req.character;
  const nextLevel = (char.towerProgress || 0) + 1;
  const enemy = getEnemyForLevel(nextLevel);
  const reward = getRewardForLevel(nextLevel);
  res.json({ progress: char.towerProgress || 0, nextLevel, enemy, reward });
});

// Attempt the next tower level
router.post("/characters/:id/tower/attempt", loadCharacter, async (req, res) => {
  const char = req.character;
  if (char.inventory.length >= char.maxInventorySlots) {
    return res.status(400).json({ error: "Inventory full" });
  }
  const level = (char.towerProgress || 0) + 1;
  const enemy = getEnemyForLevel(level);
  const reward = getRewardForLevel(level);
  const playerStats = getPlayerStats(char);
  const combat = simulateCombat(playerStats, enemy);
  logStat({
    type: "combat",
    timestamp: Date.now(),
    playerId: char._id,
    class: char.class,
    level: char.level,
    win: combat.result === "win",
    rounds: combat.rounds,
    damageTaken: playerStats.VIT * 10 - combat.playerHP,
    enemyType: enemy.name,
  });
  if (combat.result === "win") {
    char.inventory.push(reward);
    char.towerProgress = level;
    logTowerHistory(char, level, "win");
    logStat({
      type: "quest",
      timestamp: Date.now(),
      playerId: char._id,
      questName: `Floor ${level}`,
      questType: "tower",
      gold: 0,
      xp: 0,
      duration: 0,
      level: char.level,
      result: "win",
    });
    await char.save();
    return res.json({ result: "win", combat, reward, progress: char.towerProgress });
  }
  logTowerHistory(char, level, "loss");
  logStat({
    type: "quest",
    timestamp: Date.now(),
    playerId: char._id,
    questName: `Floor ${level}`,
    questType: "tower",
    gold: 0,
    xp: 0,
    duration: 0,
    level: char.level,
    result: "fail",
  });
  await char.save();
  return res.json({ result: "loss", combat, progress: char.towerProgress });
});

// Cached leaderboard data refreshed once per UTC day
let towerLeaderboard = [];
let leaderboardUpdatedAt = null;

// Arena leaderboard cached once per UTC day
let arenaLeaderboard = [];
let arenaLeaderboardUpdatedAt = null;

async function refreshTowerLeaderboard() {
  towerLeaderboard = await Character.find({})
    .sort({ towerProgress: -1 })
    .select("name level class towerProgress")
    .lean();
  leaderboardUpdatedAt = new Date();
}

async function refreshArenaLeaderboard() {
  arenaLeaderboard = await Character.find({ hasEnteredArena: true })
    .sort({ mmr: -1 })
    .select("name level class mmr arenaWins arenaLosses")
    .lean();
  arenaLeaderboardUpdatedAt = new Date();
}

function needsLeaderboardRefresh() {
  if (!leaderboardUpdatedAt) return true;
  const now = new Date();
  return (
    now.getUTCFullYear() !== leaderboardUpdatedAt.getUTCFullYear() ||
    now.getUTCMonth() !== leaderboardUpdatedAt.getUTCMonth() ||
    now.getUTCDate() !== leaderboardUpdatedAt.getUTCDate()
  );
}

function needsArenaLeaderboardRefresh() {
  if (!arenaLeaderboardUpdatedAt) return true;
  const now = new Date();
  return (
    now.getUTCFullYear() !== arenaLeaderboardUpdatedAt.getUTCFullYear() ||
    now.getUTCMonth() !== arenaLeaderboardUpdatedAt.getUTCMonth() ||
    now.getUTCDate() !== arenaLeaderboardUpdatedAt.getUTCDate()
  );
}

// GET /leaderboard/tower?page=&limit=&charId=
router.get("/leaderboard/tower", async (req, res) => {
  try {
    if (needsLeaderboardRefresh()) {
      await refreshTowerLeaderboard();
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const start = (page - 1) * limit;
    const slice = towerLeaderboard.slice(start, start + limit);

    let myRank = null;
    if (req.query.charId) {
      const idx = towerLeaderboard.findIndex(
        (c) => String(c._id) === String(req.query.charId)
      );
      if (idx !== -1) myRank = idx + 1;
    }

    res.json({
      lastUpdated: leaderboardUpdatedAt.toISOString(),
      total: towerLeaderboard.length,
      results: slice,
      myRank,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /leaderboard/arena?page=&limit=&charId=
router.get("/leaderboard/arena", async (req, res) => {
  try {
    if (needsArenaLeaderboardRefresh()) {
      await refreshArenaLeaderboard();
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const start = (page - 1) * limit;
    const slice = arenaLeaderboard.slice(start, start + limit);

    let myRank = null;
    if (req.query.charId) {
      const idx = arenaLeaderboard.findIndex(
        (c) => String(c._id) === String(req.query.charId)
      );
      if (idx !== -1) myRank = idx + 1;
    }

    res.json({
      lastUpdated: arenaLeaderboardUpdatedAt.toISOString(),
      total: arenaLeaderboard.length,
      results: slice,
      myRank,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;