const axios = require('axios');

async function fetchPiPriceUSD() {
  try {
    const headers = {};
    if (process.env.COINGECKO_API_KEY) {
      headers['x-cg-pro-api-key'] = process.env.COINGECKO_API_KEY;
    }
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'pi-network', vs_currencies: 'usd' },
      headers,
    });
    return response.data?.['pi-network']?.usd;
  } catch (err) {
    console.error('Error fetching PI price from CoinGecko:', err.message);
    throw err;
  }
}

module.exports = { fetchPiPriceUSD };
