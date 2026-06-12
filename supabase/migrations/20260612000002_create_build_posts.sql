-- public.build_posts — a published (or draft) keyboard build shared to the
-- community gallery. component_ids holds a ComponentIdSelection; the
-- validation_snapshot freezes the CompatibilityResult computed server-side at
-- post time (never trusted from the client).

create table if not exists public.build_posts (
  id                  uuid primary key default gen_random_uuid(),
  author_id           uuid not null references public.profiles (id) on delete cascade,
  title               text not null,
  description         text,
  component_ids       jsonb not null default '{}'::jsonb,
  validation_snapshot jsonb,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists build_posts_author_idx
  on public.build_posts (author_id);
create index if not exists build_posts_published_idx
  on public.build_posts (is_published, created_at desc);

alter table public.build_posts enable row level security;

-- Published posts are public; authors always see their own posts (incl. drafts).
create policy "build_posts_select_visible" on public.build_posts
  for select using (is_published or auth.uid() = author_id);

create policy "build_posts_insert_own" on public.build_posts
  for insert with check (auth.uid() = author_id);

create policy "build_posts_update_own" on public.build_posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "build_posts_delete_own" on public.build_posts
  for delete using (auth.uid() = author_id);
