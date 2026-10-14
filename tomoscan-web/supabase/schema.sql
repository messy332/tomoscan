-- =============================================
-- TomoScan – Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE maturity_label AS ENUM ('unripe', 'ripe', 'overripe');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name       VARCHAR(120)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    hashed_password VARCHAR(255)  NOT NULL,
    role            user_role     NOT NULL DEFAULT 'member',
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- SCAN RECORDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS scan_records (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url        VARCHAR(500),
    image_filename   VARCHAR(255) NOT NULL,

    -- Decision Tree results
    dt_prediction    maturity_label NOT NULL,
    dt_confidence    FLOAT          NOT NULL,
    dt_probabilities JSONB          NOT NULL,
    dt_latency_ms    FLOAT          NOT NULL,

    -- Random Forest results
    rf_prediction    maturity_label NOT NULL,
    rf_confidence    FLOAT          NOT NULL,
    rf_probabilities JSONB          NOT NULL,
    rf_latency_ms    FLOAT          NOT NULL,

    -- Feature snapshot
    features         JSONB,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_user_id ON scan_records(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_created ON scan_records(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_records ENABLE ROW LEVEL SECURITY;

-- Users: only see own row (admin bypass handled at API layer)
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = current_setting('app.current_user_id', TRUE)::UUID);

-- Scans: members see only their own scans
CREATE POLICY "scans_select_own" ON scan_records
    FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

CREATE POLICY "scans_insert_own" ON scan_records
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- =============================================
-- updated_at trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
