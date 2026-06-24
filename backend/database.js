const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      camper_first_name TEXT NOT NULL,
      camper_last_name TEXT NOT NULL,
      camper_dob TEXT NOT NULL,
      camper_age INTEGER NOT NULL,
      camper_gender TEXT NOT NULL,
      church TEXT DEFAULT '',
      parent_name TEXT NOT NULL,
      parent_relationship TEXT NOT NULL,
      parent_phone TEXT NOT NULL,
      parent_email TEXT DEFAULT '',
      allergies TEXT DEFAULT '',
      medications TEXT DEFAULT '',
      special_needs TEXT DEFAULT '',
      emergency_contact_name TEXT NOT NULL,
      emergency_contact_phone TEXT NOT NULL,
      session TEXT DEFAULT '',
      tshirt_size TEXT NOT NULL,
      activities TEXT DEFAULT '[]',
      dietary_restrictions TEXT DEFAULT '',
      gcash_reference TEXT,
      gcash_receipt_path TEXT,
      parent_consent_path TEXT,
      password_hash TEXT,
      status TEXT DEFAULT 'pending'
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  await pool.query(`
    INSERT INTO settings (key, value) VALUES ('registration_open', '1')
    ON CONFLICT (key) DO NOTHING
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      registration_id INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
      sender TEXT NOT NULL,
      text TEXT NOT NULL
    )
  `);
}

initDb().catch(err => {
  console.error('Database init failed:', err);
  process.exit(1);
});

module.exports = pool;
