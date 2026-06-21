/**
 * Webhook API Routes
 * Dynamic webhook endpoints for receiving external data.
 */
import { Router } from 'express';
import { webhookReceiver } from '../integrations/index.js';
import { feedManager } from '../integrations/index.js';

const router = Router();

// POST /api/webhooks/:path/:id - Receive webhook payload
router.post('/:path/:id', (req, res) => {
  try {
    const result = webhookReceiver.receive(req.params.id, {
      body: req.body,
      headers: req.headers,
      method: req.method
    });

    // Also push to feedManager if a matching feed exists
    feedManager.receiveWebhookData(req.params.id, result.payload);

    res.json({ ok: true, id: result.id, receivedAt: result.receivedAt });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/webhooks/:path/:id - Receive webhook payload (PUT)
router.put('/:path/:id', (req, res) => {
  try {
    const result = webhookReceiver.receive(req.params.id, {
      body: req.body,
      headers: req.headers,
      method: req.method
    });

    feedManager.receiveWebhookData(req.params.id, result.payload);

    res.json({ ok: true, id: result.id, receivedAt: result.receivedAt });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/webhooks/:path/:id/history - Get webhook history
router.get('/:path/:id/history', (req, res) => {
  try {
    const history = webhookReceiver.getHistory(req.params.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
