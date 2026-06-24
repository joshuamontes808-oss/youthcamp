require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const pool = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));

// ── Rate limiters ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 120,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many registration attempts. Try again in an hour.' },
});

app.use('/api/', apiLimiter);

// ── Uploads setup ─────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extOk = /\.(jpeg|jpg|png|pdf)$/i.test(path.extname(file.originalname));
    const mimeOk = ALLOWED_MIME.includes(file.mimetype);
    cb(null, extOk && mimeOk);
  },
});

app.use('/uploads', express.static(uploadsDir));

// ── Admin login ───────────────────────────────────────────────────────────────
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required.' });
  if (password === process.env.ADMIN_PASSWORD) return res.json({ success: true });
  return res.status(401).json({ error: 'Incorrect password.' });
});

// ── Registrations ─────────────────────────────────────────────────────────────
app.post(
  '/api/registrations',
  registrationLimiter,
  upload.fields([{ name: 'gcash_receipt', maxCount: 1 }, { name: 'parent_consent', maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        camper_first_name, camper_last_name, camper_dob, camper_age, camper_gender, church,
        parent_name, parent_relationship, parent_phone, parent_email,
        allergies, medications, special_needs, emergency_contact_name, emergency_contact_phone,
        session, tshirt_size, activities, dietary_restrictions, gcash_reference, password,
      } = req.body;

      const gcash_receipt_path = req.files?.gcash_receipt?.[0]?.filename || null;
      const parent_consent_path = req.files?.parent_consent?.[0]?.filename || null;

      if (!camper_first_name || !camper_last_name || !camper_dob || !camper_age || !camper_gender ||
          !parent_name || !parent_relationship || !parent_phone ||
          !emergency_contact_name || !emergency_contact_phone ||
          !tshirt_size || !gcash_reference || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const result = await pool.query(`
        INSERT INTO registrations (
          camper_first_name, camper_last_name, camper_dob, camper_age, camper_gender, church,
          parent_name, parent_relationship, parent_phone, parent_email,
          allergies, medications, special_needs, emergency_contact_name, emergency_contact_phone,
          session, tshirt_size, activities, dietary_restrictions,
          gcash_reference, gcash_receipt_path, parent_consent_path, password_hash
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
        RETURNING id
      `, [
        camper_first_name, camper_last_name, camper_dob, parseInt(camper_age, 10), camper_gender, church || '',
        parent_name, parent_relationship, parent_phone, parent_email || '',
        allergies || '', medications || '', special_needs || '',
        emergency_contact_name, emergency_contact_phone,
        session || '', tshirt_size,
        typeof activities === 'string' ? activities : JSON.stringify(activities || []),
        dietary_restrictions || '',
        gcash_reference, gcash_receipt_path, parent_consent_path, password_hash,
      ]);

      res.status(201).json({ id: result.rows[0].id, message: 'Registration successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

app.get('/api/registrations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registrations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/registrations/export/csv', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registrations ORDER BY created_at DESC');
    const rows = result.rows;

    const headers = [
      'ID', 'Date Registered', 'Status',
      'Camper First Name', 'Camper Last Name', 'Date of Birth', 'Age', 'Gender', 'Church',
      'Parent Name', 'Relationship', 'Parent Phone', 'Parent Email',
      'Allergies', 'Medications', 'Special Needs', 'Emergency Contact', 'Emergency Phone',
      'Session', 'T-Shirt Size', 'Activities', 'Dietary Restrictions',
      'GCash Reference', 'GCash Receipt', 'Parent Consent',
    ];

    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const dataRows = rows.map(r => {
      let activities = r.activities;
      try { activities = JSON.parse(r.activities).join('; '); } catch (_) {}
      return [
        r.id, r.created_at, r.status,
        r.camper_first_name, r.camper_last_name, r.camper_dob, r.camper_age, r.camper_gender, r.church,
        r.parent_name, r.parent_relationship, r.parent_phone, r.parent_email,
        r.allergies, r.medications, r.special_needs, r.emergency_contact_name, r.emergency_contact_phone,
        r.session, r.tshirt_size, activities, r.dietary_restrictions,
        r.gcash_reference, r.gcash_receipt_path || '', r.parent_consent_path || '',
      ].map(escape).join(',');
    });

    const csv = '﻿' + [headers.map(escape).join(','), ...dataRows].join('\r\n');
    const filename = `HHFC_YouthCamp2027_Registrations_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/registrations/verify', async (req, res) => {
  try {
    const { id, password } = req.body;
    const result = await pool.query('SELECT * FROM registrations WHERE id = $1', [id]);
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: 'Registration not found' });
    const match = await bcrypt.compare(password || '', row.password_hash || '');
    if (!match) return res.status(401).json({ error: 'Incorrect password' });
    const { password_hash, ...safe } = row;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/registrations/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registrations WHERE id = $1', [req.params.id]);
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: 'Registration not found' });
    const { password_hash, ...safe } = row;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/registrations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query('UPDATE registrations SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/registrations/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM registrations WHERE id = $1', [req.params.id]);
    res.json({ message: 'Registration deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Settings ──────────────────────────────────────────────────────────────────
app.get('/api/settings/registration', async (req, res) => {
  try {
    const result = await pool.query(`SELECT value FROM settings WHERE key = 'registration_open'`);
    res.json({ open: result.rows[0]?.value === '1' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/settings/registration', async (req, res) => {
  try {
    const { open } = req.body;
    await pool.query(`UPDATE settings SET value = $1 WHERE key = 'registration_open'`, [open ? '1' : '0']);
    res.json({ open: !!open });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Announcements ─────────────────────────────────────────────────────────────
app.get('/api/announcements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const { category, title, message } = req.body;
    if (!category || !title || !message) return res.status(400).json({ error: 'Missing fields' });
    const result = await pool.query(
      'INSERT INTO announcements (category, title, message) VALUES ($1, $2, $3) RETURNING id',
      [category, title, message]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Messages ──────────────────────────────────────────────────────────────────
app.get('/api/messages/all/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/messages/:registration_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM messages WHERE registration_id = $1 ORDER BY created_at ASC',
      [req.params.registration_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { registration_id, sender, text } = req.body;
    if (!registration_id || !sender || !text?.trim()) return res.status(400).json({ error: 'Missing fields' });
    if (!['camper', 'admin'].includes(sender)) return res.status(400).json({ error: 'Invalid sender.' });
    if (text.trim().length > 1000) return res.status(400).json({ error: 'Message too long (max 1000 characters).' });
    const result = await pool.query(
      'INSERT INTO messages (registration_id, sender, text) VALUES ($1, $2, $3) RETURNING id, created_at',
      [registration_id, sender, text.trim()]
    );
    res.status(201).json({
      id: result.rows[0].id,
      registration_id,
      sender,
      text: text.trim(),
      created_at: result.rows[0].created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Serve frontend in production ──────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next()  // ← never catch API routes
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Youth Camp API running on port ${PORT}`);
});