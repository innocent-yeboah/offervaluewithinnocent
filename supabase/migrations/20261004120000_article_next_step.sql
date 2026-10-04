-- Where to next: a short closing line on each piece, plus an optional slug to link.
-- Apply once in the Supabase SQL editor (or supabase db push).
-- Until this runs, the site still shows a closing line. It points readers
-- at the lead piece. It does not store these sentences.
-- Updates only fill rows whose next_step is still empty, so a later edit is kept.

alter table public.articles
  add column if not exists next_step text,
  add column if not exists next_step_slug text;

alter table public.articles
  drop constraint if exists articles_next_step_len;

alter table public.articles
  add constraint articles_next_step_len
  check (next_step is null or char_length(next_step) between 1 and 600);

comment on column public.articles.next_step is
  'One or two closing sentences, shown as Where to next. Null uses the site fallback.';

comment on column public.articles.next_step_slug is
  'Optional slug of a published piece to link under next_step.';

update public.articles
set
  next_step = 'Money answers value you offered, not the effort of looking worthy. I wrote the idea underneath that here.',
  next_step_slug = 'you-don-t-need-to-prove-your-worth-you-need-to-offer-it'
where slug = 'why-money'
  and next_step is null;

update public.articles
set
  next_step = 'A blessing is something true, offered to someone you love, with nothing to prove. It is the same idea I keep writing toward.',
  next_step_slug = 'you-don-t-need-to-prove-your-worth-you-need-to-offer-it'
where slug = 'a-father-s-blessing-to-my-son-cyrus-on-his-10th-birthday'
  and next_step is null;

update public.articles
set
  next_step = 'Keeping score is a quiet way of proving you have given enough. Offering with open hands is the idea I keep coming back to.',
  next_step_slug = 'you-don-t-need-to-prove-your-worth-you-need-to-offer-it'
where slug = 'stop-expecting-start-giving-watch-your-relationships-heal'
  and next_step is null;

update public.articles
set
  next_step = 'That small action is not a test of whether you are serious. It is you offering what you already know, and that shift is what I would read next.',
  next_step_slug = 'you-don-t-need-to-prove-your-worth-you-need-to-offer-it'
where slug = 'you-already-know-what-to-do-here-s-why-you-re-not-doing-it'
  and next_step is null;

update public.articles
set
  next_step = 'Where are you still trying to prove you belong, when you could simply be useful? I took that question into my relationships.',
  next_step_slug = 'stop-expecting-start-giving-watch-your-relationships-heal'
where slug = 'you-don-t-need-to-prove-your-worth-you-need-to-offer-it'
  and next_step is null;

-- List thumbnail. Only the lead piece is filled, from the cover it already has.
-- Other pieces keep a text card until you set a thumbnail in the editor.
alter table public.articles
  add column if not exists thumbnail_path text;

comment on column public.articles.thumbnail_path is
  'Optional image for the articles list and the home lead. Null keeps the card as text.';

update public.articles
set thumbnail_path = cover_image_path
where slug = 'you-don-t-need-to-prove-your-worth-you-need-to-offer-it'
  and thumbnail_path is null
  and cover_image_path is not null;
