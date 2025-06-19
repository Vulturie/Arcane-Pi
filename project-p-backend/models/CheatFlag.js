const mongoose = require('mongoose');

const cheatFlagSchema = new mongoose.Schema({}, { strict: false });

const CheatFlag = mongoose.models.CheatFlag || mongoose.model('CheatFlag', cheatFlagSchema, 'cheat_flags');

module.exports = CheatFlag;
