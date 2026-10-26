/*
# Create profiles table (single-tenant, no auth)

1. New Tables
- `profiles`
  - `id` (int, primary key, always 1 — single row for the app's owner)
  - `display_name` (text, not null) — shown across the app
  - `email` (text, not null) — shown across the app
  - `updated_at` (timestamptz, defaults to now())
2. Security
- Enable RLS on `profiles`.
- Grant CRUD to `anon` + `authenticated` so the Data API can reach the table.
- The data is intentionally shared/public for this single-tenant app, so
  policies use `USING (true)` / `WITH CHECK (true)`.
3. Seed
- Insert a default profile row (id=1) with the placeholder values the app
  already shows, so the UI has data before the user edits it.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  display_name text NOT NULL DEFAULT 'Amahle Mahlangu',
  email text NOT NULL DEFAULT 'amahle@tinewe.app',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO profiles (id, display_name, email)
VALUES (1, 'Amahle Mahlangu', 'amahle@tinewe.app')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);
