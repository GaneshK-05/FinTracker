-- ═══════════════════════════════════════════════════════════════════════
-- Supabase SQL — Run this in the Supabase SQL Editor to create tables
-- ═══════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ──
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Transactions ──
CREATE TABLE IF NOT EXISTS transactions (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  amount    NUMERIC(12, 2) NOT NULL,
  type      TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category  TEXT NOT NULL,
  date      DATE NOT NULL,
  notes     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- ── Goals ──
CREATE TABLE IF NOT EXISTS goals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_name      TEXT NOT NULL,
  target_amount  NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  deadline       DATE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);

-- ── Row Level Security (optional but recommended) ──
-- ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE goals        ENABLE ROW LEVEL SECURITY;
