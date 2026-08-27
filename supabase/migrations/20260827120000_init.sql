-- Offer Value With Innocent — initial schema
-- RLS on every public table. is_author is never taken from user_metadata.

create extension if not exists pg_trgm;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_author boolean not null default false
);

create table public.articles (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  excerpt text,
  body_markdown text not null,
  cover_image_path text,
  theme text not null,
  status text not null default 'draft',
  published_at timestamptz,
  author_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
    || setweight(to_tsvector('english', coalesce(body_markdown, '')), 'C')
  ) stored,
  constraint articles_theme_check check (
    theme in (
      'value',
      'habits',
      'relationship',
      'awareness',
      'money',
      'purpose',
      'focus',
      'service'
    )
  ),
  constraint articles_status_check check (status in ('draft', 'published'))
);

create index articles_search_vector_idx on public.articles using gin (search_vector);
create index articles_live_published_at_idx
  on public.articles (published_at desc)
  where status = 'published';

create table public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger articles_set_updated_at
  before update on public.articles
  for each row
  execute function public.set_updated_at();

-- New auth users get a non-author profile. is_author is set only in the dashboard.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, is_author)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''), false);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.contact_messages enable row level security;
alter table public.profiles force row level security;
alter table public.articles force row level security;
alter table public.contact_messages force row level security;

-- Live posts: anonymous readers only. Authors use /admin, not this policy.
create policy articles_public_live_select
  on public.articles
  for select
  to anon
  using (status = 'published' and published_at is not null and published_at <= now());

create policy articles_author_select
  on public.articles
  for select
  to authenticated
  using (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  );

create policy articles_author_insert
  on public.articles
  for insert
  to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  );

create policy articles_author_update
  on public.articles
  for update
  to authenticated
  using (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  )
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  );

create policy articles_author_delete
  on public.articles
  for delete
  to authenticated
  using (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  );

create policy profiles_self_select
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy contact_anon_insert
  on public.contact_messages
  for insert
  to anon
  with check (true);

create policy contact_authenticated_insert
  on public.contact_messages
  for insert
  to authenticated
  with check (true);

create policy contact_author_select
  on public.contact_messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  );

grant usage on schema public to anon, authenticated;

grant select on table public.articles to anon, authenticated;
grant insert, update, delete on table public.articles to authenticated;

grant select on table public.profiles to authenticated;

grant insert on table public.contact_messages to anon, authenticated;
grant select on table public.contact_messages to authenticated;

grant usage, select on sequence public.articles_id_seq to authenticated;
grant usage, select on sequence public.contact_messages_id_seq to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy covers_public_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'covers');

create policy covers_author_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'covers'
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  );

create policy covers_author_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'covers'
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  )
  with check (
    bucket_id = 'covers'
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  );

create policy covers_author_select
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'covers');
