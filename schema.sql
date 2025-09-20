
-- Customers table with account number
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  industry text,
  goals text,
  account_no text unique,
  status text not null default 'active',
  external_ids jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz default now()
);

-- Sequences for generating customer account numbers
create sequence if not exists customer_account_seq start 1;

-- Catalog
create table if not exists plans (
  id text primary key,
  name text not null,
  price numeric not null,
  features jsonb not null default '[]'
);

create table if not exists add_ons (
  id text primary key,
  name text not null,
  price numeric not null,
  description text
);

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  kind text not null check (kind in ('percent','flat','setup_waiver','trial_days')),
  value numeric not null,
  notes text
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  plan_id text references plans(id),
  promo_codes text[] default '{}',
  waive_setup boolean default false,
  status text not null default 'pending',
  estimated_mrc numeric not null default 0,
  setup_fee numeric not null default 99,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  kind text not null check (kind in ('plan','add_on')),
  item_id text not null,
  price numeric not null
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  provider text not null default 'square',
  intent_id text,
  status text not null default 'created',
  amount numeric not null default 0,
  receipt_url text,
  created_at timestamptz default now()
);

-- App linking
create table if not exists apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  webhook_url text,
  created_at timestamptz default now()
);

create table if not exists link_keys (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references apps(id) on delete cascade,
  key text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_customers_account_no on customers (account_no);
create index if not exists idx_customers_email on customers (email);
create index if not exists idx_customers_phone on customers (phone);

-- Customer account number & helpful fields
create sequence if not exists customer_account_seq start 1;

alter table customers
  add column if not exists account_no text unique,
  add column if not exists status text not null default 'active',
  add column if not exists external_ids jsonb not null default '{}'::jsonb,
  add column if not exists notes text;

create index if not exists idx_customers_account_no on customers (account_no);
create index if not exists idx_customers_email on customers (email);
create index if not exists idx_customers_phone on customers (phone);

-- Enable RLS
alter table if not exists customers enable row level security;
alter table if not exists orders enable row level security;
alter table if not exists order_items enable row level security;
alter table if not exists payments enable row level security;

-- Basic policies (read-only for anon; writes require service role)
do $$ begin
  create policy if not exists customers_read on customers for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy if not exists orders_read on orders for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy if not exists order_items_read on order_items for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy if not exists payments_read on payments for select using (true);
exception when duplicate_object then null; end $$;
