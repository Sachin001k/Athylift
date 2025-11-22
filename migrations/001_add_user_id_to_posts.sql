-- Adds user_id to posts table
alter table if exists public.posts
  add column if not exists user_id uuid references auth.users(id);
