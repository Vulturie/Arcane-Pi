const express = require("express");
const router = express.Router();
const Player = require("../models/Player");
const Character = require("../models/Character");
const PiRevenueLog = require("../models/PiRevenueLog");
const RevenueSnapshot = require("../models/RevenueSnapshot");
const PlayerActivityLog = require("../models/PlayerActivityLog");
const { validatePieBalance } = require("../utils/pieSpendingLogger");
const { generateEnemy } = require("../utils/enemyGenerator");
const { getPlayerStats, simulateCombat } = require("../utils/combat");
const ITEMS = require("../data/items");
const getXpForNextLevel = (level) => {
  return 100 + (level - 1) * 50;
};

function getRandomRarity() {
  const r = Math.random();
  if (r < 0.005) return "legendary";
  if (r < 0.03) return "epic";
  if (r < 0.115) return "rare";
  if (r < 0.34) return "uncommon";
  return "common";
}

async function grantLoot(username, isRisky) {
  const chance = isRisky ? 0.5 : 0.05;
  if (Math.random() < chance) {
    const player = await Player.findOne({ username });
    if (player && player.inventory.length < player.maxInventorySlots) {
      const base = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const rarity = getRandomRarity();
      const item = { ...base, rarity };
      player.inventory.push(item);
      await player.save();
      return item;
    }
  }
  return null;
}

// GET /player/:username
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    let player = await Player.findOne({ username });
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    if (!player) {
      // Auto-create player if not found
      player = await Player.create({
        username,
        loginLog: { lastLogin: now, logins: [now], uniqueDays: [today] },
      });
      await PlayerActivityLog.create({ username, loginAt: now, loginDate: today });
    } else {
      if (!player.loginLog) player.loginLog = { logins: [], uniqueDays: [] };
      player.loginLog.lastLogin = now;

      const loggedToday = player.loginLog.uniqueDays.includes(today);
      if (!loggedToday) {
        player.loginLog.logins.push(now);
        player.loginLog.uniqueDays.push(today);
        const existingLog = await PlayerActivityLog.findOne({ username, loginDate: today });
        if (!existingLog) {
          await PlayerActivityLog.create({ username, loginAt: now, loginDate: today });
        }
      }
    }

    // Energy regeneration
    const elapsed = (now - new Date(player.lastEnergyUpdate)) / 1000;
    const ENERGY_REGEN_INTERVAL = 10; // seconds per 1 energy
    const MAX_ENERGY = 100;

    const energyToAdd = Math.floor(elapsed / ENERGY_REGEN_INTERVAL);
    if (energyToAdd > 0 && player.energy < MAX_ENERGY) {
      console.log(`⚡ Regenerating ${energyToAdd} energy for ${username}`);
      player.energy = Math.min(player.energy + energyToAdd, MAX_ENERGY);
      player.lastEnergyUpdate = new Date(now - (elapsed % ENERGY_REGEN_INTERVAL) * 1000);
    }
    await player.save();

    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /player/:username/quest/status
router.get("/:username/quest/status", async (req, res) => {
  const { username } = req.params;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    const quest = player.activeQuest;
    if (!quest) return res.json({ quest: null });

    const now = new Date();
    const startedAt = new Date(quest.startedAt);
    const elapsed = (now - startedAt) / 1000;

    if (elapsed >= quest.duration) {
      let combatResult = null;
      let loot = null;
      if (quest.isCombat) {
        const playerStats = getPlayerStats(player);
        combatResult = simulateCombat(playerStats, quest.enemy);
        if (combatResult.result === "win") {
          player.gold += quest.gold;
          player.xp += quest.xp;
          loot = await grantLoot(username, quest.isCombat);
        }
      } else {
        player.gold += quest.gold;
        player.xp += quest.xp;
      }

      let xpToLevel = getXpForNextLevel(player.level);
      while (player.xp >= xpToLevel) {
        player.xp -= xpToLevel;
        player.level += 1;
        xpToLevel = getXpForNextLevel(player.level);
      }

      player.activeQuest = null;
      await player.save();

      return res.json({ completed: true, player, combat: combatResult, loot });
    } else {
      const timeLeft = Math.ceil(quest.duration - elapsed);
      return res.json({ completed: false, timeLeft, quest });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/quest/start
router.post("/:username/quest/start", async (req, res) => {
  const { username } = req.params;
  const { id, name, duration, xp, gold, energyCost, isCombat, rare, force } = req.body;

  console.log("Received quest start request:", req.body);


  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    if (player.energy < energyCost) {
      return res.status(400).json({ error: "Not enough energy" });
    }

    if (player.activeQuest && Object.keys(player.activeQuest).length > 0) {
      return res.status(400).json({ error: "Quest already in progress" });
    }

    if (player.inventory.length >= player.maxInventorySlots && !force) {
      return res.status(400).json({ error: "Inventory full", inventoryFull: true });
    }

    // Deduct energy and set active quest
    player.energy -= energyCost;
    const questData = {
      id,
      name,
      duration,
      xp,
      gold,
      rare: !!rare,
      isCombat: !!isCombat,
      startedAt: new Date(),
    };

    if (isCombat) {
      questData.enemy = generateEnemy(player);
    }

    player.activeQuest = questData;

    await player.save();
    console.log("✅ Quest saved to player:", player);
    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/quest/complete
router.post("/:username/quest/complete", async (req, res) => {
  const { username } = req.params;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    const quest = player.activeQuest;
    if (!quest) return res.status(400).json({ error: "No active quest" });

    const now = new Date();
    const startedAt = new Date(quest.startedAt);
    const timeElapsed = (now - startedAt) / 1000; // seconds

    if (timeElapsed < quest.duration) {
      return res.status(400).json({ error: "Quest is still in progress" });
    }

  let combatResult = null;
  let loot = null;

    if (quest.isCombat) {
      const playerStats = getPlayerStats(player);
      combatResult = simulateCombat(playerStats, quest.enemy);

      if (combatResult.result === "win") {
        player.gold += quest.gold;
        player.xp += quest.xp;
        loot = await grantLoot(username, quest.isCombat);
      }
    } else {
      player.gold += quest.gold;
      player.xp += quest.xp;
    }

    let xpToLevel = getXpForNextLevel(player.level);
    while (player.xp >= xpToLevel) {
      player.xp -= xpToLevel;
      player.level += 1;
      xpToLevel = getXpForNextLevel(player.level);
    }

    player.activeQuest = null;

    await player.save();
    res.json(combatResult ? { player, combat: combatResult, loot } : player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/quest/cancel
router.post("/:username/quest/cancel", async (req, res) => {
  const { username } = req.params;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    if (!player.activeQuest) {
      return res.status(400).json({ error: "No active quest" });
    }

    player.activeQuest = null;
    await player.save();

    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/class
router.post("/:username/class", async (req, res) => {
  const { username } = req.params;
  const { className } = req.body;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    player.class = className;
    await player.save();

    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /player/:username
router.delete("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    await Player.deleteOne({ username });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/energy
router.post("/:username/energy", async (req, res) => {
  const { username } = req.params;
  const { energy } = req.body;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    player.energy = energy;
    player.lastEnergyUpdate = new Date();
    await player.save();

    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /player/:username/inventory
router.get("/:username/inventory", async (req, res) => {
  const { username } = req.params;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    res.json({
      inventory: player.inventory,
      slots: player.inventory.length,
      maxSlots: player.maxInventorySlots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/inventory
router.post("/:username/inventory", async (req, res) => {
  const { username } = req.params;
  const { inventory } = req.body;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    if (inventory.length > player.maxInventorySlots) {
      return res.status(400).json({ error: "Inventory exceeds capacity" });
    }

    player.inventory = inventory;
    await player.save();

    res.json({
      inventory: player.inventory,
      slots: player.inventory.length,
      maxSlots: player.maxInventorySlots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/inventory/add
router.post("/:username/inventory/add", async (req, res) => {
  const { username } = req.params;
  const { itemId } = req.body;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    const ITEMS = require("../data/items");
    const item = ITEMS.find((it) => it.id === itemId);
    if (!item) return res.status(400).json({ error: "Invalid item" });

    if (player.inventory.length >= player.maxInventorySlots) {
      return res.status(400).json({ error: "Inventory full" });
    }

    player.inventory.push({ ...item, rarity: "common" });
    await player.save();

    res.json({
      inventory: player.inventory,
      slots: player.inventory.length,
      maxSlots: player.maxInventorySlots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/buy
router.post("/:username/buy", async (req, res) => {
  const { username } = req.params;
  const { itemId, characterId } = req.body;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    const character = await Character.findById(characterId);
    if (!character) return res.status(404).json({ error: "Character not found" });

    const ITEMS = require("../data/items");
    const item = ITEMS.find((it) => it.id === itemId);
    if (!item) return res.status(400).json({ error: "Invalid item" });

    if (character.gold < item.cost) {
      return res.status(400).json({ error: "Not enough gold" });
    }

    if (player.inventory.length >= player.maxInventorySlots) {
      return res.status(400).json({ error: "Inventory full" });
    }

    character.gold -= item.cost;
    player.inventory.push({ ...item, rarity: "common" });

    await character.save();
    await player.save();

    res.json({
      gold: character.gold,
      inventory: player.inventory,
      slots: player.inventory.length,
      maxSlots: player.maxInventorySlots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/sell
router.post("/:username/sell", async (req, res) => {
  const { username } = req.params;
  const { itemId, characterId } = req.body;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    const character = await Character.findById(characterId);
    if (!character) return res.status(404).json({ error: "Character not found" });

    const idx = player.inventory.findIndex((it) => it.id === itemId);
    if (idx === -1) return res.status(404).json({ error: "Item not in inventory" });
    const item = player.inventory[idx];

    const ITEMS = require("../data/items");
    const itemData = ITEMS.find((it) => it.id === itemId);
    const sellPrice = itemData ? Math.floor(itemData.cost * 0.5) : 0;

    // Remove item and credit gold
    player.inventory.splice(idx, 1);
    character.gold += sellPrice;

    await character.save();
    await player.save();

    res.json({
      gold: character.gold,
      inventory: player.inventory,
      slots: player.inventory.length,
      maxSlots: player.maxInventorySlots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /player/:username/equipment
router.get("/:username/equipment", async (req, res) => {
  const { username } = req.params;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    res.json(player.equippedItems || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/equip
router.post("/:username/equip", async (req, res) => {
  const { username } = req.params;
  const { itemId } = req.body;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    const idx = player.inventory.findIndex((it) => it.id === itemId);
    if (idx === -1) return res.status(404).json({ error: "Item not in inventory" });
    const item = player.inventory[idx];

    if (
      item.classRestriction &&
      !item.classRestriction.includes(player.class)
    ) {
      return res
        .status(400)
        .json({ error: "Class cannot equip this item" });
    }

    const slot = item.type;

    // Unequip existing item in slot
    if (player.equippedItems && player.equippedItems[slot]) {
      if (player.inventory.length >= player.maxInventorySlots) {
        return res.status(400).json({ error: "Inventory full" });
      }
      player.inventory.push(player.equippedItems[slot]);
    }

    // Remove from inventory and equip
    player.inventory.splice(idx, 1);
    player.equippedItems[slot] = item;
    await player.save();

    res.json({
      inventory: player.inventory,
      equippedItems: player.equippedItems,
      slots: player.inventory.length,
      maxSlots: player.maxInventorySlots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/unequip
router.post("/:username/unequip", async (req, res) => {
  const { username } = req.params;
  const { slot } = req.body;

  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ error: "Player not found" });

    const item = player.equippedItems && player.equippedItems[slot];
    if (item) {
      if (player.inventory.length >= player.maxInventorySlots) {
        return res.status(400).json({ error: "Inventory full" });
      }
      player.inventory.push(item);
      player.equippedItems[slot] = null;
      await player.save();
    }

    res.json({
      inventory: player.inventory,
      equippedItems: player.equippedItems,
      slots: player.inventory.length,
      maxSlots: player.maxInventorySlots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /player/:username/pie/add
router.post("/:username/pie/add", async (req, res) => {
  const { username } = req.params;
  const { amount, piAmount, buyOption, tx_id } = req.body;

  try {
    const player = await Player.findOneAndUpdate(
      { username },
      { $inc: { pie: amount } },
      { new: true }
    );

    if (!player) return res.status(404).json({ error: "Player not found" });

    if (piAmount) {
      try {
        await PiRevenueLog.create({
          username,
          amount: piAmount,
          timestamp: new Date(),
          buyOption,
          tx_id,
        });

        const cycle = new Date().toISOString().slice(0, 7);
        const existing = await RevenueSnapshot.findOne({ cycle });
        const updateBreakdown = (total) => ({
          player_rewards: total * 0.35,
          development: total * 0.30,
          creator: total * 0.20,
          marketing: total * 0.10,
          ecosystem_reserve: total * 0.05,
        });

        if (existing) {
          const totalPi = existing.totalPi + piAmount;
          existing.totalPi = totalPi;
          existing.breakdown = updateBreakdown(totalPi);
          existing.status = "ready";
          await existing.save();
        } else {
          const totalPi = piAmount;
          await RevenueSnapshot.create({
            cycle,
            totalPi,
            breakdown: updateBreakdown(totalPi),
            status: "ready",
            createdAt: new Date(),
          });
        }
      } catch (logErr) {
        console.error("Failed to log Pi revenue", logErr);
      }
    }

    await validatePieBalance(username);
    res.json({ pie: player.pie });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
