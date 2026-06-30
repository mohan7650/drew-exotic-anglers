const BREVO_API = 'https://api.brevo.com/v3';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  let email;
  try {
    const body = JSON.parse(event.body || '{}');
    email = (body.email || '').trim().toLowerCase();
  } catch {
    return { statusCode: 400, body: JSON.stringify({ message: 'Invalid request body' }) };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Please enter a valid email address' }),
    };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = parseInt(process.env.BREVO_LIST_ID, 10);

  if (!apiKey || !listId) {
    console.error('[subscribe] Missing BREVO_API_KEY or BREVO_LIST_ID');
    return { statusCode: 500, body: JSON.stringify({ message: 'Server configuration error' }) };
  }

  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    'api-key': apiKey,
  };

  let checkRes;
  try {
    checkRes = await fetch(`${BREVO_API}/contacts/${encodeURIComponent(email)}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error('[subscribe] Brevo GET timeout/network error:', err.message);
    return {
      statusCode: 502,
      body: JSON.stringify({ message: 'Network error. Please try again.' }),
    };
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
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'You\'re subscribed! Welcome to the Drewsletter.' }),
        };
      }

      const err = await createRes.json().catch(() => ({}));
      console.error('[subscribe] Brevo create error:', createRes.status, err);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to subscribe. Please try again.' }),
      };
    }

    if (checkRes.ok) {
      // Existing contact — check if already in this list
      const contact = await checkRes.json();
      const inList = Array.isArray(contact.listIds) && contact.listIds.includes(listId);

      if (inList) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'You\'re already subscribed!',
            alreadySubscribed: true,
          }),
        };
      }

      // Add existing contact to list
      const addRes = await fetch(`${BREVO_API}/contacts/lists/${listId}/contacts/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ emails: [email] }),
        signal: AbortSignal.timeout(8000),
      });

      if (addRes.ok || addRes.status === 204) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'You\'re subscribed! Welcome to the Drewsletter.' }),
        };
      }

      const err = await addRes.json().catch(() => ({}));
      console.error('[subscribe] Brevo add-to-list error:', addRes.status, err);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to subscribe. Please try again.' }),
      };
    }

    // Unexpected status from Brevo
    console.error('[subscribe] Brevo unexpected status:', checkRes.status);
    return {
      statusCode: 502,
      body: JSON.stringify({ message: 'Service unavailable. Please try again.' }),
    };
  } catch (err) {
    console.error('[subscribe] Unexpected error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An unexpected error occurred. Please try again.' }),
    };
  }
};
