// Base URL for the Express API.
//
// In PRODUCTION the site is served same-origin behind a proxy that forwards
// `/api/*` to the Express backend, so the base must be RELATIVE (''). We force
// this for every production build regardless of REACT_APP_API_URL — otherwise a
// developer whose local `.env` sets REACT_APP_API_URL=http://localhost:3001
// bakes that into the bundle, and every form then POSTs to the visitor's own
// machine instead of the server (silent breakage; nothing reaches the backend).
//
// In DEVELOPMENT, call the local backend directly. Override the port/host with
// REACT_APP_API_URL if your backend runs elsewhere.
export const API_BASE =
  process.env.NODE_ENV === 'production'
    ? ''
    : (process.env.REACT_APP_API_URL || 'http://localhost:3001');
