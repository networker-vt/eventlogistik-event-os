/**
 * Orbit Credits P0 — Edge Function stub.
 *
 * Demo (`VITE_APP_MODE=demo`): unused. The SPA keeps a localStorage ledger.
 * Prod: verify JWT, then RPC `apply_credit_intent` (append-only, idempotent txn_id,
 * balance = sum(delta), 21M supply check).
 *
 * Deploy later: `supabase functions deploy credit-intent`
 * Vite does not compile this file.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') {
    return json({ ok: false, reason: 'method' }, 405)
  }

  const auth = req.headers.get('Authorization') ?? ''
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: auth } } },
  )

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) return json({ ok: false, reason: 'auth' }, 401)

  let body: {
    txn_id?: string
    delta?: number
    kind?: string
    label?: string
    pool?: string
    metadata?: Record<string, unknown>
  }
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, reason: 'invalid_json' }, 400)
  }

  const txn_id = String(body.txn_id || '').trim()
  const delta = Number(body.delta)
  const kind = String(body.kind || '').trim()
  const label = String(body.label || '').trim()
  if (!txn_id || !kind || !label || !Number.isFinite(delta)) {
    return json({ ok: false, reason: 'invalid_intent' }, 400)
  }

  const { data, error } = await supabase.rpc('apply_credit_intent', {
    p_txn_id: txn_id,
    p_delta: Math.round(delta),
    p_kind: kind,
    p_label: label,
    p_pool: body.pool ?? null,
    p_metadata: body.metadata ?? {},
  })

  if (error) return json({ ok: false, reason: error.message, txn_id }, 400)
  return json(data ?? { ok: false, reason: 'empty', txn_id })
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
