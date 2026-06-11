-- Enable pgvector extension (idempotent)
create extension if not exists vector;

-- Add embedding column to existing catalog table
alter table public.keyboard_components
  add column if not exists embedding vector(512);

-- IVFFlat index for cosine-distance similarity search.
-- lists=1 is correct for catalogs under ~1 000 rows (equivalent to exact scan).
-- Rebuild with a larger lists value (e.g. ceil(sqrt(row_count))) when the
-- catalog grows beyond a few hundred components.
create index if not exists keyboard_components_embedding_idx
  on public.keyboard_components
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 1);

-- match_components RPC --------------------------------------------------------
-- Returns component ids ranked by cosine similarity to a query embedding.
-- Called by searchComponentsBySemantic() in src/lib/ai/embeddings.ts.
--
-- Parameters:
--   query_embedding  – 512-dim float vector from text-embedding-3-small
--   match_count      – max rows to return (default 10)
--   filter_category  – optional category filter ('switch', 'case', etc.)
--
-- Returns:
--   id          – keyboard_components.id
--   similarity  – cosine similarity in [0, 1] (higher = more similar)
-- -----------------------------------------------------------------------------
create or replace function public.match_components(
  query_embedding  vector(512),
  match_count      int  default 10,
  filter_category  text default null
)
returns table (
  id         text,
  similarity float
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    kc.id,
    (1 - (kc.embedding <=> query_embedding))::float as similarity
  from public.keyboard_components kc
  where
    kc.embedding is not null
    and (filter_category is null or kc.category = filter_category)
  order by kc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Grant anon + authenticated roles read-only RPC access (no table mutation)
grant execute on function public.match_components(vector, int, text)
  to anon, authenticated;
