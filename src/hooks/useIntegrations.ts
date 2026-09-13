import { useEffect, useState } from 'react'
import { getIntegrationState, subscribeIntegrations } from '../lib/integrations'

export function useIntegrations() {
  const [v, setV] = useState(0)
  useEffect(() => subscribeIntegrations(() => setV((x) => x + 1)), [])
  return { version: v, state: getIntegrationState() }
}
