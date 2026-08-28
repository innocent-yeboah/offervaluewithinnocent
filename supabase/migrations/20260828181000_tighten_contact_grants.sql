-- Leftover table grants: INSERT was revoked, but SELECT/UPDATE/DELETE/TRUNCATE
-- remained. TRUNCATE is not covered by RLS, so strip those from public roles.

revoke all on table public.contact_messages from anon;
revoke all on table public.contact_messages from authenticated;
grant select on table public.contact_messages to authenticated;
