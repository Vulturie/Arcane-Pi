const express = require("express");
const router = express.Router();
const Player = require("../models/Player");
const Character = require("../models/Character");
const { generateEnemy } = require("../utils/enemyGenerator");
const { getPlayerStats, simulateCombat } = require("../utils/combat");
const getXpForNextLevel = (level) => {
  return 100 + (level - 1) * 50;
};

// GET /player/:username
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    let player = await Player.findOne({ username });

    if (!player) {
      // Auto-create player if not found
      player = await Player.create({ username });
    }

    // Energy regeneration
    const now = new Date();
    const elapsed = (now - new Date(player.lastEnergyUpdate)) / 1000;
    const ENERGY_REGEN_INTERVAL = 10; // seconds per 1 energy
    const MAX_ENERGY = 100;

    const energyToAdd = Math.floor(elapsed / ENERGY_REGEN_INTERVAL);
    if (energyToAdd > 0 && player.energy < MAX_ENERGY) {
      console.log(`⚡ Regenerating ${energyToAdd} energy for ${username}`);
      player.energy = Math.min(player.energy + energyToAdd, MAX_ENERGY);
      player.lastEnergyUpdate = new Date(now - (elapsed % ENERGY_REGEN_INTERVAL) * 1000);
      await player.save();
    }

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
      // Finish quest and give reward
      player.gold += quest.gold;
      player.xp += quest.xp;

      let xpToLevel = getXpForNextLevel(player.level);
      while (player.xp >= xpToLevel) {
        player.xp -= xpToLevel;
        player.level += 1;
        xpToLevel = getXpForNextLevel(player.level);
      }

      player.activeQuest = null;
      await player.save();

      return res.json({ completed: true, player });
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
  const { id, name, duration, xp, gold, energyCost, isCombat } = req.body;

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

    // Deduct energy and set active quest
    player.energy -= energyCost;
    const questData = {
      id,
      name,
      duration,
      xp,
      gold,
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

    if (quest.isCombat) {
      const playerStats = getPlayerStats(player);
      combatResult = simulateCombat(playerStats, quest.enemy);

      if (combatResult.result === "win") {
        player.gold += quest.gold;
        player.xp += quest.xp;
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
    res.json(combatResult ? { player, combat: combatResult } : player);
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

    res.json(player.inventory);
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

    player.inventory = inventory;
    await player.save();

    res.json(player.inventory);
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

    player.inventory.push(item);
    await player.save();

    res.json(player.inventory);
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

    character.gold -= item.cost;
    player.inventory.push(item);

    await character.save();
    await player.save();

  res.json({ gold: character.gold, inventory: player.inventory });
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

    res.json({ gold: character.gold, inventory: player.inventory });
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
    const slot = item.type;

    // Unequip existing item in slot
    if (player.equippedItems && player.equippedItems[slot]) {
      player.inventory.push(player.equippedItems[slot]);
    }

    // Remove from inventory and equip
    player.inventory.splice(idx, 1);
    player.equippedItems[slot] = item;
    await player.save();

    res.json({ inventory: player.inventory, equippedItems: player.equippedItems });
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
      player.inventory.push(item);
      player.equippedItems[slot] = null;
      await player.save();
    }

    res.json({ inventory: player.inventory, equippedItems: player.equippedItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
