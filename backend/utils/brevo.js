const BREVO_API = 'https://api.brevo.com/v3';

function brevoHeaders(apiKey) {
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    'api-key': apiKey,
  };
}

module.exports = { BREVO_API, brevoHeaders };
