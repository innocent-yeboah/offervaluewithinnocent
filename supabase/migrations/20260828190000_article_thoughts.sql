-- Thoughts on a piece. Public can read published rows only (no email).
-- New thoughts are written by the site server after a rate check.

create table public.article_thoughts (
  id bigint generated always as identity primary key,
  article_id bigint not null references public.articles (id) on delete cascade,
  name text not null,
  email text,
  body text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint article_thoughts_status_check
    check (status in ('pending', 'published', 'hidden')),
  constraint article_thoughts_name_len
    check (char_length(name) between 2 and 80),
  constraint article_thoughts_body_len
    check (char_length(body) between 10 and 2000)
);

create index article_thoughts_article_id_idx
  on public.article_thoughts (article_id);

create index article_thoughts_live_idx
  on public.article_thoughts (article_id, created_at)
  where status = 'published';

create index article_thoughts_pending_idx
  on public.article_thoughts (created_at desc)
  where status = 'pending';

alter table public.article_thoughts enable row level security;
alter table public.article_thoughts force row level security;

revoke all on table public.article_thoughts from public, anon, authenticated;

grant select (id, article_id, name, body, created_at)
  on table public.article_thoughts to anon;

grant select on table public.article_thoughts to authenticated;
grant update (status) on table public.article_thoughts to authenticated;

create policy article_thoughts_public_select
  on public.article_thoughts
  for select
  to anon
  using (status = 'published');

create policy article_thoughts_author_select
  on public.article_thoughts
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  );

create policy article_thoughts_author_update
  on public.article_thoughts
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_author = true
    )
    and status in ('pending', 'published', 'hidden')
  );
