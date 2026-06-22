/**
 * Rate limiting middleware using an in-memory sliding window store.
 */

const store = new Map();

function cleanup(key, windowMs) {
  const record = store.get(key);
  if (!record) return;
  const now = Date.now();
  record.timestamps = record.timestamps.filter(t => now - t < windowMs);
  if (record.timestamps.length === 0) store.delete(key);
}

/**
 * Returns Express middleware that limits requests per IP within a time window.
 * @param {number} windowMs - Window duration in milliseconds.
 * @param {number} max - Maximum requests allowed in the window.
 */
export function rateLimiter(windowMs, max) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();

    cleanup(key, windowMs);

    let record = store.get(key);
    if (!record) {
      record = { timestamps: [] };
      store.set(key, record);
    }

    record.timestamps.push(now);

    const remaining = Math.max(0, max - record.timestamps.length);
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));

    if (record.timestamps.length > max) {
      const retryAfter = Math.ceil((record.timestamps[0] + windowMs - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }

    next();
  };
}

const ONE_MINUTE = 60 * 1000;

export const globalLimiter = rateLimiter(ONE_MINUTE, 100);
export const authLimiter = rateLimiter(ONE_MINUTE, 10);
export const apiLimiter = rateLimiter(ONE_MINUTE, 30);
