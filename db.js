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

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
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

module.exports = { pool, init, findUser, createUser };
