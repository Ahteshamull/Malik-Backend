import { getCache, setCache } from "../cache.js";

/**
 * Middleware to cache GET requests
 * @param {number} ttl Time to live in seconds
 */
export const cacheMiddleware = (ttl) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Generate a unique key based on the URL and optionally the user ID for personalized data
    let key = req.originalUrl || req.url;
    
    // If user is authenticated, append user ID to the key for personalized routes
    // This prevents one user from seeing another user's cached data
    if (req.user && (req.user._id || req.user.id)) {
      const userId = req.user._id || req.user.id;
      key = `${key}:${userId}`;
    }

    const cachedResponse = getCache(key);

    if (cachedResponse) {
      // console.log(`Cache hit for: ${key}`);
      return res.status(200).json(cachedResponse);
    }


    // console.log(`Cache miss for: ${key}`);

    // Intercept res.json to store the response in cache
    const originalJson = res.json;
    res.json = function (body) {
      // Only cache successful responses
      if (res.statusCode === 200 && body && body.success !== false) {
        setCache(key, body, ttl);
      }
      return originalJson.call(this, body);
    };

    next();
  };
};
