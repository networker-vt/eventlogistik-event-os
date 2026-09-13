import { useEffect, useState } from 'react'
import type { CatalogKind } from '../data/catalog/types'
import {
  isCatalogFavorite,
  isListingFavorite,
  listFavorites,
  subscribeFavorites,
  toggleCatalogFavorite,
  toggleListingFavorite,
} from '../lib/favorites'

export function useFavorites() {
  const [v, setV] = useState(0)
  useEffect(() => subscribeFavorites(() => setV((x) => x + 1)), [])
  return {
    version: v,
    items: listFavorites(),
    isListingFav: (id: string) => isListingFavorite(id),
    isCatalogFav: (kind: CatalogKind, id: string) => isCatalogFavorite(kind, id),
    toggleListing: toggleListingFavorite,
    toggleCatalog: toggleCatalogFavorite,
  }
}
