create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  memorial_key text primary key,
  submission_mode text not null check (submission_mode in ('open', 'locked')) default 'locked',
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  memorial_key text not null,
  name text null,
  message text not null,
  files jsonb not null default '[]'::jsonb,
  status text not null check (status in ('pending', 'approved', 'flagged', 'rejected')),
  ai_confidence double precision null,
  ai_reason text null,
  created_at timestamptz not null default now()
);

create index if not exists submissions_memorial_key_created_at_idx
  on public.submissions (memorial_key, created_at desc);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  memorial_key text not null,
  source_submission_id uuid null references public.submissions(id) on delete set null,
  image_url text not null,
  caption text null,
  name text null,
  approved boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists photos_memorial_key_created_at_idx
  on public.photos (memorial_key, created_at desc);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  memorial_key text not null,
  source_submission_id uuid null references public.submissions(id) on delete set null,
  title text null,
  body text not null,
  cover_image text null,
  author_name text null,
  approved boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists stories_memorial_key_created_at_idx
  on public.stories (memorial_key, created_at desc);

alter table public.site_settings enable row level security;
alter table public.submissions enable row level security;
alter table public.photos enable row level security;
alter table public.stories enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_settings' and policyname = 'Public read memorial site settings'
  ) then
    create policy "Public read memorial site settings" on public.site_settings
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'submissions' and policyname = 'Public cannot read submissions'
  ) then
    create policy "Public cannot read submissions" on public.submissions
      for select using (false);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'photos' and policyname = 'Public read approved photos'
  ) then
    create policy "Public read approved photos" on public.photos
      for select using (approved = true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'stories' and policyname = 'Public read approved stories'
  ) then
    create policy "Public read approved stories" on public.stories
      for select using (approved = true);
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('memorial-media', 'memorial-media', true)
on conflict (id) do nothing;
