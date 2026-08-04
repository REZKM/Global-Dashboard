require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const db = require('./db');

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
app.use(express.json());

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
  console.log(`[requireAuth] path=${req.path} hasSession=${!!req.session} userEmail=${req.session && req.session.userEmail}`);
  if (req.session && req.session.userEmail) return next();
  return res.redirect('/login');
}

function render(res, view, replacements = {}) {
  const fs = require('fs');
  let html = fs.readFileSync(path.join(__dirname, 'views', view), 'utf8');
  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(`{{${key}}}`).join(value);
  }
  res.send(html);
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
  console.log(`[check-email] email=${email} isAllowed=${isAllowed} allowedList=${JSON.stringify(getAllowedEmails())}`);

  if (!isAllowed) {
    return render(res, 'login-email.html', {
      error: '<div class="error">That email isn\'t on the allowed list. Contact your admin to be added.</div>',
    });
  }

  const existing = await db.findUser(email);
  console.log(`[check-email] existing account found=${!!existing}`);
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
  console.log(`[set-password] created account for ${email}, setting session and redirecting to /dashboard`);

  req.session.userEmail = email;
  res.redirect('/dashboard');
}));

// ---- Step 2b: returning visitor logs in with their password ----
app.post('/enter-password', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;

  const user = await db.findUser(email);
  console.log(`[enter-password] email=${email} accountFound=${!!user}`);
  if (!user) {
    return render(res, 'login-email.html', { error: '' });
  }

  const ok = await bcrypt.compare(password || '', user.password_hash);
  console.log(`[enter-password] passwordMatch=${ok}`);
  if (!ok) {
    return render(res, 'enter-password.html', {
      email,
      error: '<div class="error">Wrong password.</div>',
    });
  }

  req.session.userEmail = email;
  console.log(`[enter-password] login success for ${email}, redirecting to /dashboard`);
  res.redirect('/dashboard');
}));

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// ---- Protected dashboard ----
// Drop your existing dashboard's HTML/CSS/JS files into public/dashboard/
// (index.html must exist there). Everything under it requires login.
app.use('/dashboard', requireAuth, express.static(path.join(__dirname, 'public', 'dashboard')));
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard', 'index.html'));
});

app.get('/', (req, res) => {
  res.redirect(req.session && req.session.userEmail ? '/dashboard' : '/login');
});

// Catches anything passed to next(err) — e.g. a temporary database hiccup
// during a request — and returns a normal error page instead of crashing.
app.use((err, req, res, next) => {
  console.error('Request failed:', err);
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
