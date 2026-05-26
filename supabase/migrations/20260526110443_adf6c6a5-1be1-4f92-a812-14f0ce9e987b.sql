
-- Enums
create type public.app_role as enum ('admin', 'merchant', 'user');
create type public.lock_status as enum ('active', 'matured', 'withdrawn', 'early_exit');
create type public.goal_status as enum ('active', 'completed', 'refunded', 'cancelled');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.payment_status as enum ('pending', 'confirmed', 'failed');

-- Profiles
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Wallets
create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  address text not null,
  chain_id integer not null,
  is_primary boolean not null default false,
  label text,
  created_at timestamptz not null default now(),
  unique (user_id, address, chain_id)
);
alter table public.wallets enable row level security;

-- Locks (Safe Lock)
create table public.locks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(36, 18) not null,
  token text not null,
  duration_days integer not null,
  apy_bps integer not null,
  unlock_at timestamptz not null,
  status public.lock_status not null default 'active',
  tx_hash text,
  created_at timestamptz not null default now()
);
alter table public.locks enable row level security;

-- Merchants
create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  settlement_address text not null,
  category text,
  description text,
  logo_url text,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.merchants enable row level security;

-- Goals (Save to Get)
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric(36, 18) not null,
  current_amount numeric(36, 18) not null default 0,
  token text not null default 'USDC',
  merchant_id uuid references public.merchants(id) on delete set null,
  deadline timestamptz,
  status public.goal_status not null default 'active',
  created_at timestamptz not null default now()
);
alter table public.goals enable row level security;

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  payer_user_id uuid references auth.users(id) on delete set null,
  amount numeric(36, 18) not null,
  token text not null,
  status public.payment_status not null default 'pending',
  tx_hash text,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;

-- Strategies (Earn)
create table public.strategies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  protocol text not null,
  chain text not null,
  token text not null,
  current_apy_bps integer not null default 0,
  tvl numeric(36, 18) not null default 0,
  risk_level text not null default 'low',
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.strategies enable row level security;

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS policies
-- profiles
create policy "Profiles: select own" on public.profiles for select using (auth.uid() = user_id);
create policy "Profiles: insert own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Profiles: update own" on public.profiles for update using (auth.uid() = user_id);

-- user_roles
create policy "Roles: select own" on public.user_roles for select using (auth.uid() = user_id);
create policy "Roles: admin manage" on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- wallets
create policy "Wallets: own all" on public.wallets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- locks
create policy "Locks: own all" on public.locks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- goals
create policy "Goals: own all" on public.goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- merchants
create policy "Merchants: public read" on public.merchants for select using (true);
create policy "Merchants: owner insert" on public.merchants for insert with check (auth.uid() = owner_user_id);
create policy "Merchants: owner update" on public.merchants for update using (auth.uid() = owner_user_id);
create policy "Merchants: owner delete" on public.merchants for delete using (auth.uid() = owner_user_id);

-- payments
create policy "Payments: merchant owner read" on public.payments for select
  using (exists (select 1 from public.merchants m where m.id = merchant_id and m.owner_user_id = auth.uid()));
create policy "Payments: payer read" on public.payments for select using (auth.uid() = payer_user_id);
create policy "Payments: insert any auth" on public.payments for insert with check (auth.uid() is not null);

-- strategies (public catalog)
create policy "Strategies: public read" on public.strategies for select using (true);
create policy "Strategies: admin write" on public.strategies for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Seed strategies
insert into public.strategies (name, protocol, chain, token, current_apy_bps, tvl, risk_level, description) values
  ('USDC Flexible Vault', 'Aave V3', 'Base', 'USDC', 485, 0, 'low', 'Earn variable yield on USDC via Aave V3 lending markets on Base.'),
  ('DAI Stable Vault', 'Aave V3', 'Base', 'DAI', 420, 0, 'low', 'Conservative DAI yield via blue-chip lending.'),
  ('cUSD Yield', 'Moola Market', 'Celo', 'cUSD', 510, 0, 'low', 'Earn yield on Celo stablecoins.');
