const mongoose = require("mongoose");

const characterSchema = new mongoose.Schema({
  owner: { type: String, required: true }, // Pi account username
  name: { type: String, required: true },  // character name
  class: { type: String, default: "Novice" },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  energy: { type: Number, default: 100 },
  lastEnergyUpdate: { type: Date, default: Date.now },
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

module.exports = mongoose.model("Character", characterSchema);