const mongoose = require("mongoose");

// Schema describing an item stored in the character's inventory.
// The field name `type` conflicts with Mongoose's usage of `type`
// for schema definitions. To ensure it is treated as a normal
// property we wrap it in its own object.
const inventoryItemSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    type: { type: String },
    classRestriction: [String],
    rarity: { type: String, default: "common" },
    statBonus: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const characterSchema = new mongoose.Schema({
  owner: { type: String, required: true }, // Pi account username
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 15,
    trim: true,
  }, // character name
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
    default: "male",
  },
  class: { type: String, default: "Novice" },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  energy: { type: Number, default: 100 },
  lastEnergyUpdate: { type: Date, default: Date.now },
  // Maximum number of items that can be stored in the inventory
  maxInventorySlots: { type: Number, default: 10 },
  // Array of items in the character's inventory
  inventory: { type: [inventoryItemSchema], default: [] },
  // Currently equipped items
  equippedItems: {
    weapon: { type: inventoryItemSchema, default: null },
    headpiece: { type: inventoryItemSchema, default: null },
    chestplate: { type: inventoryItemSchema, default: null },
    gloves: { type: inventoryItemSchema, default: null },
    footwear: { type: inventoryItemSchema, default: null },
    necklace: { type: inventoryItemSchema, default: null },
    belt: { type: inventoryItemSchema, default: null },
    ring: { type: inventoryItemSchema, default: null },
    artifact: { type: inventoryItemSchema, default: null },
  },
  // Timestamp of when quest pools were last refreshed
  lastQuestRefresh: { type: Date, default: Date.now },
  // Timestamp of when the shop inventory was last refreshed
  lastShopRefresh: { type: Date, default: Date.now },
  safeQuestPool: { type: [mongoose.Schema.Types.Mixed], default: [] },
  riskyQuestPool: { type: [mongoose.Schema.Types.Mixed], default: [] },
  // Items currently offered in the shop for this character
  shopPool: { type: [mongoose.Schema.Types.Mixed], default: [] },
  // Currently active pet
  pet: {
    type: {
      id: String,
      expires: Date,
    },
    default: null,
  },
  // Highest completed Tower level
  towerProgress: { type: Number, default: 0 },
  // Daily tower victory limit
  dailyTowerVictories: { type: Number, default: 0 },
  // Extra tower wins purchased with Pie
  extraTowerWins: { type: Number, default: 0 },
  towerVictoryReset: { type: Date, default: Date.now },
  // Arena ranking data
  mmr: { type: Number, default: 1000 },
  arenaWins: { type: Number, default: 0 },
  arenaLosses: { type: Number, default: 0 },
  // Daily arena limits
  dailyArenaFights: { type: Number, default: 0 },
  arenaFightReset: { type: Date, default: Date.now },
  dailyArenaRefreshes: { type: Number, default: 0 },
  arenaRefreshReset: { type: Date, default: Date.now },
  // Indicates whether the player has visited the Arena page at least once
  hasEnteredArena: { type: Boolean, default: false },
  // Flagged for potential cheating
  suspicious: { type: Boolean, default: false },
  activeQuest: {
    type: {
      id: Number,
      name: String,
      duration: Number,
      xp: Number,
      gold: Number,
      tier: Number,
      path: String,
      rare: { type: Boolean, default: false },
      // Indicates whether the quest should trigger combat upon completion
      isCombat: { type: Boolean, default: false },
      enemy: {
          name: String,
          level: Number,
          STR: Number,
          AGI: Number,
          INT: Number,
          VIT: Number,
        },
      startedAt: Date,
    },
    default: undefined,
  },
  // Stores the outcome of the last completed quest until the
  // player acknowledges it
  pendingQuestResult: {
    type: {
      questName: String,
      questType: String,
      outcome: String,
      xp: Number,
      gold: Number,
      loot: inventoryItemSchema,
      message: String,
      log: [String],
    },
    default: null,
  },
  // Log of completed quests and combat outcomes
  history: {
    type: [
      {
        questName: String,
        questType: String,
        result: String,
        xp: Number,
        gold: Number,
      loot: inventoryItemSchema,
      playerHP: Number,
      enemyHP: Number,
      enemyName: String,
      opponentName: String,
      mmrChange: Number,
      oldMMR: Number,
      newMMR: Number,
      floorName: String,
      level: Number,
      timestamp: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("Character", characterSchema);
