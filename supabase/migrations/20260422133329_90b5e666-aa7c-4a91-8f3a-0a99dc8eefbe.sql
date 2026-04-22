-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Checklist progress
create table public.checklist_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  checked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.checklist_progress enable row level security;

create policy "Progress: read own" on public.checklist_progress
  for select using (auth.uid() = user_id);
create policy "Progress: insert own" on public.checklist_progress
  for insert with check (auth.uid() = user_id);
create policy "Progress: update own" on public.checklist_progress
  for update using (auth.uid() = user_id);
create policy "Progress: delete own" on public.checklist_progress
  for delete using (auth.uid() = user_id);

create trigger progress_touch_updated_at
  before update on public.checklist_progress
  for each row execute function public.touch_updated_at();