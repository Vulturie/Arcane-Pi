const express = require('express');
const router = express.Router();
const PiPrice = require('../models/PiPrice');

router.get('/pi-price', async (_req, res) => {
  try {
    const price = await PiPrice.findOne().sort({ fetchedAt: -1 });
    if (!price) return res.status(404).json({ error: 'Price not found' });
    res.json({ priceUSD: price.priceUSD, fetchedAt: price.fetchedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
