const cache = new Map();
const pending = new Map();

export const fetchWithCache = async (key, url, options = {}, ttl = 5000) => {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.timestamp < ttl) {
    return cached.data;
  }
  if (pending.has(key)) {
    return pending.get(key);
  }
  const controller = new AbortController();
  const fetchPromise = fetch(url, { ...options, signal: controller.signal }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    cache.set(key, { data, timestamp: Date.now() });
    pending.delete(key);
    return data;
  });
  pending.set(key, fetchPromise);
  return fetchPromise;
};

export const invalidateCache = (key) => {
  cache.delete(key);
};

export const clearCache = () => {
  cache.clear();
  pending.clear();
};
