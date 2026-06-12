-- public.post_comments — comment thread on a build post. Human comments are
-- inserted by authenticated users as themselves; @keybot replies are inserted
-- server-side via the service role (which bypasses RLS) only after the answer
-- has been grounded through the LangGraph agent. author_id is nullable so a
-- keybot reply has no human author.

create table if not exists public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.build_posts (id) on delete cascade,
  author_id  uuid references public.profiles (id) on delete set null,
  body       text not null,
  is_keybot  boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_idx
  on public.post_comments (post_id, created_at);

alter table public.post_comments enable row level security;

-- Read comments on any post the viewer is allowed to see.
create policy "post_comments_select_visible" on public.post_comments
  for select using (
    exists (
      select 1 from public.build_posts bp
      where bp.id = post_comments.post_id
        and (bp.is_published or bp.author_id = auth.uid())
    )
  );

-- Authenticated users may post only as themselves, and may not forge a keybot
-- reply (is_keybot must be false). Keybot rows come from the service role.
create policy "post_comments_insert_self" on public.post_comments
  for insert with check (auth.uid() = author_id and is_keybot = false);

create policy "post_comments_delete_own" on public.post_comments
  for delete using (auth.uid() = author_id);
