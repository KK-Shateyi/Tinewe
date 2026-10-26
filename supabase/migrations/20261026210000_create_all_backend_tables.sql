/*
# Tinewe Backend Schema
Tables matching all front-end features for Tinewe Personal Safety Application:
1. trusted_contacts
2. journeys
3. sos_alerts
4. safety_plans
5. transport_records
6. activity_logs
7. app_notifications
8. wearable_devices
*/

-- 1. Trusted Contacts
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL DEFAULT 'Friend',
  avatar_color text DEFAULT 'from-teal-400 to-emerald-500',
  initials text NOT NULL,
  receives_journey_updates boolean DEFAULT true,
  receives_sos_alerts boolean DEFAULT true,
  receives_location_share boolean DEFAULT false,
  receives_low_battery_alerts boolean DEFAULT false,
  notification_status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON trusted_contacts TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_trusted_contacts" ON trusted_contacts;
CREATE POLICY "anon_crud_trusted_contacts" ON trusted_contacts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Journeys
CREATE TABLE IF NOT EXISTS journeys (
  id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'idle',
  origin text NOT NULL,
  destination text NOT NULL,
  progress numeric DEFAULT 0,
  eta text DEFAULT '—',
  started_at timestamptz,
  completed_at timestamptz,
  check_in_frequency integer DEFAULT 15,
  grace_period integer DEFAULT 5,
  contacts_receiving_updates jsonb DEFAULT '[]'::jsonb,
  selected_route text DEFAULT 'Recommended',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON journeys TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_journeys" ON journeys;
CREATE POLICY "anon_crud_journeys" ON journeys FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. SOS Alerts
CREATE TABLE IF NOT EXISTS sos_alerts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message text NOT NULL,
  contacts_notified jsonb DEFAULT '[]'::jsonb,
  delivery_status text DEFAULT 'pending',
  latitude numeric,
  longitude numeric,
  sms_receipts jsonb DEFAULT '[]'::jsonb,
  emergency_call_sid text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sos_alerts TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_sos_alerts" ON sos_alerts;
CREATE POLICY "anon_crud_sos_alerts" ON sos_alerts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Safety Plans
CREATE TABLE IF NOT EXISTS safety_plans (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  trusted_contacts jsonb DEFAULT '[]'::jsonb,
  important_documents jsonb DEFAULT '[]'::jsonb,
  preferred_organisations jsonb DEFAULT '[]'::jsonb,
  transport_arrangements text DEFAULT '',
  safe_locations jsonb DEFAULT '[]'::jsonb,
  emergency_info text DEFAULT '',
  private_notes text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE safety_plans ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON safety_plans TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_safety_plans" ON safety_plans;
CREATE POLICY "anon_crud_safety_plans" ON safety_plans FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Transport Records
CREATE TABLE IF NOT EXISTS transport_records (
  id text PRIMARY KEY,
  registration text NOT NULL,
  driver_name text,
  driver_id text,
  vehicle_type text DEFAULT 'Uber',
  trip_details text,
  shared_with jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transport_records ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON transport_records TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_transport_records" ON transport_records;
CREATE POLICY "anon_crud_transport_records" ON transport_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id text PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'shield',
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON activity_logs TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_activity_logs" ON activity_logs;
CREATE POLICY "anon_crud_activity_logs" ON activity_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
