const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
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

module.exports = mongoose.model("Player", playerSchema);
