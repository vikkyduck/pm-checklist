-- ─────────────────────────────────────────────────────────────
-- Схема БД для чек-листа PM Авито
-- Запустить один раз после создания PostgreSQL-базы:
--   psql $DATABASE_URL -f schema.sql
-- или через веб-консоль хостинга (Beget/Timeweb).
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS magic_tokens (
  token       TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_magic_tokens_user ON magic_tokens(user_id);

CREATE TABLE IF NOT EXISTS checklist_progress (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id     TEXT NOT NULL,
  checked     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS rate_limit (
  email       TEXT PRIMARY KEY,
  last_sent   TIMESTAMPTZ NOT NULL
);
