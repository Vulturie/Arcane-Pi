const express = require('express');
const router = express.Router();
const ITEMS = require('../data/items');

// GET /items
router.get('/', (req, res) => {
  res.json(ITEMS);
});

module.exports = router;
