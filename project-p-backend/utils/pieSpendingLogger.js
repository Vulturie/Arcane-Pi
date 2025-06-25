const PieSpendingLog = require('../models/PieSpendingLog');
const PiRevenueLog = require('../models/PiRevenueLog');
const Player = require('../models/Player');
const CheatFlag = require('../models/CheatFlag');

async function logPieSpend(username, amount, action) {
  try {
    await PieSpendingLog.create({ username, amount, action, timestamp: new Date() });
    await validatePieBalance(username);
  } catch (err) {
    console.error('Failed to log pie spending', err);
  }
}

async function validatePieBalance(username) {
  try {
    const [spentAgg] = await PieSpendingLog.aggregate([
      { $match: { username } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const spent = spentAgg ? spentAgg.total : 0;

    const [buyAgg] = await PiRevenueLog.aggregate([
      { $match: { username } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const purchased = buyAgg ? buyAgg.total : 0;

    const player = await Player.findOne({ username });
    const current = player ? player.pie : 0;

    if (spent > purchased + current) {
      await CheatFlag.create({ username, timestamp: new Date(), reason: 'pie_overspend', data: { spent, purchased, current } });
      console.warn(`Pie overspend detected for ${username}`);
    }
  } catch (err) {
    console.error('Failed to validate pie balance', err);
  }
}

module.exports = { logPieSpend, validatePieBalance };
