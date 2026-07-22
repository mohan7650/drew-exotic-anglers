const { Router } = require('express');
const { BREVO_API, brevoHeaders } = require('../utils/brevo');

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = parseInt(process.env.BREVO_LIST_ID, 10);

  if (!apiKey || !listId) {
    console.error('[subscribe] Missing BREVO_API_KEY or BREVO_LIST_ID');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const headers = brevoHeaders(apiKey);

  // Single idempotent upsert. `updateEnabled: true` creates the contact if new,
  // or updates it and adds it to the list if it already exists. This replaces
  // the previous GET /contacts/{email} existence-check + conditional create/add
  // flow: that lookup endpoint is intermittently slow on Brevo's side (~30s
  // stalls behind their Cloudflare edge) and was surfacing as user-facing 502s.
  // The POST /contacts upsert responds reliably in ~0.4s.
  try {
    const upsertRes = await fetch(`${BREVO_API}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
      signal: AbortSignal.timeout(12000),
    });

    // 201 = created (new contact), 204 = updated/added to list — both success.
    if (upsertRes.status === 201 || upsertRes.status === 204 || upsertRes.ok) {
      return res.status(200).json({ message: "You're subscribed! Welcome to the Drewsletter." });
    }

    const err = await upsertRes.json().catch(() => ({}));
    console.error('[subscribe] Brevo upsert error:', upsertRes.status, err);
    return res.status(500).json({ message: 'Failed to subscribe. Please try again.' });
  } catch (err) {
    console.error('[subscribe] Brevo network/timeout error:', err.message);
    return res.status(502).json({ message: 'Network error. Please try again.' });
  }
});

module.exports = router;
