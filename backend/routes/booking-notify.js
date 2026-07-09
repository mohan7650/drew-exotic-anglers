const { Router } = require('express');
const { BREVO_API, brevoHeaders } = require('../utils/brevo');

const router = Router();

router.post('/', async (req, res) => {
  const apiKey      = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName  = process.env.BREVO_SENDER_NAME || "Drew's Guide Service";
  const drewEmail   = process.env.DREW_NOTIFICATION_EMAIL;

  if (!apiKey || !senderEmail || !drewEmail) {
    console.error('[booking-notify] Missing env vars: BREVO_API_KEY, BREVO_SENDER_EMAIL, or DREW_NOTIFICATION_EMAIL');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const booking = req.body;
  const headers = brevoHeaders(apiKey);
  const customerName = `${booking.first_name || ''} ${booking.last_name || ''}`.trim();

  // ── Email 1: Notify Drew ──────────────────────────────────────────────────

  const drewHtml = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #0B3D2E; padding: 28px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #D4891A; font-size: 22px; letter-spacing: 0.04em;">
          New Booking Request
        </h1>
        <p style="margin: 6px 0 0; color: rgba(250,246,238,0.7); font-size: 14px;">
          Drew Guide Services · ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style="background: #ffffff; padding: 28px 32px; border: 1px solid #e5e5e5; border-top: none;">

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr>
              <td colspan="2" style="padding: 0 0 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0B3D2E; border-bottom: 2px solid #D4891A; padding-bottom: 8px;">
                Customer Information
              </td>
            </tr>
          </thead>
          <tbody>
            ${row('Name', customerName)}
            ${row('Email', `<a href="mailto:${booking.email}" style="color:#0B3D2E;">${booking.email}</a>`)}
            ${row('Phone', booking.phone)}
            ${row('Country', booking.country)}
          </tbody>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr>
              <td colspan="2" style="padding: 0 0 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0B3D2E; border-bottom: 2px solid #D4891A; padding-bottom: 8px;">
                Trip Details
              </td>
            </tr>
          </thead>
          <tbody>
            ${row('Selected Date', booking.selected_date)}
            ${row('Expedition', booking.expedition)}
            ${row('Duration', booking.duration)}
            ${row('Number of Anglers', booking.number_of_anglers)}
            ${row('Preferred Guide', booking.preferred_guide || '—')}
            ${row('Hotel / Pickup', booking.hotel || '—')}
            ${row('Experience Level', booking.experience_level)}
            ${row('Target Species', booking.target_species || '—')}
          </tbody>
        </table>

        ${booking.notes ? `
        <div style="background: #f9f6ee; border-left: 3px solid #D4891A; padding: 14px 18px; border-radius: 0 4px 4px 0; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #0B3D2E;">Additional Notes</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333;">${booking.notes}</p>
        </div>
        ` : ''}

        <div style="background: #0B3D2E; padding: 16px 20px; border-radius: 6px; text-align: center;">
          <a href="mailto:${booking.email}" style="color: #D4891A; font-size: 15px; font-weight: 700; text-decoration: none; letter-spacing: 0.03em;">
            Reply to ${booking.first_name} →
          </a>
        </div>
      </div>

      <div style="padding: 16px 32px; background: #f9f6ee; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #888;">Drew's Guide Services · Admin Notification</p>
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
          We received your request, ${booking.first_name}!
        </h2>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #444;">
          Thanks for contacting Drew's Guide Service. We received your booking request for
          <strong>${booking.expedition || 'your expedition'}</strong>${booking.selected_date ? ` on <strong>${booking.selected_date}</strong>` : ''}.
        </p>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #444;">
          Drew will personally review availability and contact you within <strong>24 hours</strong>.
        </p>

        <div style="background: #f9f6ee; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px 24px; margin: 24px 0; text-align: left;">
          <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #888;">Your Request Summary</p>
          ${summaryRow('Expedition', booking.expedition)}
          ${summaryRow('Date', booking.selected_date)}
          ${summaryRow('Duration', booking.duration)}
          ${summaryRow('Anglers', booking.number_of_anglers)}
        </div>

        <div style="background: #fff8ee; border: 1px solid #f0d9a8; border-radius: 6px; padding: 14px 18px; margin: 0 0 28px; text-align: left;">
          <p style="margin: 0; font-size: 13px; color: #8a6020; line-height: 1.5;">
            <strong>Please note:</strong> This is an availability request and not a confirmed booking.
            Your reservation will be confirmed by Drew directly.
          </p>
        </div>

        <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #444;">
          Have questions? Reply to this email or reach us on WhatsApp.
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
          replyTo:     { email: booking.email, name: customerName },
          subject:     `New Booking Request — ${customerName} · ${booking.selected_date || booking.expedition || 'Unknown'}`,
          htmlContent: drewHtml,
        }),
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${BREVO_API}/smtp/email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sender:      { name: senderName, email: senderEmail },
          to:          [{ email: booking.email, name: customerName }],
          subject:     "We received your booking request — Drew's Guide Service",
          htmlContent: customerHtml,
        }),
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    const drewOk = drewRes.status === 201 || drewRes.ok;
    const custOk = customerRes.status === 201 || customerRes.ok;

    if (!drewOk) {
      const err = await drewRes.json().catch(() => ({}));
      console.error('[booking-notify] Drew email failed:', drewRes.status, err);
    }
    if (!custOk) {
      const err = await customerRes.json().catch(() => ({}));
      console.error('[booking-notify] Customer email failed:', customerRes.status, err);
    }

    return res.status(200).json({ drewEmailSent: drewOk, customerEmailSent: custOk });
  } catch (err) {
    console.error('[booking-notify] Unexpected error:', err.message);
    return res.status(500).json({ message: 'Email delivery failed' });
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
