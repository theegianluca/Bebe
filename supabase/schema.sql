-- Run this in the Supabase SQL editor

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade,
  type        text check (type in ('image', 'text')),
  image_url   text,
  content     text,
  title       text,
  source      text,
  year        int,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

alter table public.categories enable row level security;
alter table public.items enable row level security;

create policy "Public read categories"
  on public.categories for select using (true);

create policy "Public read items"
  on public.items for select using (true);

create policy "Auth write categories"
  on public.categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Auth write items"
  on public.items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
