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
