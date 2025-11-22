-- Track likes per post per user
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

-- Store comments
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

-- Counters on posts
alter table if exists public.posts
  add column if not exists likes_count integer not null default 0,
  add column if not exists comments_count integer not null default 0,
  add column if not exists share_count integer not null default 0;
