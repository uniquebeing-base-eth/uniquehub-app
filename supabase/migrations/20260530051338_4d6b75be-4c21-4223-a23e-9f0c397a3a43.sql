-- ============ ENUMS ============
do $$ begin
  create type public.transaction_type as enum ('deposit','transfer','withdrawal','bridge','vault_deposit','goal_funding','yield');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.transaction_status as enum ('pending','processing','completed','failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.deposit_intent_status as enum ('pending','detected','bridging','completed','failed');
exception when duplicate_object then null; end $$;

-- ============ LEGACY SNAPSHOT (for email-based relink) ============
create table if not exists public.legacy_users (
  id uuid primary key,
  email text
);
insert into public.legacy_users (id, email)
  select id, email from auth.users
  on conflict (id) do update set email = excluded.email;

grant all on public.legacy_users to service_role;
alter table public.legacy_users enable row level security;

-- ============ CLERK LINK MAP ============
create table if not exists public.clerk_links (
  clerk_user_id text primary key,
  user_id uuid not null default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);
create index if not exists idx_clerk_links_user_id on public.clerk_links(user_id);

grant all on public.clerk_links to service_role;
alter table public.clerk_links enable row level security;

-- ============ TRANSACTIONS (activity history) ============
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type public.transaction_type not null,
  status public.transaction_status not null default 'completed',
  amount numeric not null default 0,
  token text not null default 'USDC',
  chain_id integer,
  from_chain_id integer,
  to_chain_id integer,
  tx_hash text,
  src_tx_hash text,
  dest_tx_hash text,
  counterparty text,
  ref_id uuid,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_transactions_user on public.transactions(user_id, created_at desc);

grant all on public.transactions to service_role;
alter table public.transactions enable row level security;

create trigger trg_transactions_updated
  before update on public.transactions
  for each row execute function public.touch_updated_at();

-- ============ DEPOSIT INTENTS ============
create table if not exists public.deposit_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status public.deposit_intent_status not null default 'pending',
  from_chain_id integer not null,
  from_token text not null,
  to_chain_id integer not null default 8453,
  to_token text not null default 'USDC',
  amount numeric not null,
  dest_address text not null,
  deposit_address text,
  src_tx_hash text,
  bridge_tx_hash text,
  dest_tx_hash text,
  squid_request_id text,
  squid_route jsonb,
  goal_id uuid,
  failure_reason text,
  detected_at timestamptz,
  bridging_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_deposit_intents_user on public.deposit_intents(user_id, created_at desc);
create index if not exists idx_deposit_intents_status on public.deposit_intents(status);

grant all on public.deposit_intents to service_role;
alter table public.deposit_intents enable row level security;

create trigger trg_deposit_intents_updated
  before update on public.deposit_intents
  for each row execute function public.touch_updated_at();

-- ============ NOTIFICATIONS ============
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text,
  kind text not null default 'info',
  ref_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

grant all on public.notifications to service_role;
alter table public.notifications enable row level security;

-- ============ GOALS ENHANCEMENTS ============
alter table public.goals add column if not exists frequency text not null default 'monthly';
alter table public.goals add column if not exists vault_address text;
alter table public.goals add column if not exists merchant_product_ref text;
alter table public.goals add column if not exists category text;