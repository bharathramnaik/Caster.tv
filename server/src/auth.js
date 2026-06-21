/**
 * Simple token-based auth middleware for admin operations.
 * Set ADMIN_TOKEN in .env to enable. If no token is set, auth is bypassed.
 */
export function authMiddleware(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return next(); // No auth configured, allow all

  const token = req.headers['x-admin-token'] || req.query.token;
  if (token === adminToken) return next();

  res.status(401).json({ error: 'Unauthorized. Provide valid x-admin-token header.' });
}
