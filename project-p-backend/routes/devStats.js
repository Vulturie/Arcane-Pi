const express = require('express');
const router = express.Router();
const { StatsLog } = require('../utils/statsLogger');
const Character = require('../models/Character');
const CheatFlag = require('../models/CheatFlag');
const PlayerActivityLog = require('../models/PlayerActivityLog');
const PieSpendingLog = require('../models/PieSpendingLog');
const backendVersion = require('../package.json').version;

function auth(req, res, next) {
  if (req.query.token !== process.env.DEV_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.get('/dashboard', auth, async (req, res) => {
  try {
    const topQuests = await StatsLog.aggregate([
      { $match: { type: 'quest' } },
      { $group: { _id: '$questName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, questName: '$_id', count: 1 } },
    ]);

    const failedEnemies = await StatsLog.aggregate([
      { $match: { type: 'combat', win: false } },
      { $group: { _id: '$enemyType', fails: { $sum: 1 } } },
      { $sort: { fails: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, enemy: '$_id', fails: 1 } },
    ]);

    const classWinRates = await StatsLog.aggregate([
      { $match: { type: 'combat' } },
      {
        $group: {
          _id: { class: '$class', level: '$level' },
          total: { $sum: 1 },
          wins: { $sum: { $cond: ['$win', 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          class: '$_id.class',
          level: '$_id.level',
          winRate: { $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$wins', '$total'] }] },
        },
      },
      { $sort: { class: 1, level: 1 } },
    ]);

    const rewardInflation = await StatsLog.aggregate([
      { $match: { type: 'quest' } },
      { $group: { _id: '$level', avgXp: { $avg: '$xp' }, avgGold: { $avg: '$gold' } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, level: '$_id', avgXp: 1, avgGold: 1 } },
    ]);

    res.json({ topQuests, failedEnemies, classWinRates, rewardInflation, version: backendVersion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/suspicious', auth, async (req, res) => {
  try {
    const chars = await Character.find({ suspicious: true }).select('name class level').lean();
    const flags = await CheatFlag.find({}).sort({ timestamp: -1 }).lean();
    res.json({ characters: chars, flags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/ui-analytics', auth, async (req, res) => {
  try {
    const buttonCounts = await StatsLog.aggregate([
      { $match: { type: 'ui_interaction' } },
      { $group: { _id: { area: '$area', button: '$button' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const views = await StatsLog.aggregate([
      { $match: { type: 'ui_interaction' } },
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ buttonCounts, views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/daily-active', auth, async (req, res) => {
  const days = parseInt(req.query.days || '7', 10);
  const from = new Date();
  from.setUTCHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));

  try {
    const stats = await PlayerActivityLog.aggregate([
      { $match: { loginAt: { $gte: from } } },
      { $group: { _id: { date: '$loginDate', user: '$username' } } },
      { $group: { _id: '$_id.date', count: { $sum: 1 } } },
      { $project: { _id: 0, date: '$_id', activePlayers: '$count' } },
      { $sort: { date: 1 } },
    ]);

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/pie-spending', auth, async (req, res) => {
  const { username, from, to } = req.query;
  const filter = {};
  if (username) filter.username = username;
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }
  try {
    const logs = await PieSpendingLog.find(filter).sort({ timestamp: -1 }).lean();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
