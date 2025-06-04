const mongoose = require("mongoose");

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
  activeQuest: {
    type: {
      id: Number,
      name: String,
      duration: Number,
      xp: Number,
      gold: Number,
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
  // Log of completed quests and combat outcomes
  history: {
    type: [
      {
        questName: String,
        result: String,
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