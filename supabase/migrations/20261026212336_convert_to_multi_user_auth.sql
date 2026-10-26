/*
# Convert Tinewe to multi-user authentication

This migration completes the move from single-tenant (no sign-in) to a
multi-user authenticated app. Each user now owns only their own rows.

1. fake_call_audio — owner scoped
- Add `user_id uuid NOT NULL DEFAULT auth.uid()` referencing auth.users.
- Drop the old anon+authenticated "USING (true)" policies.
- Create authenticated-only CRUD policies keyed on auth.uid() = user_id.
- Revoke all privileges from the anon role (the app now requires sign-in).
- The unique partial index on is_active is preserved.

2. Storage bucket "fake-call-audio" — per-user object isolation
- Drop the old open anon read/write storage policies.
- Insert/update/delete policies require the object path to start with the
  authenticated user's id, so each user can only manage their own audio
  clips. Reads remain open (public bucket) so the audio can be played
  without an authenticated fetch, but writes are owner-only.

3. profiles — tighten grants
- Revoke INSERT/UPDATE/DELETE from anon (already authenticated-only via
  policies, but the table-level grants still allowed anon verbs).
- Keep SELECT revoked from anon as well; profiles are private.

4. Notes
- Existing rows (if any) in fake_call_audio get user_id filled from
  auth.uid() at insert time going forward. The column is added with a
  DEFAULT so old NULLs are not possible (NOT NULL + DEFAULT).
- No data is deleted or rewritten.
*/

-- 1. fake_call_audio: add owner column ---------------------------------------
ALTER TABLE fake_call_audio
  ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid()
  REFERENCES auth.users(id) ON DELETE CASCADE;

-- Index for filtering a user's clips
CREATE INDEX IF NOT EXISTS fake_call_audio_user_id_idx
  ON fake_call_audio (user_id);

-- Revoke anon access; the app now requires sign-in
REVOKE SELECT, INSERT, UPDATE, DELETE ON fake_call_audio FROM anon;

-- Drop old open policies
DROP POLICY IF EXISTS "anon_select_fake_call_audio" ON fake_call_audio;
DROP POLICY IF EXISTS "anon_insert_fake_call_audio" ON fake_call_audio;
DROP POLICY IF EXISTS "anon_update_fake_call_audio" ON fake_call_audio;
DROP POLICY IF EXISTS "anon_delete_fake_call_audio" ON fake_call_audio;

-- Owner-scoped CRUD policies (authenticated only)
DROP POLICY IF EXISTS "select_own_fake_call_audio" ON fake_call_audio;
CREATE POLICY "select_own_fake_call_audio"
ON fake_call_audio FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_fake_call_audio" ON fake_call_audio;
CREATE POLICY "insert_own_fake_call_audio"
ON fake_call_audio FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_fake_call_audio" ON fake_call_audio;
CREATE POLICY "update_own_fake_call_audio"
ON fake_call_audio FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_fake_call_audio" ON fake_call_audio;
CREATE POLICY "delete_own_fake_call_audio"
ON fake_call_audio FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- 2. Storage bucket: per-user write isolation --------------------------------
-- Reads stay public (bucket is public) so clips can be played by anyone
-- who has the URL; writes are restricted to the owning user via path prefix.
DROP POLICY IF EXISTS "anon_read_fake_call_audio_bucket" ON storage.objects;
DROP POLICY IF EXISTS "anon_insert_fake_call_audio_bucket" ON storage.objects;
DROP POLICY IF EXISTS "anon_update_fake_call_audio_bucket" ON storage.objects;
DROP POLICY IF EXISTS "anon_delete_fake_call_audio_bucket" ON storage.objects;

-- Allow anyone to read objects in the bucket (public playback)
CREATE POLICY "read_fake_call_audio_bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'fake-call-audio');

-- Authenticated users can insert only into their own folder (path = <uid>/...)
DROP POLICY IF EXISTS "insert_own_fake_call_audio_bucket" ON storage.objects;
CREATE POLICY "insert_own_fake_call_audio_bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fake-call-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated users can update/delete only their own objects
DROP POLICY IF EXISTS "update_own_fake_call_audio_bucket" ON storage.objects;
CREATE POLICY "update_own_fake_call_audio_bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fake-call-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'fake-call-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "delete_own_fake_call_audio_bucket" ON storage.objects;
CREATE POLICY "delete_own_fake_call_audio_bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'fake-call-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. profiles: revoke anon table privileges ----------------------------------
REVOKE SELECT, INSERT, UPDATE, DELETE ON profiles FROM anon;