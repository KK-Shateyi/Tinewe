/*
# User data tables for Tinewe (multi-user)

This migration creates the owner-scoped tables that back the app's
user-entered data: trusted contacts, activity log, in-app notifications,
safety plan, transport records, and wearable devices.

Each table:
- Is owned by a single user via `user_id uuid NOT NULL DEFAULT auth.uid()`
  referencing auth.users with ON DELETE CASCADE.
- Has RLS enabled with authenticated-only CRUD keyed on auth.uid() = user_id.
- Grants CRUD to `authenticated` only (the app requires sign-in).

1. New Tables
- trusted_contacts: the user's safety network (name, phone, relationship,
  per-event notification toggles, status).
- activity_logs: append-only safety activity feed (type, title, description, icon).
- app_notifications: in-app notifications generated from real app events
  (title, body, type, read flag).
- safety_plans: single row per user (CHECK user_id = auth.uid() enforced via
  policy; one row per user via a partial unique index on user_id).
- transport_records: logged vehicle/trip details shared with contacts.
- wearable_devices: connected wearable metadata (name, brand, connection state).

2. Security
- RLS enabled on every table.
- Grants: CRUD to authenticated only.
- Policies: owner-scoped select/insert/update/delete using auth.uid() = user_id.
- user_id defaults to auth.uid() so client inserts that omit it succeed.

3. Notes
- safety_plans enforces one row per user via `UNIQUE (user_id)`.
- All tables cascade-delete when the auth user is deleted.
- No data is seeded; users start with empty state and add their own data.
*/

-- 1. trusted_contacts --------------------------------------------------------
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL DEFAULT 'Friend',
  avatar_color text NOT NULL DEFAULT 'from-teal-400 to-emerald-500',
  initials text NOT NULL,
  receives_journey_updates boolean NOT NULL DEFAULT true,
  receives_sos_alerts boolean NOT NULL DEFAULT true,
  receives_location_share boolean NOT NULL DEFAULT false,
  receives_low_battery_alerts boolean NOT NULL DEFAULT false,
  notification_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON trusted_contacts TO authenticated;

DROP POLICY IF EXISTS "select_own_trusted_contacts" ON trusted_contacts;
CREATE POLICY "select_own_trusted_contacts" ON trusted_contacts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_trusted_contacts" ON trusted_contacts;
CREATE POLICY "insert_own_trusted_contacts" ON trusted_contacts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_trusted_contacts" ON trusted_contacts;
CREATE POLICY "update_own_trusted_contacts" ON trusted_contacts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_trusted_contacts" ON trusted_contacts;
CREATE POLICY "delete_own_trusted_contacts" ON trusted_contacts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS trusted_contacts_user_id_idx ON trusted_contacts (user_id);

-- 2. activity_logs -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'shield',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON activity_logs TO authenticated;

DROP POLICY IF EXISTS "select_own_activity_logs" ON activity_logs;
CREATE POLICY "select_own_activity_logs" ON activity_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_activity_logs" ON activity_logs;
CREATE POLICY "insert_own_activity_logs" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_activity_logs" ON activity_logs;
CREATE POLICY "update_own_activity_logs" ON activity_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_activity_logs" ON activity_logs;
CREATE POLICY "delete_own_activity_logs" ON activity_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs (user_id, created_at DESC);

-- 3. app_notifications -------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON app_notifications TO authenticated;

DROP POLICY IF EXISTS "select_own_app_notifications" ON app_notifications;
CREATE POLICY "select_own_app_notifications" ON app_notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_app_notifications" ON app_notifications;
CREATE POLICY "insert_own_app_notifications" ON app_notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_app_notifications" ON app_notifications;
CREATE POLICY "update_own_app_notifications" ON app_notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_app_notifications" ON app_notifications;
CREATE POLICY "delete_own_app_notifications" ON app_notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS app_notifications_user_id_idx ON app_notifications (user_id, created_at DESC);

-- 4. safety_plans (one row per user) -----------------------------------------
CREATE TABLE IF NOT EXISTS safety_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  trusted_contact_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  important_documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  preferred_organisations jsonb NOT NULL DEFAULT '[]'::jsonb,
  transport_arrangements text NOT NULL DEFAULT '',
  safe_locations jsonb NOT NULL DEFAULT '[]'::jsonb,
  emergency_info text NOT NULL DEFAULT '',
  private_notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE safety_plans ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON safety_plans TO authenticated;

DROP POLICY IF EXISTS "select_own_safety_plans" ON safety_plans;
CREATE POLICY "select_own_safety_plans" ON safety_plans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_safety_plans" ON safety_plans;
CREATE POLICY "insert_own_safety_plans" ON safety_plans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_safety_plans" ON safety_plans;
CREATE POLICY "update_own_safety_plans" ON safety_plans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_safety_plans" ON safety_plans;
CREATE POLICY "delete_own_safety_plans" ON safety_plans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS safety_plans_one_per_user ON safety_plans (user_id);

-- 5. transport_records -------------------------------------------------------
CREATE TABLE IF NOT EXISTS transport_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  registration text NOT NULL,
  driver_name text,
  driver_id text,
  vehicle_type text NOT NULL DEFAULT 'Uber',
  trip_details text,
  shared_with jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transport_records ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON transport_records TO authenticated;

DROP POLICY IF EXISTS "select_own_transport_records" ON transport_records;
CREATE POLICY "select_own_transport_records" ON transport_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_transport_records" ON transport_records;
CREATE POLICY "insert_own_transport_records" ON transport_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_transport_records" ON transport_records;
CREATE POLICY "update_own_transport_records" ON transport_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_transport_records" ON transport_records;
CREATE POLICY "delete_own_transport_records" ON transport_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS transport_records_user_id_idx ON transport_records (user_id, created_at DESC);

-- 6. wearable_devices --------------------------------------------------------
CREATE TABLE IF NOT EXISTS wearable_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text NOT NULL,
  connected boolean NOT NULL DEFAULT false,
  battery integer,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_sync timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wearable_devices ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON wearable_devices TO authenticated;

DROP POLICY IF EXISTS "select_own_wearable_devices" ON wearable_devices;
CREATE POLICY "select_own_wearable_devices" ON wearable_devices FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_wearable_devices" ON wearable_devices;
CREATE POLICY "insert_own_wearable_devices" ON wearable_devices FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_wearable_devices" ON wearable_devices;
CREATE POLICY "update_own_wearable_devices" ON wearable_devices FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_wearable_devices" ON wearable_devices;
CREATE POLICY "delete_own_wearable_devices" ON wearable_devices FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS wearable_devices_user_id_idx ON wearable_devices (user_id);