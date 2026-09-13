import { useEffect, useState } from 'react'
import { getWallet, subscribeWallet } from '../lib/wallet'

export function useWallet() {
  const [v, setV] = useState(0)
  useEffect(() => subscribeWallet(() => setV((x) => x + 1)), [])
  return { version: v, wallet: getWallet() }
}
