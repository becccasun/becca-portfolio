-- Play page message board (src/components/Notes.tsx).
-- Visitors can add a note but can only set its text and name; every new note waits
-- with approved = false until Rebecca ticks it in the Supabase Table Editor.
-- Her own notes are rows she adds there with from_rebecca and approved both ticked.
-- Applied 2026-10-16 to project dohilwcnbiyfuliaorxn, replacing the old portfolio's
-- postcards table (empty when dropped).

drop table if exists public.postcards;

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  body text not null check (char_length(btrim(body)) between 1 and 140),
  name text check (name is null or char_length(name) <= 40),
  approved boolean not null default false,
  from_rebecca boolean not null default false
);

create index notes_approved_created_idx on public.notes (approved, created_at desc);

alter table public.notes enable row level security;

-- The browser uses the public (publishable) key: it may read approved notes and insert
-- text + name only, so it can't approve its own note or sign as Rebecca.
revoke all on public.notes from anon, authenticated;
grant select on public.notes to anon, authenticated;
grant insert (body, name) on public.notes to anon, authenticated;

create policy "Approved notes are public" on public.notes
  for select to anon, authenticated using (approved);

create policy "Anyone can leave a note for review" on public.notes
  for insert to anon, authenticated with check (approved = false and from_rebecca = false);

-- Keeps a script from burying the review queue: at most 30 new notes in any
-- 10 minutes, and at most 300 waiting for review at once. Rebecca's own rows
-- (added in the dashboard as an admin) aren't affected.
create or replace function public.notes_flood_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- inside a security definer function current_user is the owner, so check the request's role
  if current_setting('role', true) in ('anon', 'authenticated') then
    if (select count(*) from public.notes where created_at > now() - interval '10 minutes') >= 30 then
      raise exception 'Too many notes right now, try again later' using errcode = 'P0001';
    end if;
    if (select count(*) from public.notes where not approved) >= 300 then
      raise exception 'The review queue is full, try again later' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.notes_flood_limit() from public, anon, authenticated;

create trigger notes_flood_limit
  before insert on public.notes
  for each row execute function public.notes_flood_limit();
