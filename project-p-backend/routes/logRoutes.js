const express = require('express');
const router = express.Router();
const { logStat } = require('../utils/statsLogger');

router.post('/logStat', async (req, res) => {
  try {
    const payload = { ...req.body, timestamp: Date.now() };
    await logStat(payload);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log stat' });
  }
});

module.exports = router;
