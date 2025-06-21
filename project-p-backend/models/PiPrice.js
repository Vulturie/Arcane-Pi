const mongoose = require('mongoose');

const piPriceSchema = new mongoose.Schema({
  priceUSD: { type: Number, required: true },
  fetchedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PiPrice', piPriceSchema);
