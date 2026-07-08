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

  let checkRes;
  try {
    checkRes = await fetch(`${BREVO_API}/contacts/${encodeURIComponent(email)}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error('[subscribe] Brevo GET timeout/network error:', err.message);
    return res.status(502).json({ message: 'Network error. Please try again.' });
  }

  try {
    if (checkRes.status === 404) {
      // New contact — create and add to list in one call
      const createRes = await fetch(`${BREVO_API}/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, listIds: [listId], updateEnabled: false }),
        signal: AbortSignal.timeout(8000),
      });

      if (createRes.status === 204 || createRes.ok) {
        return res.status(200).json({ message: "You're subscribed! Welcome to the Drewsletter." });
      }

      const err = await createRes.json().catch(() => ({}));
      console.error('[subscribe] Brevo create error:', createRes.status, err);
      return res.status(500).json({ message: 'Failed to subscribe. Please try again.' });
    }

    if (checkRes.ok) {
      // Existing contact — check if already in this list
      const contact = await checkRes.json();
      const inList = Array.isArray(contact.listIds) && contact.listIds.includes(listId);

      if (inList) {
        return res.status(200).json({
          message: "You're already subscribed!",
          alreadySubscribed: true,
        });
      }

      // Add existing contact to list
      const addRes = await fetch(`${BREVO_API}/contacts/lists/${listId}/contacts/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ emails: [email] }),
        signal: AbortSignal.timeout(8000),
      });

      if (addRes.ok || addRes.status === 204) {
        return res.status(200).json({ message: "You're subscribed! Welcome to the Drewsletter." });
      }

      const err = await addRes.json().catch(() => ({}));
      console.error('[subscribe] Brevo add-to-list error:', addRes.status, err);
      return res.status(500).json({ message: 'Failed to subscribe. Please try again.' });
    }

    // Unexpected status from Brevo
    console.error('[subscribe] Brevo unexpected status:', checkRes.status);
    return res.status(502).json({ message: 'Service unavailable. Please try again.' });
  } catch (err) {
    console.error('[subscribe] Unexpected error:', err.message);
    return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
  }
});

module.exports = router;
