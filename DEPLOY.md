# Deployment (self-hosted, behind an /api reverse proxy)

This app also runs outside Netlify, served by a web server that hosts the static
frontend and reverse-proxies `/api` to the Express backend (`backend/`). Two
things about that setup are easy to break on redeploy — both are handled in code
now, but keep them in mind.

## 1. The proxy strips the `/api` prefix

The hosting panel proxies the backend at path `/api` and **removes that prefix**
before forwarding. So a browser request to `/api/subscribe` arrives at Express as
`/subscribe`. To work both behind the proxy (prod) and when called directly
(local dev, where the frontend hits `http://localhost:3001/api/...`), every route
is mounted at **both** paths in `backend/server.js`:

```js
app.use(['/api/subscribe', '/subscribe'], subscribeRoute);   // and the others
```

Do not reduce these to the `/api/*` form only — that returns 404 for every live
form submission and no email is sent.

## 2. The frontend API base must be relative in production

In production the frontend is same-origin with the proxy, so it must call
**relative** `/api/...` URLs. `src/lib/apiBase.js` forces this for every
production build regardless of any `REACT_APP_API_URL` value:

```js
export const API_BASE =
  process.env.NODE_ENV === 'production' ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:3001');
```

All form fetches use `` `${API_BASE}/api/...` ``. **Do not** put
`process.env.REACT_APP_API_URL` back into the fetch calls: if a build machine has
`REACT_APP_API_URL=http://localhost:3001` in its `.env`, that gets baked into the
bundle and every form then POSTs to the visitor's own machine (silent failure —
nothing reaches the backend, and it isn't visible in a curl test of `/api`).

## Build & deploy

Frontend (build machine needs `REACT_APP_SUPABASE_URL` + `REACT_APP_SUPABASE_ANON_KEY` in `.env`):

```bash
npm install
npm run build              # NODE_ENV=production -> relative /api automatically
# upload the CONTENTS of build/ to the web root (include the dotfile build/.htaccess)
```

`public/.htaccess` provides SPA routing + asset caching for Apache/LiteSpeed
hosts (the Netlify equivalent is `public/_redirects`). It also passes `/api`
through untouched so the proxy can handle it.

Backend (persistent Node process):

```bash
cd backend
npm install
cp .env.example .env       # fill in BREVO_* keys, DREW_NOTIFICATION_EMAIL, ALLOWED_ORIGINS
npm start                  # node server.js
```

The panel's Node app must listen on the **same port** its `/api` proxy targets
(`PORT` in `backend/.env`), and `ALLOWED_ORIGINS` must include the production
domain(s).

## Newsletter subscribe

`routes/subscribe.js` does a single idempotent Brevo upsert
(`POST /contacts` with `updateEnabled: true`), which creates the contact or adds
an existing one to the list in one call. It intentionally does **not** do a
`GET /contacts/{email}` existence check first — that Brevo endpoint intermittently
stalls ~30s and was surfacing as user-facing 502s.
