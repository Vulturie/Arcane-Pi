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
    statBonus: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  // Player class/job. Default to 'Novice' so front-end always has a value
  class: { type: String, default: "Novice" },
  energy: { type: Number, default: 100 },
  lastEnergyUpdate: { type: Date, default: Date.now },

// Array of items in the player's inventory
  inventory: {
    type: [inventoryItemSchema],
    default: [],
  },

// Currently equipped items
  equippedItems: {
    weapon: { type: inventoryItemSchema, default: null },
    armor: { type: inventoryItemSchema, default: null },
    accessory: { type: inventoryItemSchema, default: null },
  },

  activeQuest: {
    type: {
      id: Number,
      name: String,
      duration: Number,
      xp: Number,
      gold: Number,
      startedAt: Date,
    },
    default: undefined,
  },
});

module.exports = mongoose.model("Player", playerSchema);
