/*
# Fake Call Audio Storage

1. Purpose
- Lets users of the Tinewe app attach a pre-recorded or in-app-recorded audio clip
  that plays automatically when the "Fake Call" feature is triggered, so the
  simulated call sounds convincing and personalised.
- This is a single-tenant demo (no sign-in), so the app reads/writes its own rows
  via the anon key. Audio files live in Supabase Storage; metadata lives in a table.

2. New Tables
- `fake_call_audio`
  - `id` (uuid, primary key)
  - `label` (text, optional friendly name, e.g. "Mom calling")
  - `storage_path` (text, the path within the `fake-call-audio` storage bucket)
  - `mime_type` (text, e.g. audio/webm, audio/mpeg)
  - `duration_ms` (integer, optional recording length in milliseconds)
  - `is_active` (boolean, defaults false; the row flagged true is the one played
    when Fake Call is triggered)
  - `created_at` (timestamptz, defaults to now())

3. Storage
- Creates a new private-ish bucket `fake-call-audio` for the audio files.
- Storage policies allow anon read + write of objects in this bucket (single-tenant demo).

4. Security
- Enable RLS on `fake_call_audio`.
- Grant CRUD to `anon` + `authenticated` so the anon-key frontend can reach the table.
- Allow anon + authenticated CRUD because the data is intentionally shared/public
  (single-tenant demo with no sign-in).
- Storage policies allow anon read + write of objects in the `fake-call-audio` bucket.

5. Notes
- Only one row should have `is_active = true` at a time. The app enforces this by
  clearing other rows' `is_active` before setting the chosen one. A partial unique
  index on `is_active WHERE is_active` guarantees a single active clip at the DB
  level even if two clients race.
- Bucket creation is idempotent via `insert ... on conflict do nothing`.
*/

CREATE TABLE IF NOT EXISTS fake_call_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  duration_ms integer,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fake_call_audio ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON fake_call_audio TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_fake_call_audio" ON fake_call_audio;
CREATE POLICY "anon_select_fake_call_audio"
ON fake_call_audio FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_fake_call_audio" ON fake_call_audio;
CREATE POLICY "anon_insert_fake_call_audio"
ON fake_call_audio FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_fake_call_audio" ON fake_call_audio;
CREATE POLICY "anon_update_fake_call_audio"
ON fake_call_audio FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_fake_call_audio" ON fake_call_audio;
CREATE POLICY "anon_delete_fake_call_audio"
ON fake_call_audio FOR DELETE
TO anon, authenticated USING (true);

-- Only one active clip at a time
DROP INDEX IF EXISTS fake_call_audio_single_active;
CREATE UNIQUE INDEX fake_call_audio_single_active
ON fake_call_audio (is_active) WHERE is_active;

-- Storage bucket for audio files (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('fake-call-audio', 'fake-call-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anon can read + write objects in this bucket
DROP POLICY IF EXISTS "anon_read_fake_call_audio_bucket" ON storage.objects;
CREATE POLICY "anon_read_fake_call_audio_bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'fake-call-audio');

DROP POLICY IF EXISTS "anon_insert_fake_call_audio_bucket" ON storage.objects;
CREATE POLICY "anon_insert_fake_call_audio_bucket"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'fake-call-audio');

DROP POLICY IF EXISTS "anon_update_fake_call_audio_bucket" ON storage.objects;
CREATE POLICY "anon_update_fake_call_audio_bucket"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'fake-call-audio') WITH CHECK (bucket_id = 'fake-call-audio');

DROP POLICY IF EXISTS "anon_delete_fake_call_audio_bucket" ON storage.objects;
CREATE POLICY "anon_delete_fake_call_audio_bucket"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'fake-call-audio');
