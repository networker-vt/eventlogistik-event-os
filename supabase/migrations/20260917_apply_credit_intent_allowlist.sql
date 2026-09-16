-- Orbit Credits R4 — allowlist kinds; authenticated users cannot mint.
-- apply_credit_intent: SECURITY DEFINER remains, but:
--   * kind must be in the allowlist (welcome, earn, purchase, burn, gift, boost, …)
--   * delta > 0 (mint / inbound) requires auth.role() = service_role + p_user_id
--   * authenticated JWT may only apply negative deltas (spend / burn / gift)
-- Prefer Edge Function `credit-intent` with SUPABASE_SERVICE_ROLE_KEY for mints.
-- Rate-limit: see CREDITS.md and the Edge Function (30 intents / user / minute isolate).
-- Keep kinds in sync with src/lib/creditKinds.ts

drop function if exists public.apply_credit_intent(text, integer, text, text, text, jsonb);

create or replace function public.apply_credit_intent(
  p_txn_id text,
  p_delta integer,
  p_kind text,
  p_label text,
  p_pool text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  v_role text;
  existing public.credit_events%rowtype;
  bal integer;
  supply public.credit_supply%rowtype;
  v_kind text;
begin
  v_role := coalesce(auth.role(), '');
  v_kind := lower(trim(coalesce(p_kind, '')));

  if v_kind not in (
    'welcome', 'earn', 'purchase', 'burn', 'gift', 'boost', 'p2p',
    'featured', 'extra_swipes', 'travel_scan', 'social_boost', 'interview_slot',
    'booking', 'unlock_message', 'demo_gig', 'sponsor_fee', 'look_tryon',
    'look_shop', 'assist_priority', 'exchange_in', 'exchange_out', 'rewards'
  ) then
    return jsonb_build_object(
      'ok', false,
      'reason', 'kind_not_allowed',
      'balance', 0,
      'txn_id', p_txn_id
    );
  end if;

  if v_role = 'service_role' then
    uid := p_user_id;
    if uid is null then
      raise exception 'p_user_id required for service_role mint';
    end if;
  else
    uid := auth.uid();
    if uid is null then
      raise exception 'not authenticated';
    end if;
    -- Authenticated clients cannot mint or apply arbitrary positive deltas.
    if p_delta > 0 then
      bal := public.credit_balance(uid);
      return jsonb_build_object(
        'ok', false,
        'reason', 'mint_forbidden',
        'balance', bal,
        'txn_id', p_txn_id
      );
    end if;
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
    -- p2p inbound is a transfer, not a reserve mint.
    if v_kind is distinct from 'p2p' then
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
    end if;
  elsif v_kind in ('sponsor_fee', 'burn') then
    update public.credit_supply
      set burned = burned + abs(p_delta),
          circulating = circulating - abs(p_delta),
          updated_at = now()
      where id = 1;
  end if;

  insert into public.credit_events (txn_id, user_id, delta, kind, label, pool, metadata)
  values (p_txn_id, uid, p_delta, v_kind, p_label, p_pool, coalesce(p_metadata, '{}'::jsonb));

  bal := public.credit_balance(uid);
  return jsonb_build_object('ok', true, 'duplicate', false, 'balance', bal, 'txn_id', p_txn_id);
end;
$$;

revoke execute on function public.apply_credit_intent(text, integer, text, text, text, jsonb, uuid) from public, anon;
grant execute on function public.apply_credit_intent(text, integer, text, text, text, jsonb, uuid) to authenticated;
grant execute on function public.apply_credit_intent(text, integer, text, text, text, jsonb, uuid) to service_role;
