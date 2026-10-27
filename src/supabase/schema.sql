-- Run this script in Supabase Dashboard > SQL Editor.
create table if not exists public.projects (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  github_url text not null default '',
  live_url text not null default '',
  icon text not null default 'monitor',
  technologies text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.projects enable row level security;

drop policy if exists "Users can read their own projects" on public.projects;
create policy "Users can read their own projects"
  on public.projects for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own projects" on public.projects;
create policy "Users can insert their own projects"
  on public.projects for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own projects" on public.projects;
create policy "Users can update their own projects"
  on public.projects for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own projects" on public.projects;
create policy "Users can delete their own projects"
  on public.projects for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists projects_user_id_created_at_idx
  on public.projects (user_id, created_at desc);
