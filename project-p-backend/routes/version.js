const express = require('express');
const router = express.Router();

const version = require('../package.json').version;

router.get('/version', (req, res) => {
  res.json({ version });
});

module.exports = router;
