-- Supabase setup for auth-backed profiles, posts, and storage
create extension if not exists "pgcrypto";

-- Profiles tied to Supabase auth users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  bio text,
  phone text,
  youtube_url text,
  avatar_url text,
  cover_url text,
  email text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow all select on profiles') then
    create policy "Allow all select on profiles" on public.profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all insert on profiles') then
    create policy "Allow all insert on profiles" on public.profiles for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all update on profiles') then
    create policy "Allow all update on profiles" on public.profiles for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all delete on profiles') then
    create policy "Allow all delete on profiles" on public.profiles for delete using (true);
  end if;
end$$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id),
  content text,
  audience text,
  tags text[],
  hashtags text[],
  attachment_kind text,
  attachment_name text,
  attachment_preview text,
  attachment_url text,
  attachment_path text
);

alter table public.posts enable row level security;

-- Allow everything (USING true, WITH CHECK true)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow all select on posts') then
    create policy "Allow all select on posts" on public.posts for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all insert on posts') then
    create policy "Allow all insert on posts" on public.posts for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all update on posts') then
    create policy "Allow all update on posts" on public.posts for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all delete on posts') then
    create policy "Allow all delete on posts" on public.posts for delete using (true);
  end if;
end$$;

-- Engagement: likes
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.post_likes enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow all select on post_likes') then
    create policy "Allow all select on post_likes" on public.post_likes for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all insert on post_likes') then
    create policy "Allow all insert on post_likes" on public.post_likes for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all delete on post_likes') then
    create policy "Allow all delete on post_likes" on public.post_likes for delete using (true);
  end if;
end$$;

-- Engagement: comments
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow all select on post_comments') then
    create policy "Allow all select on post_comments" on public.post_comments for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all insert on post_comments') then
    create policy "Allow all insert on post_comments" on public.post_comments for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all delete on post_comments') then
    create policy "Allow all delete on post_comments" on public.post_comments for delete using (true);
  end if;
end$$;

-- Counters
alter table if exists public.posts
  add column if not exists likes_count integer not null default 0,
  add column if not exists comments_count integer not null default 0,
  add column if not exists share_count integer not null default 0;

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  title text,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow all select on notifications') then
    create policy "Allow all select on notifications" on public.notifications for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all insert on notifications') then
    create policy "Allow all insert on notifications" on public.notifications for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all update on notifications') then
    create policy "Allow all update on notifications" on public.notifications for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all delete on notifications') then
    create policy "Allow all delete on notifications" on public.notifications for delete using (true);
  end if;
end$$;

-- Storage bucket for attachments
insert into storage.buckets (id, name, public)
values ('post-attachments', 'post-attachments', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do update set public = excluded.public;

-- Allow everything on storage objects (all buckets). If you want to scope, add bucket_id filter.
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow all select on storage.objects') then
    create policy "Allow all select on storage.objects" on storage.objects for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all insert on storage.objects') then
    create policy "Allow all insert on storage.objects" on storage.objects for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all update on storage.objects') then
    create policy "Allow all update on storage.objects" on storage.objects for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow all delete on storage.objects') then
    create policy "Allow all delete on storage.objects" on storage.objects for delete using (true);
  end if;
end$$;



-- donations

-- Donations tracking table
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  beneficiary_name text,
  post_reference text,
  post_id text,
  cause_id text,
  cause_title text,
  cause_image text,
  amount numeric(12,2) not null,
  currency text not null default 'SGD',
  frequency text not null default 'one-time',
  payment_method text,
  message text,
  dedication text,
  country text,
  cover_fees boolean default false,
  allow_updates boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists donations_user_id_idx on public.donations (user_id);
create index if not exists donations_created_at_idx on public.donations (created_at desc);
create index if not exists donations_post_id_idx on public.donations (post_id);

-- Enable row level security
alter table public.donations enable row level security;

-- Policies: users can insert/select their own donations
drop policy if exists "Users can insert own donations" on public.donations;
create policy "Users can insert own donations"
  on public.donations for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Users can read own donations" on public.donations;
create policy "Users can read own donations"
  on public.donations for select
  using (auth.uid() = user_id);
