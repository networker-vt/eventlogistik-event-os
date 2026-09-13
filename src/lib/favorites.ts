import type { CatalogKind } from '../data/catalog/types'

const KEY = 'el_favorites_v1'
const EVT = 'el-favorites-changed'

export type { CatalogKind }

export interface ListingFavorite {
  type: 'listing'
  id: string
  addedAt: string
}

export interface CatalogFavorite {
  type: 'catalog'
  kind: CatalogKind
  id: string
  addedAt: string
}

export type Favorite = ListingFavorite | CatalogFavorite

interface FavState {
  items: Favorite[]
}

function empty(): FavState {
  return { items: [] }
}

function load(): FavState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as FavState
    if (!Array.isArray(parsed.items)) return empty()
    return parsed
  } catch {
    return empty()
  }
}

function save(state: FavState) {
  localStorage.setItem(KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent(EVT))
}

let cache: FavState | null = null

function get(): FavState {
  if (!cache) cache = load()
  return cache
}

function commit(next: FavState) {
  cache = next
  save(next)
}

export function subscribeFavorites(cb: () => void) {
  const handler = () => cb()
  window.addEventListener(EVT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVT, handler)
    window.removeEventListener('storage', handler)
  }
}

export function listFavorites(): Favorite[] {
  return [...get().items].sort((a, b) => b.addedAt.localeCompare(a.addedAt))
}

export function isListingFavorite(id: string): boolean {
  return get().items.some((f) => f.type === 'listing' && f.id === id)
}

export function isCatalogFavorite(kind: CatalogKind, id: string): boolean {
  return get().items.some((f) => f.type === 'catalog' && f.kind === kind && f.id === id)
}

export function toggleListingFavorite(id: string): boolean {
  const state = structuredClone(get())
  const i = state.items.findIndex((f) => f.type === 'listing' && f.id === id)
  if (i >= 0) {
    state.items.splice(i, 1)
    commit(state)
    return false
  }
  state.items.unshift({ type: 'listing', id, addedAt: new Date().toISOString() })
  commit(state)
  return true
}

export function toggleCatalogFavorite(kind: CatalogKind, id: string): boolean {
  const state = structuredClone(get())
  const i = state.items.findIndex((f) => f.type === 'catalog' && f.kind === kind && f.id === id)
  if (i >= 0) {
    state.items.splice(i, 1)
    commit(state)
    return false
  }
  state.items.unshift({ type: 'catalog', kind, id, addedAt: new Date().toISOString() })
  commit(state)
  return true
}

export function removeFavorite(fav: Favorite) {
  const state = structuredClone(get())
  state.items = state.items.filter((f) => {
    if (fav.type === 'listing' && f.type === 'listing') return f.id !== fav.id
    if (fav.type === 'catalog' && f.type === 'catalog') {
      return !(f.kind === fav.kind && f.id === fav.id)
    }
    return true
  })
  commit(state)
}
