/*
# Lock down handle_new_user trigger function

The handle_new_user() function is a trigger that auto-creates a profile
row when a new auth user signs up. It is SECURITY DEFINER so it can
write to the profiles table regardless of the caller's rights.

It should only ever be invoked by the auth trigger, never called
directly as an RPC. Revoke EXECUTE from PUBLIC and anon, and grant it
only to the postgres/service role (which fires triggers).

1. Security
- REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC, anon.
- The trigger still fires because it runs as the function owner.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;