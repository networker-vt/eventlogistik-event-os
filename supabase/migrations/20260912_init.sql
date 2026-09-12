-- EventLogistik Event-OS — initial schema
-- Run in Supabase SQL editor or via CLI. RLS policies are starter templates.

create extension if not exists "pgcrypto";

create type public.listing_kind as enum ('offer', 'request');
create type public.vertical as enum (
  'freelancer', 'company', 'material', 'transporter', 'courier', 'hotel', 'job'
);
create type public.user_role as enum (
  'freelancer', 'company', 'hotel', 'transporter', 'courier', 'material', 'agency', 'admin'
);
create type public.booking_status as enum (
  'inquiry', 'offer', 'accepted', 'booked', 'completed', 'cancelled'
);
create type public.verification_level as enum ('none', 'email', 'id', 'business');
create type public.project_status as enum ('draft', 'active', 'done');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role public.user_role not null default 'agency',
  city text not null default 'Berlin',
  bio text not null default '',
  avatar_url text,
  crafts text[] not null default '{}',
  verified public.verification_level not null default 'email',
  rating numeric(2,1) not null default 5.0,
  review_count int not null default 0,
  phone text,
  company_name text,
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  kind public.listing_kind not null,
  vertical public.vertical not null,
  title text not null,
  description text not null,
  city text not null,
  crafts text[] not null default '{}',
  price_from numeric,
  price_to numeric,
  price_unit text,
  currency text not null default 'EUR',
  date_from date,
  date_to date,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  tags text[] not null default '{}',
  capacity text,
  image_emoji text not null default '⚡',
  featured boolean not null default false,
  status text not null default 'active' check (status in ('active', 'filled', 'archived')),
  created_at timestamptz not null default now()
);

create index listings_vertical_idx on public.listings (vertical);
create index listings_city_idx on public.listings (city);
create index listings_kind_idx on public.listings (kind);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  city text not null,
  date_from date not null,
  date_to date not null,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  description text not null default '',
  status public.project_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  listing_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.thread_participants (
  thread_id uuid not null references public.threads (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (thread_id, profile_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  listing_title text not null,
  vertical public.vertical not null,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  status public.booking_status not null default 'inquiry',
  offer_amount numeric,
  note text,
  project_id uuid references public.projects (id) on delete set null,
  thread_id uuid references public.threads (id) on delete set null,
  date_from date,
  date_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_resources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  vertical public.vertical not null,
  label text not null,
  status public.booking_status not null,
  unique (project_id, booking_id)
);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.projects enable row level security;
alter table public.threads enable row level security;
alter table public.thread_participants enable row level security;
alter table public.messages enable row level security;
alter table public.bookings enable row level security;
alter table public.project_resources enable row level security;

-- Public read for marketplace listings
create policy "Listings are publicly readable"
  on public.listings for select using (status = 'active');

create policy "Owners manage own listings"
  on public.listings for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Participants read threads"
  on public.threads for select using (
    exists (
      select 1 from public.thread_participants tp
      where tp.thread_id = id and tp.profile_id = auth.uid()
    )
  );

create policy "Participants read messages"
  on public.messages for select using (
    exists (
      select 1 from public.thread_participants tp
      where tp.thread_id = messages.thread_id and tp.profile_id = auth.uid()
    )
  );

create policy "Participants send messages"
  on public.messages for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from public.thread_participants tp
      where tp.thread_id = thread_id and tp.profile_id = auth.uid()
    )
  );

create policy "Booking parties can read"
  on public.bookings for select using (
    auth.uid() = requester_id or auth.uid() = provider_id
  );

create policy "Requester creates booking"
  on public.bookings for insert with check (auth.uid() = requester_id);

create policy "Booking parties update"
  on public.bookings for update using (
    auth.uid() = requester_id or auth.uid() = provider_id
  );

create policy "Owners manage projects"
  on public.projects for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Project owners manage resources"
  on public.project_resources for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );
