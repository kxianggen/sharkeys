create table if not exists public.keyboard_components (
  id text primary key,
  category text not null check (
    category in ('case', 'pcb', 'plate', 'switch', 'keycap', 'stabilizer')
  ),
  name text not null,
  brand text not null,
  description text,
  beginner_friendly boolean not null default false,
  layouts text[],
  switch_technology text check (
    switch_technology is null
    or switch_technology in ('mechanical', 'optical', 'hall_effect', 'topre')
  ),
  switch_technology_support text[],
  case_mount_support text[],
  pcb_mount_support text[],
  plate_mount_support text[],
  keycap_profile text,
  keycap_layout_support text[],
  compatible_switch_technologies text[],
  stabilizer_type text check (
    stabilizer_type is null
    or stabilizer_type in ('plate_mount', 'pcb_mount', 'screw_in')
  ),
  stabilizer_type_support text[],
  supported_layouts text[],
  supported_stabilizer_sizes text[],
  connection text check (
    connection is null
    or connection in ('wired', 'wireless', 'both')
  ),
  hotswap boolean,
  pin_count integer check (pin_count is null or pin_count > 0),
  actuation_force_g numeric(6, 2) check (
    actuation_force_g is null or actuation_force_g > 0
  ),
  sound_profile text check (
    sound_profile is null
    or sound_profile in ('thocky', 'creamy', 'clacky', 'silent', 'neutral')
  ),
  price numeric(10, 2),
  price_currency text check (
    price_currency is null
    or price_currency in ('MYR', 'USD')
  ),
  vendor_url text,
  image_url text,
  sound_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.component_sound_samples (
  id uuid primary key default gen_random_uuid(),
  component_id text not null references public.keyboard_components(id) on delete cascade,
  sound_profile text not null check (
    sound_profile in ('thocky', 'creamy', 'clacky', 'silent', 'neutral')
  ),
  sound_url text not null,
  source_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists keyboard_components_category_idx
  on public.keyboard_components (category);

create index if not exists keyboard_components_layouts_idx
  on public.keyboard_components using gin (layouts);

create index if not exists keyboard_components_switch_support_idx
  on public.keyboard_components using gin (switch_technology_support);

create index if not exists component_sound_samples_component_id_idx
  on public.component_sound_samples (component_id);

alter table public.keyboard_components enable row level security;
alter table public.component_sound_samples enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.keyboard_components to anon, authenticated;
grant select on public.component_sound_samples to anon, authenticated;

create policy "Catalog components are publicly readable"
  on public.keyboard_components
  for select
  to anon, authenticated
  using (true);

create policy "Catalog sound samples are publicly readable"
  on public.component_sound_samples
  for select
  to anon, authenticated
  using (true);
