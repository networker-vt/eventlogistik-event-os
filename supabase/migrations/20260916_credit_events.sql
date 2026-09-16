-- Orbit Credits P0 — append-only ledger.
-- balance(user) = sum(delta). Writes go through apply_credit_intent (idempotent txn_id).
-- Client: VITE_APP_MODE=demo keeps localStorage; prod calls this RPC / Edge Function.

create table if not exists public.credit_events (
  id uuid primary key default gen_random_uuid(),
  txn_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null,
  kind text not null,
  label text not null,
  pool text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint credit_events_txn_unique unique (txn_id)
);

create index if not exists credit_events_user_created_idx
  on public.credit_events (user_id, created_at desc);

create table if not exists public.credit_supply (
  id smallint primary key default 1 check (id = 1),
  circulating bigint not null default 100000,
  remaining_reserve bigint not null default 20900000,
  burned bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint credit_supply_cap check (
    circulating + remaining_reserve + burned = 21000000
    and circulating >= 0
    and remaining_reserve >= 0
    and burned >= 0
  )
);

insert into public.credit_supply (id, circulating, remaining_reserve, burned)
values (1, 100000, 20900000, 0)
on conflict (id) do nothing;

create or replace function public.credit_events_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'credit_events is append-only';
end;
$$;

drop trigger if exists credit_events_no_update on public.credit_events;
create trigger credit_events_no_update
  before update or delete on public.credit_events
  for each row execute function public.credit_events_append_only();

create or replace function public.credit_balance(p_user uuid)
returns integer
language sql
stable
as $$
  select coalesce(sum(delta), 0)::integer from public.credit_events where user_id = p_user;
$$;

create or replace function public.apply_credit_intent(
  p_txn_id text,
  p_delta integer,
  p_kind text,
  p_label text,
  p_pool text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  existing public.credit_events%rowtype;
  bal integer;
  supply public.credit_supply%rowtype;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if p_txn_id is null or length(trim(p_txn_id)) = 0 then
    raise exception 'txn_id required';
  end if;
  if p_delta = 0 then
    bal := public.credit_balance(uid);
    return jsonb_build_object('ok', true, 'duplicate', false, 'balance', bal, 'txn_id', p_txn_id);
  end if;

  select * into existing from public.credit_events where txn_id = p_txn_id;
  if found then
    bal := public.credit_balance(uid);
    return jsonb_build_object(
      'ok', true,
      'duplicate', true,
      'balance', bal,
      'txn_id', existing.txn_id
    );
  end if;

  bal := public.credit_balance(uid);
  if p_delta < 0 and bal + p_delta < 0 then
    return jsonb_build_object('ok', false, 'reason', 'insufficient_balance', 'balance', bal, 'txn_id', p_txn_id);
  end if;

  select * into supply from public.credit_supply where id = 1 for update;

  if p_delta > 0 then
    if supply.remaining_reserve < p_delta then
      return jsonb_build_object('ok', false, 'reason', 'cap', 'balance', bal, 'txn_id', p_txn_id);
    end if;
    if supply.circulating + p_delta + supply.burned > 21000000 then
      return jsonb_build_object('ok', false, 'reason', 'cap', 'balance', bal, 'txn_id', p_txn_id);
    end if;
    update public.credit_supply
      set remaining_reserve = remaining_reserve - p_delta,
          circulating = circulating + p_delta,
          updated_at = now()
      where id = 1;
  elsif p_kind in ('sponsor_fee', 'burn') then
    update public.credit_supply
      set burned = burned + abs(p_delta),
          circulating = circulating - abs(p_delta),
          updated_at = now()
      where id = 1;
  end if;

  insert into public.credit_events (txn_id, user_id, delta, kind, label, pool, metadata)
  values (p_txn_id, uid, p_delta, p_kind, p_label, p_pool, coalesce(p_metadata, '{}'::jsonb));

  bal := public.credit_balance(uid);
  return jsonb_build_object('ok', true, 'duplicate', false, 'balance', bal, 'txn_id', p_txn_id);
end;
$$;

alter table public.credit_events enable row level security;
alter table public.credit_supply enable row level security;

drop policy if exists "Users read own credit events" on public.credit_events;
create policy "Users read own credit events"
  on public.credit_events for select
  using (auth.uid() = user_id);

-- No direct insert/update/delete from clients. Writes go through apply_credit_intent.
revoke insert, update, delete on public.credit_events from anon, authenticated;
grant select on public.credit_events to authenticated;
grant execute on function public.apply_credit_intent(text, integer, text, text, text, jsonb) to authenticated;
grant execute on function public.credit_balance(uuid) to authenticated;

drop policy if exists "Supply is publicly readable" on public.credit_supply;
create policy "Supply is publicly readable"
  on public.credit_supply for select
  using (true);

revoke insert, update, delete on public.credit_supply from anon, authenticated;
grant select on public.credit_supply to anon, authenticated;
