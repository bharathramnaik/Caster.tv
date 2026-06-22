/**
 * Audit logger middleware for mutation requests.
 * Appends structured log entries to server/data/audit.log with rotation.
 */
import { appendFileSync, existsSync, renameSync, statSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, '..', '..', 'data');
const LOG_FILE = join(LOG_DIR, 'audit.log');
const MAX_SIZE = 5 * 1024 * 1024;

const MUTATION_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

function ensureDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

function rotateIfNeeded() {
  if (!existsSync(LOG_FILE)) return;
  try {
    const stat = statSync(LOG_FILE);
    if (stat.size >= MAX_SIZE) {
      const timestamp = Date.now();
      const rotated = join(LOG_DIR, `audit-${timestamp}.log`);
      renameSync(LOG_FILE, rotated);
    }
  } catch {
    // ignore rotation errors
  }
}

/**
 * Middleware that logs POST, PUT, DELETE, PATCH requests to the audit log.
 */
export const auditLogger = (req, res, next) => {
  if (!MUTATION_METHODS.has(req.method)) return next();

  const start = Date.now();

  res.on('finish', () => {
    try {
      ensureDir();
      rotateIfNeeded();

      const duration = Date.now() - start;
      const timestamp = new Date().toISOString();
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userId = req.user?.id || 'anonymous';
      const statusCode = res.statusCode;

      const entry = `${timestamp} | ${req.method} | ${req.originalUrl} | ${ip} | ${userId} | ${statusCode} | ${duration}\n`;
      appendFileSync(LOG_FILE, entry, 'utf-8');
    } catch {
      // do not let logging errors break the request
    }
  });

  next();
};
