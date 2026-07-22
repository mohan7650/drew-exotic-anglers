require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const validateJson = require('./middleware/validateJson');

const bookingNotifyRoute = require('./routes/booking-notify');
const subscribeRoute     = require('./routes/subscribe');
const contactRoute       = require('./routes/contact');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: allowedOrigins,
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(validateJson);

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});
// NOTE: In production the Enhance panel proxies this app at path "/api" and
// STRIPS that prefix before forwarding, so requests arrive as /booking-notify,
// /subscribe, /contact. Local dev (and any direct call) uses the /api/* form.
// Mount both so the app works behind the proxy AND locally. Do not remove the
// bare-path mounts on a git redeploy or live email delivery breaks.
app.use(['/api', '/booking-notify', '/subscribe', '/contact'], apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(['/api/booking-notify', '/booking-notify'], bookingNotifyRoute);
app.use(['/api/subscribe', '/subscribe'],           subscribeRoute);
app.use(['/api/contact', '/contact'],               contactRoute);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
  console.log(`[server] Allowed origins: ${allowedOrigins.join(', ') || '(none configured)'}`);
});
