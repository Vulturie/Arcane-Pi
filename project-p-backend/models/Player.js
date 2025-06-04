const mongoose = require("mongoose");

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
    type: [
      {
        id: Number,
        name: String,
        type: String,
        classRestriction: String,
        statBonus: mongoose.Schema.Types.Mixed,
      },
    ],
    default: [],
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
