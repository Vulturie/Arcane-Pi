const CheatFlag = require('../models/CheatFlag');

async function flagCheat(character, reason, data = {}) {
  try {
    character.suspicious = true;
    await character.save();
    await CheatFlag.create({ characterId: character._id, timestamp: new Date(), reason, data });
  } catch (err) {
    console.error('Failed to flag cheat', err);
  }
}

module.exports = { flagCheat };