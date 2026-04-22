/**
 * PM Checklist Backend
 * ─────────────────────
 * Node.js + Express + PostgreSQL + nodemailer
 * Запуск: `npm start`
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

const {
  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD,
  SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_NAME,
  JWT_SECRET, FRONTEND_URL, PORT,
} = process.env;

if (!JWT_SECRET || JWT_SECRET === 'change_me_to_a_long_random_string') {
  console.error('❌ Установите JWT_SECRET в .env (длинная случайная строка)');
  process.exit(1);
}

// ───── Подключение к БД ─────
const pool = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT) || 5432,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

// ───── SMTP ─────
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 465,
  secure: String(SMTP_SECURE) === 'true',
  auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
});

// ───── Express ─────
const app = express();

const allowedOrigins = [
  FRONTEND_URL,
  'https://pm-checklist.lovable.app',
  /\.lovable\.app$/,
  /\.lovableproject\.com$/,
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some((p) =>
      typeof p === 'string' ? p === origin : p.test(origin)
    );
    cb(null, ok);
  },
  credentials: true,
}));
app.use(express.json());

// ───── Helpers ─────
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function emailTemplate(name, link) {
  return {
    subject: 'Вход в чек-лист PM Авито',
    text: `Здравствуйте, ${name}!\n\nЧтобы войти в чек-лист, перейдите по ссылке (действует 15 минут):\n${link}\n\nЕсли вы не запрашивали вход — просто проигнорируйте это письмо.`,
    html: `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0b0d12;color:#e7e9ee;margin:0;padding:40px 20px;">
  <div style="max-width:480px;margin:0 auto;background:#13161d;border:1px solid #232732;border-radius:16px;padding:32px;">
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;">Вход в чек-лист PM</h1>
    <p style="margin:0 0 24px;color:#9aa0ac;font-size:14px;line-height:1.5;">Здравствуйте, ${name}! Нажмите кнопку, чтобы войти. Ссылка действительна 15 минут.</p>
    <a href="${link}" style="display:inline-block;background:#7dd3fc;color:#0b0d12;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px;">Войти в чек-лист</a>
    <p style="margin:24px 0 0;color:#6b7280;font-size:12px;line-height:1.5;">Если кнопка не работает — скопируйте ссылку:<br><span style="word-break:break-all;color:#9aa0ac;">${link}</span></p>
  </div>
</body></html>`.trim(),
  };
}

// ───── POST /auth/magic-link ─────
app.post('/auth/magic-link', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const name = String(req.body.name || '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Некорректный email' });
    }
    if (!name) return res.status(400).json({ error: 'Укажите имя' });

    // Rate limit: 1 запрос на email раз в 60 сек
    const rl = await pool.query('SELECT last_sent FROM rate_limit WHERE email = $1', [email]);
    if (rl.rows.length && Date.now() - new Date(rl.rows[0].last_sent).getTime() < 60_000) {
      return res.status(429).json({ error: 'Подождите минуту перед повторной отправкой' });
    }

    // Upsert user
    const userRes = await pool.query(
      `INSERT INTO users (email, name) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, name`,
      [email, name]
    );
    const user = userRes.rows[0];

    // Создать токен
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60_000);
    await pool.query(
      'INSERT INTO magic_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [token, user.id, expires]
    );

    // Записать rate-limit
    await pool.query(
      `INSERT INTO rate_limit (email, last_sent) VALUES ($1, NOW())
       ON CONFLICT (email) DO UPDATE SET last_sent = NOW()`,
      [email]
    );

    // Отправить письмо
    const link = `${FRONTEND_URL}/auth/callback?token=${token}`;
    const tpl = emailTemplate(user.name, link);
    await transporter.sendMail({
      from: `"${SMTP_FROM_NAME || 'PM Чек-лист'}" <${SMTP_USER}>`,
      to: email,
      subject: tpl.subject,
      text: tpl.text,
      html: tpl.html,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('magic-link error:', e);
    res.status(500).json({ error: 'Не удалось отправить письмо' });
  }
});

// ───── GET /auth/verify?token=... ─────
app.get('/auth/verify', async (req, res) => {
  try {
    const token = String(req.query.token || '');
    if (!token) return res.status(400).json({ error: 'Нет токена' });

    const r = await pool.query(
      `SELECT mt.user_id, mt.expires_at, mt.used_at, u.email, u.name
       FROM magic_tokens mt JOIN users u ON u.id = mt.user_id
       WHERE mt.token = $1`,
      [token]
    );
    if (!r.rows.length) return res.status(400).json({ error: 'Токен не найден' });
    const row = r.rows[0];
    if (row.used_at) return res.status(400).json({ error: 'Ссылка уже использована' });
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Ссылка истекла' });
    }

    await pool.query('UPDATE magic_tokens SET used_at = NOW() WHERE token = $1', [token]);

    const jwtToken = jwt.sign(
      { userId: row.user_id, email: row.email, name: row.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token: jwtToken, user: { email: row.email, name: row.name } });
  } catch (e) {
    console.error('verify error:', e);
    res.status(500).json({ error: 'Ошибка проверки' });
  }
});

// ───── GET /me ─────
app.get('/me', authMiddleware, (req, res) => {
  res.json({ email: req.user.email, name: req.user.name });
});

// ───── GET /checklist ─────
app.get('/checklist', authMiddleware, async (req, res) => {
  const r = await pool.query(
    'SELECT item_id, checked FROM checklist_progress WHERE user_id = $1',
    [req.user.userId]
  );
  const progress = {};
  for (const row of r.rows) progress[row.item_id] = row.checked;
  res.json({ progress });
});

// ───── PUT /checklist ─────
// body: { progress: { [itemId]: boolean } }
app.put('/checklist', authMiddleware, async (req, res) => {
  const progress = req.body.progress;
  if (!progress || typeof progress !== 'object') {
    return res.status(400).json({ error: 'Неверный формат' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [itemId, checked] of Object.entries(progress)) {
      await client.query(
        `INSERT INTO checklist_progress (user_id, item_id, checked, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, item_id)
         DO UPDATE SET checked = EXCLUDED.checked, updated_at = NOW()`,
        [req.user.userId, String(itemId), Boolean(checked)]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('checklist save error:', e);
    res.status(500).json({ error: 'Ошибка сохранения' });
  } finally {
    client.release();
  }
});

// ───── Health ─────
app.get('/', (_req, res) => res.json({ status: 'ok', service: 'pm-checklist-backend' }));

const port = Number(PORT) || 3000;
app.listen(port, () => console.log(`✓ PM Checklist API на порту ${port}`));
