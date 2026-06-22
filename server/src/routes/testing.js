import { Router } from 'express';
import { BugTracker, TestRunner, EvidenceCollector } from '../testing/index.js';

const router = Router();
const bugTracker = new BugTracker();
const testRunner = new TestRunner();
const evidenceCollector = new EvidenceCollector();

// ── Bug Management ────────────────────────────────────────────

router.post('/bugs', (req, res) => {
  try {
    const bug = bugTracker.createBug(req.body);
    res.json(bug);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/bugs/stats', (_req, res) => {
  try {
    res.json(bugTracker.getBugStats());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/bugs', (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      severity: req.query.severity,
      assignedTo: req.query.assignedTo,
      search: req.query.search
    };
    Object.keys(filters).forEach(k => { if (!filters[k]) delete filters[k]; });
    res.json(bugTracker.getBugs(filters));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/bugs/:id', (req, res) => {
  try {
    const bug = bugTracker.getBug(req.params.id);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    const evidence = evidenceCollector.getEvidenceForBug(bug.id);
    res.json({ ...bug, evidenceItems: evidence });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/bugs/:id', (req, res) => {
  try {
    const bug = bugTracker.updateBug(req.params.id, req.body);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    res.json(bug);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/bugs/:id/resolve', (req, res) => {
  try {
    const evidence = req.body.evidence || [];
    const bug = bugTracker.resolveBug(req.params.id, evidence);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    res.json(bug);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/bugs/:id/close', (req, res) => {
  try {
    const bug = bugTracker.closeBug(req.params.id);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    res.json(bug);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/bugs/:id/reopen', (req, res) => {
  try {
    const bug = bugTracker.reopenBug(req.params.id);
    if (!bug) return res.status(404).json({ error: 'Bug not found' });
    res.json(bug);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/bugs/:id/comments', (req, res) => {
  try {
    const comment = bugTracker.addComment(req.params.id, req.body);
    if (!comment) return res.status(404).json({ error: 'Bug not found' });
    res.json(comment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Test Management ───────────────────────────────────────────

router.post('/tests', (req, res) => {
  try {
    const tc = bugTracker.createTestCase(req.body);
    res.json(tc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/tests', (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      type: req.query.type,
      status: req.query.status
    };
    Object.keys(filters).forEach(k => { if (!filters[k]) delete filters[k]; });
    res.json(bugTracker.getTestCases(filters));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/tests/:id/run', async (req, res) => {
  try {
    const result = await testRunner.runSingleTest(req.params.id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/tests/run-all', async (_req, res) => {
  try {
    const run = await testRunner.runAllTests();
    res.json(run);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/tests/run-suite/:suite', async (req, res) => {
  try {
    const run = await testRunner.runTestSuite(req.params.suite);
    res.json(run);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/tests/results', (_req, res) => {
  try {
    res.json(testRunner.getResults());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/tests/report', (_req, res) => {
  try {
    res.json(testRunner.getReport());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/tests/coverage', (_req, res) => {
  try {
    res.json(bugTracker.getTestCoverage());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Evidence ──────────────────────────────────────────────────

router.post('/evidence/:bugId', (req, res) => {
  try {
    const entry = evidenceCollector.attachEvidence(req.params.bugId, req.body);
    res.json(entry);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/evidence/:bugId', (req, res) => {
  try {
    res.json(evidenceCollector.getEvidenceForBug(req.params.bugId));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/evidence', (_req, res) => {
  try {
    res.json(evidenceCollector.getAllEvidence());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
