const mongoose = require('mongoose');

const pieSpendingLogSchema = new mongoose.Schema({
  username: { type: String, required: true },
  amount: { type: Number, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PieSpendingLog', pieSpendingLogSchema, 'pie_spending_log');
