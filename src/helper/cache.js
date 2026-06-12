import NodeCache from "node-cache";

// Initialize cache
// stdTTL: 3600 (1 hour default TTL)
// checkperiod: 600 (check for expired keys every 01 minutes)
// useClones: false (performance boost, avoids cloning objects)
// maxKeys: 15000 (roughly limiting to stay within 200MB for average JSON responses)
const cache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 600,
  useClones: false,
  maxKeys: 15000,
});

/**
 * Get data from cache
 * @param {string} key
 */
export const getCache = (key) => {
  return cache.get(key);
};

/**
 * Set data to cache
 * @param {string} key
 * @param {any} value
 * @param {number} ttl (Optional) Time to live in seconds
 */
export const setCache = (key, value, ttl) => {
  // Manual check for 200MB heap limit as requested
  const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;
  if (heapUsed > 200) {
    console.warn(
      "Memory limit (200MB) reached, skipping caching or consider flushing.",
    );
    // Optionally flush if it's too high
    // cache.flushAll();
    return false;
  }
  return cache.set(key, value, ttl);
};

/**
 * Delete data from cache
 * @param {string|string[]} key
 */
export const delCache = (key) => {
  return cache.del(key);
};

/**
 * Delete data from cache by prefix
 * @param {string} prefix
 */
export const delCacheByPrefix = (prefix) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter((key) => key.startsWith(prefix));
  if (keysToDelete.length > 0) {
    return cache.del(keysToDelete);
  }
};

/**
 * Clear all cache
 */
export const flushCache = () => {
  return cache.flushAll();
};

export default cache;
