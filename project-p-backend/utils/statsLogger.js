const mongoose = require('mongoose');

const statsLogSchema = new mongoose.Schema({}, { strict: false });

const StatsLog = mongoose.models.StatsLog || mongoose.model('StatsLog', statsLogSchema, 'stats_logs');

async function logStat(payload) {
  try {
    await StatsLog.create(payload);
  } catch (err) {
    console.error('Failed to log stat', err);
  }
}

module.exports = { logStat, StatsLog };