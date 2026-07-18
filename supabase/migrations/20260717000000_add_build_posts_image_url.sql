-- Additive: optional author-uploaded build photo for a community post. Null
-- means the post renders the kit hero image (the prior behaviour). The image
-- itself lives in the public `build-post-images` Storage bucket, keyed by the
-- owner's uid path (<user_id>/<uuid>.webp) so owner-only-write RLS applies.

alter table public.build_posts
  add column if not exists image_url text;
