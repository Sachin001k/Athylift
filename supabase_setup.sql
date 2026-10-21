-- Athylift: complete Supabase database setup.
-- Replaces supabase.sql + migrations/001, 002. Safe to re-run.
-- Applied by `npm run db:setup` (scripts/setup-db.mjs), or paste into the SQL Editor.
--
-- Security model
--   * Everyone (including logged-out visitors) can read profiles, posts, likes, comments.
--   * Users can only create/edit/delete their own rows.
--   * Counters (likes/comments/shares) and notifications are written only by the database.
--   * Notifications and donations are visible only to their owner.
--   * Storage: public read; users can only write inside their own "<user id>/" folder.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  bio text check (char_length(bio) <= 2000),
  phone text check (char_length(phone) <= 32),
  youtube_url text check (char_length(youtube_url) <= 500),
  avatar_url text check (char_length(avatar_url) <= 1000),
  cover_url text check (char_length(cover_url) <= 1000),
  email text,
  role text check (char_length(role) <= 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- The profile row is created by the database when the auth user is created.
-- Register.tsx passes {full_name, first_name, last_name, role} as signUp metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    left(nullif(trim(coalesce(
      new.raw_user_meta_data->>'full_name',
      concat_ws(' ', new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name')
    )), ''), 120),
    left(new.raw_user_meta_data->>'role', 60)
  )
  on conflict (id) do nothing;
  return new;
end$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.email in sync when a user changes their email.
create or replace function public.handle_user_email_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text check (char_length(content) <= 5000),
  audience text not null default 'anyone' check (audience in ('anyone', 'connections')),
  tags text[] not null default '{}',
  hashtags text[] not null default '{}',
  attachment_kind text check (attachment_kind in ('image', 'video', 'file')),
  attachment_name text check (char_length(attachment_name) <= 300),
  -- Short URL only (e.g. a video poster). Never a base64 data URL.
  attachment_preview text check (char_length(attachment_preview) <= 2048),
  attachment_url text check (char_length(attachment_url) <= 2048),
  attachment_path text check (char_length(attachment_path) <= 1024),
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  share_count integer not null default 0
);

create index if not exists posts_user_id_idx on public.posts (user_id);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- ---------------------------------------------------------------------------
-- post_likes
-- ---------------------------------------------------------------------------
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists post_likes_user_id_idx on public.post_likes (user_id);

-- ---------------------------------------------------------------------------
-- post_comments
-- ---------------------------------------------------------------------------
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  content text not null check (char_length(trim(content)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_id_idx on public.post_comments (post_id, created_at desc);

-- ---------------------------------------------------------------------------
-- notifications (written only by the database)
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx on public.notifications (user_id, is_read, created_at desc);

-- ---------------------------------------------------------------------------
-- donations
-- No payment gateway is connected yet, so every row is a pledge ("pledged").
-- Only the database (or a future payment webhook using the service role) may change status.
-- ---------------------------------------------------------------------------
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  beneficiary_name text check (char_length(beneficiary_name) <= 120),
  post_reference text check (char_length(post_reference) <= 200),
  post_id text check (char_length(post_id) <= 64),
  cause_id text check (char_length(cause_id) <= 64),
  cause_title text check (char_length(cause_title) <= 200),
  cause_image text check (char_length(cause_image) <= 2048),
  amount numeric(12,2) not null check (amount > 0 and amount <= 1000000),
  currency text not null default 'INR' check (char_length(currency) = 3),
  frequency text not null default 'one-time' check (frequency in ('one-time', 'monthly')),
  payment_method text check (char_length(payment_method) <= 40),
  message text check (char_length(message) <= 1000),
  dedication text check (char_length(dedication) <= 200),
  country text check (char_length(country) <= 60),
  cover_fees boolean not null default false,
  allow_updates boolean not null default false,
  status text not null default 'pledged' check (status in ('pledged', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade path for a donations table created by the old supabase.sql.
alter table public.donations add column if not exists status text not null default 'pledged';

create index if not exists donations_user_id_idx on public.donations (user_id);
create index if not exists donations_created_at_idx on public.donations (created_at desc);
create index if not exists donations_post_id_idx on public.donations (post_id);

drop trigger if exists donations_set_updated_at on public.donations;
create trigger donations_set_updated_at
  before update on public.donations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- contact_messages (Contact page; insert-only for visitors)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text not null check (char_length(trim(message)) between 1 and 5000),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Counters + notifications maintained by the database
-- ---------------------------------------------------------------------------
create or replace function public.actor_display_name(p_user_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(nullif(trim(full_name), ''), 'An Athylift member')
    from public.profiles where id = p_user_id
  union all
  select 'An Athylift member'
  limit 1;
$$;

create or replace function public.on_post_like_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_post_id uuid := coalesce(new.post_id, old.post_id);
  v_owner uuid;
begin
  update public.posts
     set likes_count = (select count(*) from public.post_likes where post_id = v_post_id)
   where id = v_post_id
  returning user_id into v_owner;

  if tg_op = 'INSERT' and v_owner is not null and v_owner <> new.user_id then
    insert into public.notifications (user_id, title, body)
    values (v_owner, 'Your post was liked', public.actor_display_name(new.user_id) || ' liked your post.');
  end if;
  return null;
end$$;

drop trigger if exists post_likes_count on public.post_likes;
drop trigger if exists post_likes_change on public.post_likes;
create trigger post_likes_change
  after insert or delete on public.post_likes
  for each row execute function public.on_post_like_change();

create or replace function public.on_post_comment_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_post_id uuid := coalesce(new.post_id, old.post_id);
  v_owner uuid;
begin
  update public.posts
     set comments_count = (select count(*) from public.post_comments where post_id = v_post_id)
   where id = v_post_id
  returning user_id into v_owner;

  if tg_op = 'INSERT' and v_owner is not null and new.user_id is not null and v_owner <> new.user_id then
    insert into public.notifications (user_id, title, body)
    values (
      v_owner,
      'New comment on your post',
      left(public.actor_display_name(new.user_id) || ' commented: ' || new.content, 180)
    );
  end if;
  return null;
end$$;

drop trigger if exists post_comments_count on public.post_comments;
drop trigger if exists post_comments_change on public.post_comments;
create trigger post_comments_change
  after insert or delete on public.post_comments
  for each row execute function public.on_post_comment_change();

create or replace function public.my_profile()
returns setof public.profiles language sql stable security definer set search_path = public as $$
  select * from public.profiles where id = auth.uid();
$$;

create or replace function public.increment_share(p_post_id uuid)
returns integer language sql security definer set search_path = public as $$
  update public.posts set share_count = share_count + 1
   where id = p_post_id
  returning share_count;
$$;

-- ---------------------------------------------------------------------------
-- Table privileges: column-level grants stop clients from writing counters,
-- owners, timestamps or donation status, even on their own rows.
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.posts, public.post_likes, public.post_comments,
  public.notifications, public.donations, public.contact_messages from anon, authenticated;

grant select on public.posts, public.post_likes, public.post_comments to anon, authenticated;
-- email and phone are private: they are left out of the public column grant and
-- each user reads their own through my_profile().
grant select (id, full_name, bio, youtube_url, avatar_url, cover_url, role, created_at, updated_at)
  on public.profiles to anon, authenticated;

grant insert (id, full_name, bio, phone, youtube_url, avatar_url, cover_url, role) on public.profiles to authenticated;
grant update (full_name, bio, phone, youtube_url, avatar_url, cover_url, role) on public.profiles to authenticated;

grant insert (user_id, content, audience, tags, hashtags, attachment_kind, attachment_name, attachment_preview, attachment_url, attachment_path)
  on public.posts to authenticated;
grant update (content, audience, tags, hashtags, attachment_kind, attachment_name, attachment_preview, attachment_url, attachment_path)
  on public.posts to authenticated;
grant delete on public.posts to authenticated;

grant insert (post_id, user_id) on public.post_likes to authenticated;
grant delete on public.post_likes to authenticated;

grant insert (post_id, user_id, content) on public.post_comments to authenticated;
grant delete on public.post_comments to authenticated;

grant select on public.notifications to authenticated;
grant update (is_read) on public.notifications to authenticated;
grant delete on public.notifications to authenticated;

grant select on public.donations to authenticated;
grant insert (user_id, beneficiary_name, post_reference, post_id, cause_id, cause_title, cause_image, amount, currency,
  frequency, payment_method, message, dedication, country, cover_fees, allow_updates)
  on public.donations to authenticated;

grant insert (name, email, message, user_id) on public.contact_messages to anon, authenticated;

revoke all on function public.increment_share(uuid) from public;
grant execute on function public.increment_share(uuid) to anon, authenticated;
revoke all on function public.my_profile() from public, anon;
grant execute on function public.my_profile() to authenticated;
revoke all on function public.actor_display_name(uuid) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_user_email_change() from public, anon, authenticated;
revoke all on function public.on_post_like_change() from public, anon, authenticated;
revoke all on function public.on_post_comment_change() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.notifications enable row level security;
alter table public.donations enable row level security;
alter table public.contact_messages enable row level security;

-- Remove every old policy (including the old "Allow all ..." ones) before recreating.
do $$
declare
  p record;
begin
  for p in
    select policyname, tablename from pg_policies
     where schemaname = 'public'
       and tablename in ('profiles', 'posts', 'post_likes', 'post_comments', 'notifications', 'donations', 'contact_messages')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end$$;

-- profiles
create policy "profiles: public read" on public.profiles
  for select using (true);
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- posts
create policy "posts: public read" on public.posts
  for select using (true);
create policy "posts: insert own" on public.posts
  for insert to authenticated with check (user_id = auth.uid());
create policy "posts: update own" on public.posts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "posts: delete own" on public.posts
  for delete to authenticated using (user_id = auth.uid());

-- post_likes
create policy "post_likes: public read" on public.post_likes
  for select using (true);
create policy "post_likes: insert own" on public.post_likes
  for insert to authenticated with check (user_id = auth.uid());
create policy "post_likes: delete own" on public.post_likes
  for delete to authenticated using (user_id = auth.uid());

-- post_comments: author or the post's owner can delete
create policy "post_comments: public read" on public.post_comments
  for select using (true);
create policy "post_comments: insert own" on public.post_comments
  for insert to authenticated with check (user_id = auth.uid());
create policy "post_comments: delete own or on own post" on public.post_comments
  for delete to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid())
  );

-- notifications: owner only; no client inserts
create policy "notifications: read own" on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy "notifications: update own" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications: delete own" on public.notifications
  for delete to authenticated using (user_id = auth.uid());

-- donations: owner only
create policy "donations: read own" on public.donations
  for select to authenticated using (user_id = auth.uid());
create policy "donations: insert own" on public.donations
  for insert to authenticated with check (user_id = auth.uid());

-- contact_messages: anyone can submit, nobody can read via the API
create policy "contact_messages: submit" on public.contact_messages
  for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-attachments', 'post-attachments', true, 52428800,
  array['image/*', 'video/*', 'application/pdf', 'text/plain',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', true, 5242880, array['image/*'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Allow all select on storage.objects" on storage.objects;
drop policy if exists "Allow all insert on storage.objects" on storage.objects;
drop policy if exists "Allow all update on storage.objects" on storage.objects;
drop policy if exists "Allow all delete on storage.objects" on storage.objects;
drop policy if exists "Athylift buckets select" on storage.objects;
drop policy if exists "Athylift buckets insert" on storage.objects;
drop policy if exists "Athylift buckets update" on storage.objects;
drop policy if exists "Athylift buckets delete" on storage.objects;
drop policy if exists "athylift: public read" on storage.objects;
drop policy if exists "athylift: upload to own folder" on storage.objects;
drop policy if exists "athylift: update own files" on storage.objects;
drop policy if exists "athylift: delete own files" on storage.objects;

-- Files live at "<user id>/<file>"; only that user may write there.
create policy "athylift: public read" on storage.objects
  for select using (bucket_id in ('post-attachments', 'profile-media'));
create policy "athylift: upload to own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('post-attachments', 'profile-media')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "athylift: update own files" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('post-attachments', 'profile-media')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('post-attachments', 'profile-media')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "athylift: delete own files" on storage.objects
  for delete to authenticated using (
    bucket_id in ('post-attachments', 'profile-media')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
