-- public.saved_builds — a user's private saved keyboard build; the
-- account-backed replacement for the old localStorage-only /my-builds.
-- component_ids holds a ComponentIdSelection; validation_snapshot freezes the
-- CompatibilityResult computed server-side at save time (never trusted from
-- the client). Mirrors public.build_posts structurally.

create table if not exists public.saved_builds (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles (id) on delete cascade,
  title                    text,
  component_ids            jsonb not null default '{}'::jsonb,
  validation_snapshot      jsonb,
  estimated_price          numeric,
  estimated_price_currency text,
  source                   text not null default 'manual'
                             check (source in ('recommendation', 'manual')),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists saved_builds_user_idx
  on public.saved_builds (user_id, created_at desc);

alter table public.saved_builds enable row level security;

-- Saved builds are private: every operation is owner-only (the build_posts
-- owner policies, without the public-select carve-out — nothing is published).
create policy "saved_builds_select_own" on public.saved_builds
  for select using (auth.uid() = user_id);

create policy "saved_builds_insert_own" on public.saved_builds
  for insert with check (auth.uid() = user_id);

create policy "saved_builds_update_own" on public.saved_builds
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "saved_builds_delete_own" on public.saved_builds
  for delete using (auth.uid() = user_id);
