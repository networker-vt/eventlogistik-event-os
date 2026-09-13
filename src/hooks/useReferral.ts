import { useEffect, useState } from 'react'
import { getReferral, subscribeReferral } from '../lib/referral'

export function useReferral() {
  const [v, setV] = useState(0)
  useEffect(() => subscribeReferral(() => setV((x) => x + 1)), [])
  return { version: v, referral: getReferral() }
}
