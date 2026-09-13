import { useEffect, useState } from 'react'
import { getFx, refreshFx, subscribeFx } from '../lib/fx'

export function useFx() {
  const [v, setV] = useState(0)
  useEffect(() => {
    const off = subscribeFx(() => setV((x) => x + 1))
    void refreshFx()
    return off
  }, [])
  return { version: v, fx: getFx() }
}
