const express = require('express');
const axios = require('axios');
const Player = require('../models/Player');
const PlayerActivityLog = require('../models/PlayerActivityLog');

const router = express.Router();

router.post('/pi-login', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Missing access token' });

  try {
    const { data } = await axios.get('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const username = data.username;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    let player = await Player.findOne({ username });
    if (!player) {
      player = await Player.create({ username, loginLog: { lastLogin: now, logins: [now], uniqueDays: [today] } });
      await PlayerActivityLog.create({ username, loginAt: now, loginDate: today });
    }
    return res.json({ username });
  } catch (err) {
    console.error('Pi token verification failed', err.response?.data || err.message);
    return res.status(401).json({ error: 'Invalid Pi token' });
  }
});

module.exports = router;
