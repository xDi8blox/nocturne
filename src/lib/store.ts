import { useSyncExternalStore } from 'react'
import type { Movie } from './api'

export type Saved = Pick<Movie, 'id' | 'title' | 'release_date' | 'vote_average' | 'genre_ids' | 'poster' | 'backdrop' | 'overview' | 'popularity' | 'vote_count'> & { at: number }
type Lists = { watchlist: Saved[]; seen: Saved[] }
const KEY = 'nocturne:lists'
let state: Lists = (() => { try { return { watchlist: [], seen: [], ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { watchlist: [], seen: [] } } })()
const subs = new Set<() => void>()
const emit = () => { localStorage.setItem(KEY, JSON.stringify(state)); subs.forEach((f) => f()) }
const slim = (m: Movie): Saved => ({ id: m.id, title: m.title, release_date: m.release_date, vote_average: m.vote_average, genre_ids: m.genre_ids, poster: m.poster, backdrop: m.backdrop, overview: m.overview, popularity: m.popularity, vote_count: m.vote_count, at: Date.now() })

export function toggle(list: keyof Lists, m: Movie) {
  const has = state[list].some((x) => x.id === m.id)
  state = { ...state, [list]: has ? state[list].filter((x) => x.id !== m.id) : [slim(m), ...state[list]] }
  emit()
}
export function useLists() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => state)
}
