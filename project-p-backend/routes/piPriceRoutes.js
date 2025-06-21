const express = require('express');
const router = express.Router();
const PiPrice = require('../models/PiPrice');
const { fetchPiPriceUSD } = require('../services/piPriceService');

router.get('/pi-price', async (_req, res) => {
  try {
    let price = await PiPrice.findOne().sort({ fetchedAt: -1 });
    if (!price) {
      const priceUSD = await fetchPiPriceUSD();
      if (!priceUSD) return res.status(404).json({ error: 'Price not found' });
      price = { priceUSD, fetchedAt: new Date() };
    }
    res.json({ priceUSD: price.priceUSD, fetchedAt: price.fetchedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
