import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const EVIDENCE_DIR = join(DATA_DIR, 'evidence');
const EVIDENCE_INDEX = join(EVIDENCE_DIR, 'index.json');

function ensureEvidenceDir() {
  if (!existsSync(EVIDENCE_DIR)) mkdirSync(EVIDENCE_DIR, { recursive: true });
  if (!existsSync(EVIDENCE_INDEX)) {
    writeFileSync(EVIDENCE_INDEX, JSON.stringify({ evidence: [] }, null, 2));
  }
}

function loadEvidenceIndex() {
  ensureEvidenceDir();
  return JSON.parse(readFileSync(EVIDENCE_INDEX, 'utf-8'));
}

function saveEvidenceIndex(data) {
  writeFileSync(EVIDENCE_INDEX, JSON.stringify(data, null, 2));
}

export class EvidenceCollector {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.consoleLogs = [];
    this.networkLogs = [];
    this.setupListeners();
  }

  setupListeners() {
    if (typeof window !== 'undefined') {
      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;
      console.log = (...args) => {
        this.consoleLogs.push({ level: 'log', message: args.map(String).join(' '), timestamp: Date.now() });
        return origLog.apply(console, args);
      };
      console.warn = (...args) => {
        this.consoleLogs.push({ level: 'warn', message: args.map(String).join(' '), timestamp: Date.now() });
        return origWarn.apply(console, args);
      };
      console.error = (...args) => {
        this.consoleLogs.push({ level: 'error', message: args.map(String).join(' '), timestamp: Date.now() });
        return origError.apply(console, args);
      };
    }
  }

  captureScreenshot(url) {
    const evidence = {
      id: `evd_${nanoid(8)}`,
      type: 'screenshot',
      url: url || '',
      capturedAt: new Date().toISOString(),
      data: null,
      note: `Screenshot capture requested for ${url || 'current page'}`
    };
    return evidence;
  }

  captureConsoleLogs() {
    const logs = [...this.consoleLogs];
    return {
      id: `evd_${nanoid(8)}`,
      type: 'console-log',
      capturedAt: new Date().toISOString(),
      data: logs,
      count: logs.length
    };
  }

  captureNetworkLogs() {
    const logs = [...this.networkLogs];
    return {
      id: `evd_${nanoid(8)}`,
      type: 'network-log',
      capturedAt: new Date().toISOString(),
      data: logs,
      count: logs.length
    };
  }

  captureError(error) {
    return {
      id: `evd_${nanoid(8)}`,
      type: 'error-stack',
      capturedAt: new Date().toISOString(),
      data: {
        message: error.message || String(error),
        stack: error.stack || null,
        name: error.name || 'Error'
      }
    };
  }

  captureApiError(endpoint, statusCode, responseBody) {
    return {
      id: `evd_${nanoid(8)}`,
      type: 'error-stack',
      capturedAt: new Date().toISOString(),
      data: {
        message: `API Error: ${statusCode} from ${endpoint}`,
        stack: null,
        name: 'ApiError',
        endpoint,
        statusCode,
        responseBody
      }
    };
  }

  attachEvidence(bugId, evidence) {
    const idx = loadEvidenceIndex();
    const entry = {
      id: evidence.id || `evd_${nanoid(8)}`,
      bugId,
      ...evidence,
      attachedAt: new Date().toISOString()
    };
    idx.evidence.push(entry);
    saveEvidenceIndex(idx);
    return entry;
  }

  getEvidenceForBug(bugId) {
    const idx = loadEvidenceIndex();
    return idx.evidence.filter(e => e.bugId === bugId);
  }

  getAllEvidence() {
    const idx = loadEvidenceIndex();
    return idx.evidence;
  }

  deleteEvidence(evidenceId) {
    const idx = loadEvidenceIndex();
    idx.evidence = idx.evidence.filter(e => e.id !== evidenceId);
    saveEvidenceIndex(idx);
    return true;
  }
}
