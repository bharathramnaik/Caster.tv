/**
 * Authentication & authorization middleware.
 * JWT-based auth with role-based access control and project-level permissions.
 */
import jwt from 'jsonwebtoken';
import { authStore } from '../authStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sportscaster-dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Require a valid JWT token. Attaches req.user.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = verifyToken(header.slice(7));
    const user = authStore.getUser(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth - attaches req.user if token present, otherwise continues.
 */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = verifyToken(header.slice(7));
      req.user = authStore.getUser(decoded.id) || null;
    } catch { /* ignore invalid tokens */ }
  }
  next();
}

/**
 * Require specific role(s). Must be used after requireAuth.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

/**
 * Require project-level access. Checks owner or member role.
 * Must be used after requireAuth. Attaches req.projectMember.
 */
export function requireProjectAccess(minRole = 'viewer') {
  const roleHierarchy = { admin: 3, editor: 2, viewer: 1 };
  const minLevel = roleHierarchy[minRole] || 1;

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const projectId = req.params.id || req.params.projectId;
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    const project = authStore.getProject(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Owner has full access
    if (project.ownerId === req.user.id) {
      req.projectMember = { role: 'admin', userId: req.user.id };
      return next();
    }

    const member = (project.members || []).find(m => m.userId === req.user.id);
    if (!member) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    const memberLevel = roleHierarchy[member.role] || 0;
    if (memberLevel < minLevel) {
      return res.status(403).json({ error: `Requires at least ${minRole} role` });
    }

    req.projectMember = member;
    next();
  };
}

/**
 * Legacy admin token auth (backward compatibility).
 */
export function legacyAuth(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return next();
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token === adminToken) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

export { JWT_SECRET };
