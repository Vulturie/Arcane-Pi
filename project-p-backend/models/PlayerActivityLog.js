const mongoose = require('mongoose');

const playerActivityLogSchema = new mongoose.Schema({
  username: { type: String, required: true },
  loginAt: { type: Date, default: Date.now },
  loginDate: { type: String, required: true },
});

module.exports = mongoose.model('PlayerActivityLog', playerActivityLogSchema, 'player_activity_log');
