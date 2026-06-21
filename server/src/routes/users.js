/**
 * User API Routes
 * POST /api/users/register - Register user
 * POST /api/users/login - Login
 * GET /api/users/me - Get current user
 * PUT /api/users/me - Update profile
 * GET /api/users - List users (admin only)
 * PUT /api/users/:id/role - Update user role (admin only)
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { authStore } from '../authStore.js';
import { requireAuth, requireRole, generateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/users/register
router.post('/register', (req, res) => {
  try {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existing = authStore.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const validRoles = ['admin', 'producer', 'operator'];
    const userRole = validRoles.includes(role) ? role : 'operator';

    const user = {
      id: `u_${nanoid(8)}`,
      email,
      name,
      role: userRole,
      passwordHash: bcrypt.hashSync(password, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    authStore.createUser(user);
    const token = generateToken(user);

    const { passwordHash, ...safe } = user;
    res.status(201).json({ user: safe, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/users/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = authStore.getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const { passwordHash, ...safe } = user;
    res.json({ user: safe, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/users/me
router.get('/me', requireAuth, (req, res) => {
  const { passwordHash, ...safe } = req.user;
  res.json(safe);
});

// PUT /api/users/me
router.put('/me', requireAuth, (req, res) => {
  const { name, email, password } = req.body;
  const updates = { updatedAt: new Date().toISOString() };

  if (name) updates.name = name;
  if (email) {
    const existing = authStore.getUserByEmail(email);
    if (existing && existing.id !== req.user.id) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    updates.email = email;
  }
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    updates.passwordHash = bcrypt.hashSync(password, 10);
  }

  const updated = authStore.updateUser(req.user.id, updates);
  const { passwordHash, ...safe } = updated;
  res.json(safe);
});

// GET /api/users - List users (admin only)
router.get('/', requireAuth, requireRole('admin'), (_req, res) => {
  const users = authStore.getAllUsers().map(({ passwordHash, ...u }) => u);
  res.json(users);
});

// PUT /api/users/:id/role - Update user role (admin only)
router.put('/:id/role', requireAuth, requireRole('admin'), (req, res) => {
  const { role } = req.body;
  const validRoles = ['admin', 'producer', 'operator'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  const user = authStore.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = authStore.updateUser(req.params.id, { role, updatedAt: new Date().toISOString() });
  const { passwordHash, ...safe } = updated;
  res.json(safe);
});

export default router;
