-- Rate limits are written by the site server only (service role).
-- Contact notes are no longer insertable by the public API.

create table public.rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  hit_count integer not null default 0,
  primary key (bucket, window_start)
);

alter table public.rate_limits enable row level security;
alter table public.rate_limits force row level security;

revoke all on table public.rate_limits from public, anon, authenticated;

create or replace function public.bump_rate_limit(
  p_bucket text,
  p_window_start timestamptz,
  p_max integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.rate_limits (bucket, window_start, hit_count)
  values (p_bucket, p_window_start, 1)
  on conflict (bucket, window_start) do update
    set hit_count = public.rate_limits.hit_count + 1
    where public.rate_limits.hit_count < p_max
  returning public.rate_limits.hit_count into new_count;

  return new_count is not null;
end;
$$;

revoke all on function public.bump_rate_limit(text, timestamptz, integer) from public;
revoke all on function public.bump_rate_limit(text, timestamptz, integer) from anon, authenticated;
grant execute on function public.bump_rate_limit(text, timestamptz, integer) to service_role;

drop policy if exists contact_anon_insert on public.contact_messages;
drop policy if exists contact_authenticated_insert on public.contact_messages;

revoke insert on table public.contact_messages from anon, authenticated;
revoke usage, select on sequence public.contact_messages_id_seq from anon, authenticated;
