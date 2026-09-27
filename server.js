require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const db = require('./db');
const { loadDesignHead, injectDesign } = require('./design');

const app = express();
const PORT = process.env.PORT || 3000;

// Railway sits in front of the app as a reverse proxy — this makes Express
// aware of that so things like req.protocol/req.ip reflect the real client.
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Allowed emails: set the ALLOWED_EMAILS env var on Railway to a comma
// separated list, e.g:  ALLOWED_EMAILS=alice@example.com,bob@example.com
// Anyone on this list can log in. The first time they enter their email
// they're asked to create a password; after that they log in with it.
// Passwords are stored (hashed) in Postgres, so add a Postgres database in
// Railway and it links itself in automatically via DATABASE_URL.
// ---------------------------------------------------------------------------
function getAllowedEmails() {
  return String(process.env.ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

if (getAllowedEmails().length === 0) {
  console.warn(
    '\n⚠️  No allowed emails configured. Set ALLOWED_EMAILS before deploying.\n' +
    '   Example: ALLOWED_EMAILS=you@example.com,colleague@example.com\n'
  );
}

if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET is not set. Using an insecure default — set this in production.');
}

app.use(express.urlencoded({ extended: false }));
// Saved views can carry a full dataset snapshot (see "Saved views API" below),
// which can run into the low single-digit megabytes as JSON -- well past
// express.json()'s 100kb default limit -- so this is raised accordingly.
app.use(express.json({ limit: '25mb' }));

app.use(
  cookieSession({
    name: 'session',
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me',
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
    httpOnly: true,
    sameSite: 'lax',
    // Deliberately not requiring "secure" (HTTPS-only) here: some platform
    // proxies don't preserve that strictly enough for the cookie to survive
    // the hop to the browser, which silently drops the whole session right
    // after login. httpOnly + sameSite already block the realistic attacks
    // (script access, cross-site requests) for a small internal dashboard.
  })
);

function requireAuth(req, res, next) {
  if (req.session && req.session.userEmail) return next();
  return res.redirect('/login');
}

function requireApiAuth(req, res, next) {
  if (req.session && req.session.userEmail) return next();
  return res.status(401).json({ error: 'Not logged in.' });
}

// Colours and fonts for every page come from DESIGN.md. In production it is read once at
// startup (redeploy to apply a change); locally it is re-read on each request.
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
let designHeadCache = null;
function designHead() {
  if (!IS_PRODUCTION || !designHeadCache) designHeadCache = loadDesignHead();
  return designHeadCache;
}

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Login pages. `error` is trusted HTML written in this file; every other value is escaped.
const AUTH_STYLES = fs.readFileSync(path.join(__dirname, 'views', 'auth.css'), 'utf8');
function render(res, view, replacements = {}) {
  let html = fs.readFileSync(path.join(__dirname, 'views', view), 'utf8');
  html = html.split('{{authStyles}}').join(AUTH_STYLES);
  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(`{{${key}}}`).join(key === 'error' ? value : escapeHtml(value));
  }
  res.send(injectDesign(html, designHead()));
}

// Express 4 does not catch errors thrown inside an async route handler —
// an unhandled rejection there would otherwise crash the whole process.
// Wrapping every async route with this wires it into the error middleware
// below instead.
function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// ---- Step 1: ask for email ----
app.get('/login', (req, res) => {
  if (req.session && req.session.userEmail) return res.redirect('/dashboard');
  render(res, 'login-email.html', { error: '' });
});

app.post('/check-email', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const isAllowed = !!email && getAllowedEmails().includes(email);

  if (!isAllowed) {
    return render(res, 'login-email.html', {
      error: '<div class="error">That email isn\'t on the allowed list. Contact your admin to be added.</div>',
    });
  }

  const existing = await db.findUser(email);
  if (existing) {
    return render(res, 'enter-password.html', { email, error: '' });
  }
  return render(res, 'set-password.html', { email, error: '' });
}));

// ---- Step 2a: first-time visitor creates a password ----
app.post('/set-password', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password, confirmPassword } = req.body;

  if (!getAllowedEmails().includes(email)) {
    return render(res, 'login-email.html', { error: '<div class="error">That email isn\'t on the allowed list.</div>' });
  }

  const existing = await db.findUser(email);
  if (existing) {
    // Someone already claimed this email while this form was open — send them to the normal login instead.
    return render(res, 'enter-password.html', { email, error: '' });
  }

  if (!password || password.length < 8) {
    return render(res, 'set-password.html', {
      email,
      error: '<div class="error">Password must be at least 8 characters.</div>',
    });
  }

  if (password !== confirmPassword) {
    return render(res, 'set-password.html', {
      email,
      error: '<div class="error">Passwords don\'t match.</div>',
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.createUser(email, passwordHash);

  req.session.userEmail = email;
  res.redirect('/dashboard');
}));

// ---- Step 2b: returning visitor logs in with their password ----
app.post('/enter-password', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;

  const user = await db.findUser(email);
  if (!user) {
    return render(res, 'login-email.html', { error: '' });
  }

  const ok = await bcrypt.compare(password || '', user.password_hash);
  if (!ok) {
    return render(res, 'enter-password.html', {
      email,
      error: '<div class="error">Wrong password.</div>',
    });
  }

  req.session.userEmail = email;
  res.redirect('/dashboard');
}));

// ---------------------------------------------------------------------------
// Saved views API -- used by the dashboard's own JS (BIGD_0.2.html) to let a
// signed-in user save their current dashboard (filters, active tab, AND the
// loaded dataset -- the same snapshot shape the dashboard already builds for
// its "Download standalone HTML" feature) and restore it on a later visit,
// from any device, without re-uploading anything.
//
// Every route below is scoped to req.session.userEmail -- taken from the
// caller's own authenticated session, never from a client-supplied field --
// so one user can never list, read, overwrite, or delete another user's
// saved view, even by guessing an id (db.js's queries all filter by email
// too, as a second layer of the same guarantee).
// ---------------------------------------------------------------------------
const MAX_VIEW_NAME_LENGTH = 120;

function cleanViewName(raw) {
  return String(raw || '').trim().slice(0, MAX_VIEW_NAME_LENGTH);
}

app.get('/api/me', requireApiAuth, (req, res) => {
  res.json({ email: req.session.userEmail });
});

app.get('/api/views', requireApiAuth, asyncHandler(async (req, res) => {
  const views = await db.listViews(req.session.userEmail);
  res.json({ views });
}));

app.post('/api/views', requireApiAuth, asyncHandler(async (req, res) => {
  const name = cleanViewName(req.body.name);
  const state = req.body.state;
  if (!name) return res.status(400).json({ error: 'A view name is required.' });
  if (!state || typeof state !== 'object') return res.status(400).json({ error: 'Missing view state.' });

  const count = await db.countViews(req.session.userEmail);
  if (count >= db.MAX_VIEWS_PER_USER) {
    return res.status(400).json({
      error: `You've reached the limit of ${db.MAX_VIEWS_PER_USER} saved views. Delete one first.`,
    });
  }

  const view = await db.createView(req.session.userEmail, name, state);
  res.json({ view });
}));

app.get('/api/views/:id', requireApiAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id.' });
  const view = await db.getView(id, req.session.userEmail);
  if (!view) return res.status(404).json({ error: 'View not found.' });
  res.json({ view });
}));

app.put('/api/views/:id', requireApiAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id.' });
  const name = cleanViewName(req.body.name);
  const state = req.body.state;
  if (!name) return res.status(400).json({ error: 'A view name is required.' });
  if (!state || typeof state !== 'object') return res.status(400).json({ error: 'Missing view state.' });

  const view = await db.updateView(id, req.session.userEmail, name, state);
  if (!view) return res.status(404).json({ error: 'View not found.' });
  res.json({ view });
}));

app.delete('/api/views/:id', requireApiAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id.' });
  const deleted = await db.deleteView(id, req.session.userEmail);
  if (!deleted) return res.status(404).json({ error: 'View not found.' });
  res.json({ ok: true });
}));

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// ---- Protected dashboard ----
// The dashboard is one self-contained page: public/dashboard/index.html. It is served with
// the DESIGN.md tokens injected into its <head>. DASHBOARD_INDEX_FILE can point at a
// different file name in that folder; if that file doesn't exist, index.html is used.
const DASHBOARD_DIR = path.join(__dirname, 'public', 'dashboard');
function dashboardFile() {
  const configured = process.env.DASHBOARD_INDEX_FILE;
  if (configured && configured !== path.basename(configured)) {
    console.warn(`DASHBOARD_INDEX_FILE must be a file name, not a path; using index.html.`);
  } else if (configured && fs.existsSync(path.join(DASHBOARD_DIR, configured))) {
    return configured;
  } else if (configured) {
    console.warn(`DASHBOARD_INDEX_FILE "${configured}" not found in public/dashboard; using index.html.`);
  }
  return 'index.html';
}
let dashboardCache = null;
function dashboardHtml() {
  if (!IS_PRODUCTION || !dashboardCache) {
    const page = fs.readFileSync(path.join(DASHBOARD_DIR, dashboardFile()), 'utf8');
    dashboardCache = injectDesign(page, designHead());
  }
  return dashboardCache;
}
app.get(['/dashboard', '/dashboard/', '/dashboard/index.html'], requireAuth, (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.type('html').send(dashboardHtml());
});

app.get('/', (req, res) => {
  res.redirect(req.session && req.session.userEmail ? '/dashboard' : '/login');
});

// Catches anything passed to next(err) — e.g. a temporary database hiccup
// during a request — and returns a normal error page instead of crashing.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    console.warn('Request body too large:', err.message);
    const message = 'That saved view is too large to store (over the 25MB limit).';
    if (req.path.startsWith('/api/')) return res.status(413).json({ error: message });
    return res.status(413).send(message);
  }
  console.error('Request failed:', err);
  if (req.path.startsWith('/api/')) return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  res.status(500).send('Something went wrong. Please try again.');
});

// Last-resort safety net: log unexpected errors instead of letting the whole
// service crash and restart. If you start seeing these often, something is
// worth investigating, but a single transient blip shouldn't take the app down.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection (recovering):', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception (recovering):', err);
});

db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
