import { API_BASE_URL } from '../config';

export default async function logStat(payload) {
  try {
    await fetch(`${API_BASE_URL}/api/logStat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Failed to log stat', err);
  }
}