const express = require('express');
const axios = require('axios');
const Player = require('../models/Player');
const PiRevenueLog = require('../models/PiRevenueLog');
const { validatePieBalance } = require('../utils/pieSpendingLogger');

const router = express.Router();
const BASE_URL = 'https://api.minepi.com/v2';

router.post('/approve', async (req, res) => {
  const { paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ error: 'paymentId required' });
  try {
    await axios.post(`${BASE_URL}/payments/${paymentId}/approve`, {}, {
      headers: { Authorization: `Key ${process.env.PI_SERVER_API_KEY}` }
    });
    res.json({ status: 'approved' });
  } catch (err) {
    console.error('Failed to approve payment', err.response?.data || err.message);
    res.status(500).json({ error: 'approve_failed' });
  }
});

router.post('/complete', async (req, res) => {
  const { paymentId, txid, username, metadata } = req.body;
  if (!paymentId || !txid || !username) return res.status(400).json({ error: 'missing params' });

  try {
    const existing = await PiRevenueLog.findOne({ payment_id: paymentId });
    if (existing) return res.status(400).json({ error: 'already_processed' });

    await axios.post(`${BASE_URL}/payments/${paymentId}/complete`, { txid }, {
      headers: { Authorization: `Key ${process.env.PI_SERVER_API_KEY}` }
    });

    const amount = metadata?.amount || 0;
    const log = await PiRevenueLog.create({
      username,
      amount,
      buyOption: metadata?.type || 'buy_pie',
      tx_id: txid,
      payment_id: paymentId,
      metadata,
    });

    const player = await Player.findOneAndUpdate(
      { username },
      { $inc: { pie: amount } },
      { new: true }
    );
    await validatePieBalance(username);
    res.json({ status: 'completed', pie: player.pie, logId: log._id });
  } catch (err) {
    console.error('Failed to complete payment', err.response?.data || err.message);
    res.status(500).json({ error: 'completion_failed' });
  }
});

module.exports = router;
