/**
 * Switcher API Routes
 * GET    /api/switcher                    - Get switcher state
 * POST   /api/switcher/switch             - Switch to input
 * POST   /api/switcher/preview            - Set preview input
 * POST   /api/switcher/transition         - Execute transition
 * POST   /api/switcher/cut                - Hard cut
 * PUT    /api/switcher/config             - Update switcher config
 * POST   /api/switcher/inputs             - Add input
 * DELETE /api/switcher/inputs/:id         - Remove input
 * GET    /api/switcher/macros             - List macros
 * POST   /api/switcher/macros             - Save macro
 * POST   /api/switcher/macros/:id/play    - Play macro
 * DELETE /api/switcher/macros/:id         - Delete macro
 * GET    /api/switcher/multiview          - Get multiview config
 * PUT    /api/switcher/multiview          - Update multiview config
 * GET    /api/switcher/tally              - Get tally states
 */
import { Router } from 'express';
import { SwitcherEngine } from '../switcher/switcherEngine.js';
import { PreviewProgram } from '../switcher/previewProgram.js';
import { TransitionEngine } from '../switcher/transitionEngine.js';
import { MacroRecorder } from '../switcher/macroRecorder.js';
import { MultiViewer } from '../switcher/multiViewer.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Instantiate switcher singletons
const switcherEngine = new SwitcherEngine();
const previewProgram = new PreviewProgram();
const transitionEngine = new TransitionEngine();
const macroRecorder = new MacroRecorder();
const multiViewer = new MultiViewer('4x2');

// Expose instances for socket handlers
router.switcherEngine = switcherEngine;
router.previewProgram = previewProgram;
router.transitionEngine = transitionEngine;
router.macroRecorder = macroRecorder;
router.multiViewer = multiViewer;

// ── Switcher State ────────────────────────────────────────

router.get('/', requireAuth, (_req, res) => {
  res.json({
    switcher: switcherEngine.getState(),
    previewProgram: previewProgram.getStatus(),
    transition: transitionEngine.getState(),
    multiview: multiViewer.getState()
  });
});

// ── Switching ─────────────────────────────────────────────

router.post('/switch', requireAuth, (req, res) => {
  try {
    const { inputId, transition } = req.body;
    if (!inputId) return res.status(400).json({ error: 'inputId is required' });

    switcherEngine.previewInput(inputId);
    previewProgram.setPreview(inputId);

    // Update multiview tally
    multiViewer.updateTally(switcherEngine.getProgramInput(), inputId);

    if (transition && transition !== 'cut') {
      previewProgram.swap();
      switcherEngine.switchTo(inputId, transition);
    } else {
      switcherEngine.cut();
      previewProgram.setProgram(inputId);
    }

    res.json(switcherEngine.getState());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/preview', requireAuth, (req, res) => {
  try {
    const { inputId } = req.body;
    if (!inputId) return res.status(400).json({ error: 'inputId is required' });

    switcherEngine.previewInput(inputId);
    previewProgram.setPreview(inputId);

    multiViewer.updateTally(switcherEngine.getProgramInput(), inputId);

    res.json(switcherEngine.getState());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/transition', requireAuth, async (req, res) => {
  try {
    const { type, duration } = req.body;
    await transitionEngine.startTransition(type || 'crossfade', duration);
    previewProgram.swap();
    const newProgram = previewProgram.getProgram();
    if (newProgram) switcherEngine.switchTo(newProgram, type || 'crossfade');

    multiViewer.updateTally(switcherEngine.getProgramInput(), switcherEngine.getPreviewInput());

    res.json({
      transition: transitionEngine.getState(),
      switcher: switcherEngine.getState()
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/cut', requireAuth, (_req, res) => {
  try {
    switcherEngine.cut();
    previewProgram.setProgram(switcherEngine.getProgramInput());

    multiViewer.updateTally(switcherEngine.getProgramInput(), switcherEngine.getPreviewInput());

    res.json(switcherEngine.getState());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Config ────────────────────────────────────────────────

router.put('/config', requireAuth, (req, res) => {
  const { transitionType, autoMode } = req.body;
  if (transitionType) transitionEngine.setAutoMode(autoMode || false);
  if (typeof autoMode === 'boolean') transitionEngine.setAutoMode(autoMode);
  res.json(transitionEngine.getState());
});

// ── Inputs ────────────────────────────────────────────────

router.post('/inputs', requireAuth, (req, res) => {
  try {
    const { name, type, source } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const input = switcherEngine.addInput({
      name,
      type: type || 'scene',
      source: source || ''
    });

    res.json(input);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/inputs/:id', requireAuth, (req, res) => {
  const removed = switcherEngine.removeInput(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Input not found' });
  res.json({ ok: true });
});

// ── Macros ────────────────────────────────────────────────

router.get('/macros', requireAuth, (_req, res) => {
  res.json(macroRecorder.listMacros());
});

router.post('/macros', requireAuth, (req, res) => {
  try {
    const { name } = req.body;

    if (!macroRecorder.getState().isRecording) {
      macroRecorder.startRecording();
      // Record current state as first action
      macroRecorder.recordAction('state', switcherEngine.getState());
    } else {
      const macro = macroRecorder.stopRecording();
      if (name && macro) {
        const saved = macroRecorder.saveMacro(name);
        return res.json(saved);
      }
      return res.json(macro);
    }

    res.json({ recording: true, id: macroRecorder.getState().currentMacro?.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/macros/:id/play', requireAuth, async (req, res) => {
  try {
    await macroRecorder.playMacro(req.params.id, (action, data) => {
      if (action === 'switch' && data.inputId) {
        switcherEngine.switchTo(data.inputId, data.transition || 'cut');
        previewProgram.setProgram(data.inputId);
      } else if (action === 'cut') {
        switcherEngine.cut();
      }
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/macros/:id', requireAuth, (req, res) => {
  const deleted = macroRecorder.deleteMacro(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Macro not found' });
  res.json({ ok: true });
});

// ── Multi-View ────────────────────────────────────────────

router.get('/multiview', requireAuth, (_req, res) => {
  res.json(multiViewer.getState());
});

router.put('/multiview', requireAuth, (req, res) => {
  try {
    const { layout, cells } = req.body;
    if (layout) multiViewer.setLayout(layout);
    if (cells && typeof cells === 'object') {
      for (const [cellId, inputId] of Object.entries(cells)) {
        multiViewer.setCellInput(Number(cellId), inputId);
      }
    }
    res.json(multiViewer.getState());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Tally ─────────────────────────────────────────────────

router.get('/tally', requireAuth, (_req, res) => {
  res.json(multiViewer.getState().tallyStates);
});

export default router;
