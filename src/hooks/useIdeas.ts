import { useEffect, useState } from 'react'
import { listIdeas, subscribeIdeas } from '../lib/ideas'

export function useIdeas() {
  const [v, setV] = useState(0)
  useEffect(() => subscribeIdeas(() => setV((x) => x + 1)), [])
  return { version: v, ideas: listIdeas() }
}
