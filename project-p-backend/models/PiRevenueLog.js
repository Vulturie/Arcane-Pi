const mongoose = require('mongoose');

const piRevenueLogSchema = new mongoose.Schema({
  username: { type: String, required: true },
  amount: { type: Number, required: true }, // amount of Pi paid
  timestamp: { type: Date, default: Date.now },
  buyOption: { type: String, required: true },
  tx_id: { type: String },
});

module.exports = mongoose.model('PiRevenueLog', piRevenueLogSchema, 'pi_revenue_log');
