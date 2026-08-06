-- PTO / Sick leave tracker: initial schema
create extension if not exists "pgcrypto";

create type user_role as enum ('owner', 'employee');
create type request_type as enum ('vacation', 'sick');
create type request_status as enum ('pending', 'approved', 'rejected');

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text not null unique,
  name text not null,
  role user_role not null default 'employee',
  pto_balance_days numeric not null default 0,
  sick_balance_days numeric not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index users_company_id_idx on users(company_id);

create table requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type request_type not null,
  start_date date not null,
  end_date date not null,
  days_count numeric not null,
  status request_status not null default 'pending',
  reason text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  constraint requests_date_order check (end_date >= start_date)
);

create index requests_user_id_idx on requests(user_id);
create index requests_status_idx on requests(status);

create table company_settings (
  company_id uuid primary key references companies(id) on delete cascade,
  default_pto_days_per_year numeric not null default 20,
  default_sick_days_per_year numeric not null default 10
);

-- Resolves the calling request to the matching row in public.users by the
-- authenticated JWT's email claim. Magic-link auth means an employee's
-- public.users row is created by the owner before the employee ever signs
-- in, so we cannot join on auth.uid(); email is the only key both sides share.
create or replace function auth_user_row()
returns users
language sql
stable
security definer
set search_path = public
as $$
  select * from users
  where email = (auth.jwt() ->> 'email')
    and archived = false
  limit 1;
$$;

alter table companies enable row level security;
alter table users enable row level security;
alter table requests enable row level security;
alter table company_settings enable row level security;

-- All writes go through server-side route handlers using the service role
-- key (after the route verifies the caller's session and role), so the
-- policies below only ever need to grant SELECT to authenticated users.

create policy companies_select on companies
  for select to authenticated
  using (id = (select company_id from auth_user_row()));

create policy users_select on users
  for select to authenticated
  using (
    company_id = (select company_id from auth_user_row())
    and (
      (select role from auth_user_row()) = 'owner'
      or email = (auth.jwt() ->> 'email')
    )
  );

create policy requests_select on requests
  for select to authenticated
  using (
    user_id in (select id from users where company_id = (select company_id from auth_user_row()))
    and (
      (select role from auth_user_row()) = 'owner'
      or user_id = (select id from auth_user_row())
    )
  );

create policy company_settings_select on company_settings
  for select to authenticated
  using (company_id = (select company_id from auth_user_row()));
