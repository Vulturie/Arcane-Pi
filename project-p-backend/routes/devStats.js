const express = require('express');
const router = express.Router();
const { StatsLog } = require('../utils/statsLogger');

router.get('/stats-summary', async (req, res) => {
  try {
    const combatWinRates = await StatsLog.aggregate([
      { $match: { type: 'combat' } },
      {
        $group: {
          _id: '$class',
          total: { $sum: 1 },
          wins: { $sum: { $cond: ['$win', 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          class: '$_id',
          winRate: { $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$wins', '$total'] }] },
        },
      },
    ]);

    const goldXpPerLevel = await StatsLog.aggregate([
      { $match: { type: 'quest' } },
      {
        $group: {
          _id: { $floor: { $divide: ['$level', 10] } },
          avgGold: { $avg: '$gold' },
          avgXp: { $avg: '$xp' },
        },
      },
      {
        $project: {
          _id: 0,
          levelRange: {
            $concat: [
              { $toString: { $multiply: ['$_id', 10] } },
              '-',
              { $toString: { $add: [{ $multiply: [{ $add: ['$_id', 1] }, 10] }, -1] } },
            ],
          },
          avgGold: 1,
          avgXp: 1,
        },
      },
      { $sort: { levelRange: 1 } },
    ]);

    const popularQuests = await StatsLog.aggregate([
      { $match: { type: 'quest' } },
      { $group: { _id: '$questName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, questName: '$_id', count: 1 } },
    ]);

    res.json({ combatWinRates, goldXpPerLevel, popularQuests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;