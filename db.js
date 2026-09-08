const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn(
    '\n⚠️  DATABASE_URL is not set. Add a Postgres database in Railway ' +
    '(New → Database → Add PostgreSQL) — it gets linked to this service automatically.\n'
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
});

// Without this handler, a routine network blip on an idle connection (which
// happens occasionally on any cloud-hosted database) throws an uncaught
// exception and crashes the whole app. Logging it here instead lets the pool
// quietly reconnect on the next query.
pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client (recovering):', err.message);
});

// A user can save as many as this many views before they have to delete one
// to make room for another. Keeps a single account from growing its row (and
// the dataset blobs inside it) unbounded.
const MAX_VIEWS_PER_USER = 20;

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  // Each saved view is a full snapshot of the dashboard's own in-memory STATE
  // object (filters, active tab/section, AND the loaded dataset) -- the exact
  // same JSON shape the dashboard already produces for its "Download
  // standalone HTML" bake, just handed to this API instead of baked into a
  // file. Storing the whole dataset per view (rather than only the filter
  // state) means a returning user needs zero re-uploading to pick up exactly
  // where they left off, at the cost of a larger `state` blob per row -- see
  // MAX_VIEWS_PER_USER above for why that's kept bounded.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_views (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      name TEXT NOT NULL,
      state JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS saved_views_email_idx ON saved_views(email)`);
}

async function findUser(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows[0] || null;
}

async function createUser(email, passwordHash) {
  await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
    [email.toLowerCase(), passwordHash]
  );
}

// ---------------------------------------------------------------------------
// Saved views -- every query here is scoped by `email` (taken from the
// caller's own session server-side, never from anything the client sends) so
// one user can never read, overwrite, or delete another user's saved view,
// even by guessing an id.
// ---------------------------------------------------------------------------

// Listing never selects the `state` column -- for a dataset-sized view that
// column alone can be several MB, and the picker only needs the name/date to
// render a list.
async function listViews(email) {
  const { rows } = await pool.query(
    'SELECT id, name, updated_at FROM saved_views WHERE email = $1 ORDER BY updated_at DESC',
    [email.toLowerCase()]
  );
  return rows;
}

async function countViews(email) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM saved_views WHERE email = $1',
    [email.toLowerCase()]
  );
  return rows[0].count;
}

async function createView(email, name, state) {
  const { rows } = await pool.query(
    'INSERT INTO saved_views (email, name, state) VALUES ($1, $2, $3) RETURNING id, name, updated_at',
    [email.toLowerCase(), name, state]
  );
  return rows[0];
}

async function getView(id, email) {
  const { rows } = await pool.query(
    'SELECT id, name, state, updated_at FROM saved_views WHERE id = $1 AND email = $2',
    [id, email.toLowerCase()]
  );
  return rows[0] || null;
}

async function updateView(id, email, name, state) {
  const { rows } = await pool.query(
    'UPDATE saved_views SET name = $3, state = $4, updated_at = NOW() WHERE id = $1 AND email = $2 RETURNING id, name, updated_at',
    [id, email.toLowerCase(), name, state]
  );
  return rows[0] || null;
}

async function deleteView(id, email) {
  const { rowCount } = await pool.query(
    'DELETE FROM saved_views WHERE id = $1 AND email = $2',
    [id, email.toLowerCase()]
  );
  return rowCount > 0;
}

module.exports = {
  pool,
  init,
  findUser,
  createUser,
  MAX_VIEWS_PER_USER,
  listViews,
  countViews,
  createView,
  getView,
  updateView,
  deleteView,
};
