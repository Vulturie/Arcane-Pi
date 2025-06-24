const mongoose = require('mongoose');

const breakdownSchema = new mongoose.Schema({
  player_rewards: Number,
  development: Number,
  creator: Number,
  marketing: Number,
  ecosystem_reserve: Number,
}, { _id: false });

const revenueSnapshotSchema = new mongoose.Schema({
  cycle: { type: String, required: true, unique: true }, // YYYY-MM
  totalPi: { type: Number, default: 0 },
  breakdown: breakdownSchema,
  status: { type: String, default: 'ready' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RevenueSnapshot', revenueSnapshotSchema, 'revenue_snapshot');
