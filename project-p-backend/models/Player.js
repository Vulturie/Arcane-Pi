const mongoose = require("mongoose");

// Schema describing an item stored in the player's inventory. The field name
// `type` inside each item conflicts with Mongoose's usage of `type` for schema
// definitions. To ensure it is treated as a normal property we wrap it in its
// own object.
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

const loginLogSchema = new mongoose.Schema(
  {
    lastLogin: Date,
    logins: [Date],
    uniqueDays: [String],
  },
  { _id: false }
);

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  pie: { type: Number, default: 0 },
  // Player class/job. Default to 'Novice' so front-end always has a value
  class: { type: String, default: "Novice" },
  energy: { type: Number, default: 100 },
  lastEnergyUpdate: { type: Date, default: Date.now },
  // Maximum number of items that can be stored in the inventory
  maxInventorySlots: { type: Number, default: 10 },

  loginLog: { type: loginLogSchema, default: { logins: [], uniqueDays: [] } },

  shopRefreshesToday: { type: Number, default: 0 },
  lastShopRefresh: { type: Date },

// Array of items in the player's inventory
  inventory: {
    type: [inventoryItemSchema],
    default: [],
  },

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

  activeQuest: {
    type: {
      id: Number,
      name: String,
      duration: Number,
      xp: Number,
      gold: Number,
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
});

module.exports = mongoose.model("Player", playerSchema);
