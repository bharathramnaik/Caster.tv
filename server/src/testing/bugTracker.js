import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const BUGS_FILE = join(DATA_DIR, 'bugs.json');
const TESTS_FILE = join(DATA_DIR, 'tests.json');

function ensureDataFiles() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(BUGS_FILE)) writeFileSync(BUGS_FILE, JSON.stringify({ bugs: [], counter: 0 }, null, 2));
  if (!existsSync(TESTS_FILE)) writeFileSync(TESTS_FILE, JSON.stringify({ tests: [], counter: 0, runs: [] }, null, 2));
}

function loadBugs() {
  ensureDataFiles();
  return JSON.parse(readFileSync(BUGS_FILE, 'utf-8'));
}

function saveBugs(data) {
  writeFileSync(BUGS_FILE, JSON.stringify(data, null, 2));
}

function loadTests() {
  ensureDataFiles();
  return JSON.parse(readFileSync(TESTS_FILE, 'utf-8'));
}

function saveTests(data) {
  writeFileSync(TESTS_FILE, JSON.stringify(data, null, 2));
}

export class BugTracker {
  createBug(bug) {
    const data = loadBugs();
    data.counter++;
    const newBug = {
      id: `BUG-${String(data.counter).padStart(3, '0')}`,
      title: bug.title || '',
      description: bug.description || '',
      severity: bug.severity || 'P3',
      status: 'open',
      stepsToReproduce: bug.stepsToReproduce || [],
      expectedBehavior: bug.expectedBehavior || '',
      actualBehavior: bug.actualBehavior || '',
      evidence: bug.evidence || [],
      assignedTo: bug.assignedTo || null,
      tags: bug.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null,
      verificationStatus: null,
      comments: []
    };
    data.bugs.push(newBug);
    saveBugs(data);
    return newBug;
  }

  updateBug(id, updates) {
    const data = loadBugs();
    const bug = data.bugs.find(b => b.id === id);
    if (!bug) return null;
    Object.assign(bug, updates, { updatedAt: new Date().toISOString() });
    saveBugs(data);
    return bug;
  }

  resolveBug(id, evidence = []) {
    const data = loadBugs();
    const bug = data.bugs.find(b => b.id === id);
    if (!bug) return null;
    bug.status = 'resolved';
    bug.resolvedAt = new Date().toISOString();
    bug.updatedAt = new Date().toISOString();
    if (evidence.length > 0) {
      bug.evidence = [...(bug.evidence || []), ...evidence];
    }
    saveBugs(data);
    return bug;
  }

  closeBug(id) {
    const data = loadBugs();
    const bug = data.bugs.find(b => b.id === id);
    if (!bug) return null;
    bug.status = 'closed';
    bug.verificationStatus = 'verified';
    bug.updatedAt = new Date().toISOString();
    saveBugs(data);
    return bug;
  }

  reopenBug(id) {
    const data = loadBugs();
    const bug = data.bugs.find(b => b.id === id);
    if (!bug) return null;
    bug.status = 'open';
    bug.resolvedAt = null;
    bug.resolvedBy = null;
    bug.verificationStatus = null;
    bug.updatedAt = new Date().toISOString();
    saveBugs(data);
    return bug;
  }

  addComment(bugId, comment) {
    const data = loadBugs();
    const bug = data.bugs.find(b => b.id === bugId);
    if (!bug) return null;
    const c = {
      id: `CMT-${Date.now()}`,
      author: comment.author || 'system',
      text: comment.text || '',
      createdAt: new Date().toISOString()
    };
    bug.comments = bug.comments || [];
    bug.comments.push(c);
    bug.updatedAt = new Date().toISOString();
    saveBugs(data);
    return c;
  }

  getBug(id) {
    const data = loadBugs();
    return data.bugs.find(b => b.id === id) || null;
  }

  getBugs(filters = {}) {
    const data = loadBugs();
    let bugs = [...data.bugs];
    if (filters.status) bugs = bugs.filter(b => b.status === filters.status);
    if (filters.severity) bugs = bugs.filter(b => b.severity === filters.severity);
    if (filters.assignedTo) bugs = bugs.filter(b => b.assignedTo === filters.assignedTo);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      bugs = bugs.filter(b =>
        b.title.toLowerCase().includes(s) ||
        b.description.toLowerCase().includes(s) ||
        b.id.toLowerCase().includes(s)
      );
    }
    bugs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return bugs;
  }

  getBugStats() {
    const data = loadBugs();
    const bugs = data.bugs;
    const stats = {
      total: bugs.length,
      open: bugs.filter(b => b.status === 'open').length,
      inProgress: bugs.filter(b => b.status === 'in-progress').length,
      resolved: bugs.filter(b => b.status === 'resolved').length,
      closed: bugs.filter(b => b.status === 'closed').length,
      bySeverity: {
        P0: bugs.filter(b => b.severity === 'P0').length,
        P1: bugs.filter(b => b.severity === 'P1').length,
        P2: bugs.filter(b => b.severity === 'P2').length,
        P3: bugs.filter(b => b.severity === 'P3').length,
        P4: bugs.filter(b => b.severity === 'P4').length,
      },
      avgResolutionTimeMs: 0,
      trend: []
    };
    const resolved = bugs.filter(b => b.resolvedAt);
    if (resolved.length > 0) {
      const totalMs = resolved.reduce((sum, b) => {
        return sum + (new Date(b.resolvedAt) - new Date(b.createdAt));
      }, 0);
      stats.avgResolutionTimeMs = Math.round(totalMs / resolved.length);
    }
    const dayMap = {};
    for (const b of bugs) {
      const day = b.createdAt.slice(0, 10);
      dayMap[day] = (dayMap[day] || 0) + 1;
    }
    stats.trend = Object.entries(dayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return stats;
  }

  createTestCase(test) {
    const data = loadTests();
    const tc = {
      id: `TC-${String(data.tests.length + 1).padStart(3, '0')}`,
      name: test.name || '',
      category: test.category || 'general',
      type: test.type || 'api',
      method: test.method || 'GET',
      url: test.url || '',
      steps: test.steps || [],
      expectedResult: test.expectedResult || '',
      expectedStatus: test.expectedStatus || 200,
      expectedBody: test.expectedBody || null,
      timeout: test.timeout || 5000,
      status: 'pending',
      lastResult: null,
      bugId: null,
      createdAt: new Date().toISOString()
    };
    data.tests.push(tc);
    saveTests(data);
    return tc;
  }

  updateTestCase(id, updates) {
    const data = loadTests();
    const tc = data.tests.find(t => t.id === id);
    if (!tc) return null;
    Object.assign(tc, updates);
    saveTests(data);
    return tc;
  }

  getTestCase(id) {
    const data = loadTests();
    return data.tests.find(t => t.id === id) || null;
  }

  getTestCases(filters = {}) {
    const data = loadTests();
    let tests = [...data.tests];
    if (filters.category) tests = tests.filter(t => t.category === filters.category);
    if (filters.type) tests = tests.filter(t => t.type === filters.type);
    if (filters.status) tests = tests.filter(t => t.status === filters.status);
    return tests;
  }

  runTest(id, result) {
    const data = loadTests();
    const tc = data.tests.find(t => t.id === id);
    if (!tc) return null;
    tc.status = result.status || 'fail';
    tc.lastResult = {
      passed: result.passed || false,
      actualStatus: result.actualStatus,
      actualBody: result.actualBody,
      error: result.error || null,
      duration: result.duration || 0,
      ranAt: new Date().toISOString()
    };
    if (result.bugId) tc.bugId = result.bugId;
    saveTests(data);
    return tc;
  }

  getTestResults() {
    const data = loadTests();
    const tests = data.tests;
    return {
      total: tests.length,
      passed: tests.filter(t => t.status === 'pass').length,
      failed: tests.filter(t => t.status === 'fail').length,
      blocked: tests.filter(t => t.status === 'blocked').length,
      pending: tests.filter(t => t.status === 'pending').length,
      tests: tests.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        type: t.type,
        status: t.status,
        lastResult: t.lastResult,
        bugId: t.bugId
      }))
    };
  }

  getTestCoverage() {
    const data = loadTests();
    const tests = data.tests;
    const categories = {};
    for (const t of tests) {
      if (!categories[t.category]) {
        categories[t.category] = { total: 0, passed: 0, failed: 0, blocked: 0 };
      }
      categories[t.category].total++;
      if (t.status === 'pass') categories[t.category].passed++;
      else if (t.status === 'fail') categories[t.category].failed++;
      else if (t.status === 'blocked') categories[t.category].blocked++;
    }
    const total = tests.length;
    const passed = tests.filter(t => t.status === 'pass').length;
    return {
      overall: total > 0 ? Math.round((passed / total) * 100) : 0,
      total,
      passed,
      categories
    };
  }
}
