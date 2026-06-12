-- public.profiles — one row per auth user, public-readable identity.
-- A new profile is auto-created by the on_auth_user_created trigger on signup.

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique not null,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Identities are public; each user manages only their own row.
create policy "profiles_select_public" on public.profiles
  for select using (true);

create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-provision a profile row whenever a new auth user is created. The
-- username defaults to the email local-part plus a short uid suffix so it is
-- unique without prompting the user during signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 8),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lock down the SECURITY DEFINER trigger function so it cannot be invoked as a
-- PostgREST RPC. The trigger still fires (trigger execution bypasses the grant).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
