const { Router } = require('express');
const { BREVO_API, brevoHeaders } = require('../utils/brevo');

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req, res) => {
  // Honeypot — bots fill hidden fields, humans don't
  if (req.body.botField) {
    return res.status(200).json({ message: 'Message received.' });
  }

  const firstName = (req.body.firstName || '').trim();
  const lastName  = (req.body.lastName  || '').trim();
  const email     = (req.body.email     || '').trim().toLowerCase();
  const tripType  = (req.body.tripType  || '').trim();
  const groupSize = (req.body.groupSize || '').trim();
  const message   = (req.body.message   || '').trim();
  const phone     = (req.body.phone     || '').trim();

  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'First and last name are required.' });
  }
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }
  if (!message) {
    return res.status(400).json({ message: 'A message is required.' });
  }

  if (firstName.length > 100 || lastName.length > 100) {
    return res.status(400).json({ message: 'Name must be 100 characters or fewer.' });
  }
  if (email.length > 254) {
    return res.status(400).json({ message: 'Email address is too long.' });
  }
  if (phone.length > 30) {
    return res.status(400).json({ message: 'Phone number must be 30 characters or fewer.' });
  }
  if (tripType.length > 100) {
    return res.status(400).json({ message: 'Trip type value is too long.' });
  }
  if (groupSize.length > 50) {
    return res.status(400).json({ message: 'Group size value is too long.' });
  }
  if (message.length > 5000) {
    return res.status(400).json({ message: 'Message must be 5,000 characters or fewer.' });
  }

  const apiKey      = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName  = process.env.BREVO_SENDER_NAME || "Drew's Guide Service";
  const drewEmail   = process.env.DREW_NOTIFICATION_EMAIL;

  if (!apiKey || !senderEmail || !drewEmail) {
    console.error('[contact] Missing env vars: BREVO_API_KEY, BREVO_SENDER_EMAIL, or DREW_NOTIFICATION_EMAIL');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const headers      = brevoHeaders(apiKey);
  const customerName = `${firstName} ${lastName}`;
  const submittedAt  = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Email 1: Notify Drew ──────────────────────────────────────────────────

  const drewHtml = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #0B3D2E; padding: 28px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #D4891A; font-size: 22px; letter-spacing: 0.04em;">
          New Contact Form Submission
        </h1>
        <p style="margin: 6px 0 0; color: rgba(250,246,238,0.7); font-size: 14px;">
          Drew's Guide Services · ${submittedAt}
        </p>
      </div>

      <div style="background: #ffffff; padding: 28px 32px; border: 1px solid #e5e5e5; border-top: none;">

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr>
              <td colspan="2" style="padding: 0 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0B3D2E; border-bottom: 2px solid #D4891A;">
                Customer Information
              </td>
            </tr>
          </thead>
          <tbody>
            ${row('Name', customerName)}
            ${row('Email', `<a href="mailto:${email}" style="color:#0B3D2E;">${email}</a>`)}
            ${phone ? row('Phone', phone) : ''}
          </tbody>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr>
              <td colspan="2" style="padding: 0 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0B3D2E; border-bottom: 2px solid #D4891A;">
                Trip Interest
              </td>
            </tr>
          </thead>
          <tbody>
            ${row('Trip Type', tripType)}
            ${row('Group Size', groupSize)}
          </tbody>
        </table>

        <div style="background: #f9f6ee; border-left: 3px solid #D4891A; padding: 14px 18px; border-radius: 0 4px 4px 0; margin-bottom: 24px;">
          <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #0B3D2E;">Message</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap;">${message}</p>
        </div>

        <div style="background: #0B3D2E; padding: 16px 20px; border-radius: 6px; text-align: center;">
          <a href="mailto:${email}" style="color: #D4891A; font-size: 15px; font-weight: 700; text-decoration: none; letter-spacing: 0.03em;">
            Reply to ${firstName} →
          </a>
        </div>
      </div>

      <div style="padding: 16px 32px; background: #f9f6ee; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #888;">Drew's Guide Services · Contact Form</p>
      </div>
    </div>
  `;

  // ── Email 2: Confirmation to Customer ────────────────────────────────────

  const customerHtml = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #0B3D2E; padding: 28px 32px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; color: #D4891A; font-size: 24px; letter-spacing: 0.04em;">
          Drew's Guide Services
        </h1>
        <p style="margin: 6px 0 0; color: rgba(250,246,238,0.7); font-size: 14px; letter-spacing: 0.06em;">
          WORLD-CLASS FISHING EXPEDITIONS
        </p>
      </div>

      <div style="background: #ffffff; padding: 36px 32px; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 16px;">🎣</div>
        <h2 style="margin: 0 0 12px; font-size: 20px; color: #0B3D2E;">
          Got your message, ${firstName}!
        </h2>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #444;">
          Thanks for reaching out to Drew's Guide Service. We received your enquiry about
          <strong>${tripType || 'a fishing expedition'}</strong>
          and Drew will personally get back to you within <strong>24 hours</strong>.
        </p>

        <div style="background: #f9f6ee; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px 24px; margin: 24px 0; text-align: left;">
          <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #888;">Your Enquiry Summary</p>
          ${summaryRow('Trip', tripType)}
          ${summaryRow('Group Size', groupSize)}
        </div>

        <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #444;">
          Have questions? Reply to this email or reach Drew on WhatsApp.
        </p>
      </div>

      <div style="padding: 20px 32px; background: #0B3D2E; border-radius: 0 0 8px 8px; text-align: center;">
        <p style="margin: 0 0 4px; color: rgba(250,246,238,0.9); font-size: 14px; font-weight: 700;">
          Drew's Guide Service
        </p>
        <p style="margin: 0; font-size: 12px; color: rgba(250,246,238,0.5);">
          World-Class Fishing Expeditions
        </p>
      </div>
    </div>
  `;

  // ── Send both emails ──────────────────────────────────────────────────────

  try {
    const [drewRes, customerRes] = await Promise.all([
      fetch(`${BREVO_API}/smtp/email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sender:      { name: senderName, email: senderEmail },
          to:          [{ email: drewEmail, name: 'Drew' }],
          replyTo:     { email, name: customerName },
          subject:     `New Contact — ${customerName} · ${tripType || 'General Enquiry'}`,
          htmlContent: drewHtml,
        }),
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${BREVO_API}/smtp/email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sender:      { name: senderName, email: senderEmail },
          to:          [{ email, name: customerName }],
          subject:     "We got your message — Drew's Guide Service",
          htmlContent: customerHtml,
        }),
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    const drewOk = drewRes.status === 201 || drewRes.ok;
    const custOk = customerRes.status === 201 || customerRes.ok;

    if (!drewOk) {
      const err = await drewRes.json().catch(() => ({}));
      console.error('[contact] Drew email failed:', drewRes.status, err);
    }
    if (!custOk) {
      const err = await customerRes.json().catch(() => ({}));
      console.error('[contact] Customer email failed:', customerRes.status, err);
    }

    if (!drewOk) {
      return res.status(500).json({ drewEmailSent: false, customerEmailSent: custOk });
    }

    return res.status(200).json({ drewEmailSent: true, customerEmailSent: custOk });
  } catch (err) {
    console.error('[contact] Unexpected error:', err.message);
    return res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
  }
});

function row(label, value) {
  return `
    <tr>
      <td style="padding: 10px 0; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #888; width: 38%; vertical-align: top; border-bottom: 1px solid #f0f0f0;">
        ${label}
      </td>
      <td style="padding: 10px 0; font-size: 14px; color: #1a1a1a; vertical-align: top; border-bottom: 1px solid #f0f0f0;">
        ${value || '—'}
      </td>
    </tr>
  `;
}

function summaryRow(label, value) {
  if (!value) return '';
  return `
    <p style="margin: 0 0 6px; font-size: 13px; color: #555;">
      <span style="font-weight: 700; color: #333;">${label}:</span> ${value}
    </p>
  `;
}

module.exports = router;
