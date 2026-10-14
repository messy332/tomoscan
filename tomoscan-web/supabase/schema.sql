-- TomoScan legacy API tables and Supabase Auth-owned Flutter scans.
-- Run in the Supabase SQL Editor. The legacy tables remain for the web API.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE maturity_label AS ENUM ('unripe', 'ripe', 'overripe');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'member',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.scan_records (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    image_url        VARCHAR(500),
    image_filename   VARCHAR(255) NOT NULL,
    dt_prediction    maturity_label NOT NULL,
    dt_confidence    FLOAT NOT NULL,
    dt_probabilities JSONB NOT NULL,
    dt_latency_ms    FLOAT NOT NULL,
    rf_prediction    maturity_label NOT NULL,
    rf_confidence    FLOAT NOT NULL,
    rf_probabilities JSONB NOT NULL,
    rf_latency_ms    FLOAT NOT NULL,
    features         JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_scan_user_id ON public.scan_records(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_created ON public.scan_records(created_at DESC);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_records ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY users_select_own ON public.users
        FOR SELECT USING (id = current_setting('app.current_user_id', TRUE)::UUID);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY scans_legacy_select_own ON public.scan_records
        FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY scans_legacy_insert_own ON public.scan_records
        FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE)::UUID);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.scans (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_filename   TEXT NOT NULL,
    dt_prediction    TEXT NOT NULL CHECK (dt_prediction IN ('unripe', 'ripe', 'overripe')),
    dt_confidence    DOUBLE PRECISION NOT NULL,
    dt_probabilities JSONB NOT NULL,
    dt_latency_ms    DOUBLE PRECISION NOT NULL,
    rf_prediction    TEXT NOT NULL CHECK (rf_prediction IN ('unripe', 'ripe', 'overripe')),
    rf_confidence    DOUBLE PRECISION NOT NULL,
    rf_probabilities JSONB NOT NULL,
    rf_latency_ms    DOUBLE PRECISION NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scans_user_created
    ON public.scans (user_id, created_at DESC);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS scans_select_own ON public.scans;
CREATE POLICY scans_select_own ON public.scans
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS scans_insert_own ON public.scans;
CREATE POLICY scans_insert_own ON public.scans
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.scans TO authenticated;
