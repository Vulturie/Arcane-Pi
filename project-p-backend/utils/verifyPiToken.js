const axios = require('axios');

module.exports = async function verifyPiToken(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Pi token' });
  }
  const token = auth.slice(7);
  try {
    const { data } = await axios.get('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    req.piUser = data;
    next();
  } catch (err) {
    console.error('Pi token verification failed', err.response?.data || err.message);
    res.status(401).json({ error: 'Invalid Pi token' });
  }
};
