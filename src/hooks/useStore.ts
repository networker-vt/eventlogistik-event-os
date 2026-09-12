import { useEffect, useState } from 'react'
import { store, subscribeStore } from '../lib/store'

export function useStoreVersion() {
  const [v, setV] = useState(0)
  useEffect(() => subscribeStore(() => setV((x) => x + 1)), [])
  return v
}

export function useListings(
  filters: Parameters<typeof store.listListings>[0] = {},
) {
  const v = useStoreVersion()
  return { listings: store.listListings(filters), version: v }
}
