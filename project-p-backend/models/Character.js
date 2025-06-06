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
  // Highest completed Tower level
  towerProgress: { type: Number, default: 0 },
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
        timestamp: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("Character", characterSchema);