import { GENRES, SAMPLE } from '../data/sample'

export interface Person { name: string; character?: string; profile?: string | null }
export interface Provider { name: string; logo: string; type: string }
export interface Movie {
  id: number; title: string; overview: string; tagline?: string; release_date: string
  runtime?: number; vote_average: number; vote_count: number; popularity: number; genre_ids: number[]
  poster?: string | null; backdrop?: string | null; trailerKey?: string; director?: string
  cast?: Person[]; providers?: { link?: string; list: Provider[] } | null; similar?: Movie[]
}
export interface Filters { q: string; genre: number | 0; year: string; minRating: number; sort: 'popularity' | 'rating' | 'newest' | 'title' }

const KEY_STORE = 'nocturne:tmdbKey'
export const getKey = (): string => localStorage.getItem(KEY_STORE) || import.meta.env.VITE_TMDB_KEY || ''
export const setKey = (k: string) => (k ? localStorage.setItem(KEY_STORE, k.trim()) : localStorage.removeItem(KEY_STORE))
export const isLive = () => !!getKey()
export const genreName = (id: number) => GENRES[id] ?? 'Other'
export const ALL_GENRES = Object.entries(GENRES).map(([id, name]) => ({ id: +id, name }))
export const year = (m: Movie) => m.release_date?.slice(0, 4) || '—'

const IMG = 'https://image.tmdb.org/t/p/'
const cache = new Map<string, Promise<unknown>>()
async function tm<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const key = getKey()
  const qs = new URLSearchParams({ language: 'en-US', ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) })
  const auth: RequestInit = key.length > 40 ? { headers: { Authorization: `Bearer ${key}` } } : {}
  if (key.length <= 40) qs.set('api_key', key)
  const url = `https://api.themoviedb.org/3${path}?${qs}`
  if (!cache.has(url)) cache.set(url, fetch(url, auth).then((r) => { if (!r.ok) throw new Error(`TMDB ${r.status}`); return r.json() }))
  return cache.get(url) as Promise<T>
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any
const norm = (r: Raw): Movie => ({
  id: r.id, title: r.title, overview: r.overview, tagline: r.tagline, release_date: r.release_date || '',
  runtime: r.runtime, vote_average: r.vote_average ?? 0, vote_count: r.vote_count ?? 0, popularity: r.popularity ?? 0,
  genre_ids: r.genre_ids ?? r.genres?.map((g: Raw) => g.id) ?? [],
  poster: r.poster_path ? `${IMG}w500${r.poster_path}` : null, backdrop: r.backdrop_path ? `${IMG}w1280${r.backdrop_path}` : null,
})
const list = async (path: string, p: Record<string, string | number> = {}) => (await tm<{ results: Raw[] }>(path, p)).results.filter((r) => r.title).map(norm)

const sample = SAMPLE.map((s) => ({ ...s, cast: s.castNames.map((name) => ({ name })) })) as Movie[]
const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 280))
const byPop = (a: Movie, b: Movie) => b.popularity - a.popularity

export const api = {
  trending: () => (isLive() ? list('/trending/movie/week') : delay([...sample].sort(byPop).slice(0, 18))),
  topRated: () => (isLive() ? list('/movie/top_rated') : delay([...sample].sort((a, b) => b.vote_average - a.vote_average).slice(0, 18))),
  genre: (g: number) => (isLive() ? list('/discover/movie', { with_genres: g, sort_by: 'popularity.desc' }) : delay(sample.filter((m) => m.genre_ids.includes(g)).sort(byPop))),
  similar: async (m: Movie): Promise<Movie[]> => {
    if (isLive()) return list(`/movie/${m.id}/recommendations`)
    return delay(sample.filter((s) => s.id !== m.id).map((s) => ({ s, score: s.genre_ids.filter((g) => m.genre_ids.includes(g)).length * 10 + (s.director === m.director ? 15 : 0) + s.vote_average }))
      .sort((a, b) => b.score - a.score).slice(0, 14).map((x) => x.s))
  },
  details: async (id: number): Promise<Movie | undefined> => {
    if (!isLive()) { const m = sample.find((s) => s.id === id); return m && delay({ ...m, similar: await api.similar(m), providers: null }) }
    const r = await tm<Raw>(`/movie/${id}`, { append_to_response: 'credits,videos,watch/providers,recommendations' })
    const vids: Raw[] = r.videos?.results ?? []
    const trailer = vids.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ?? vids.find((v) => v.site === 'YouTube')
    const region = navigator.language.split('-')[1] || 'US'
    const wp = r['watch/providers']?.results?.[region] ?? r['watch/providers']?.results?.US
    const provs: Provider[] = []
    for (const t of ['flatrate', 'rent', 'buy'] as const) for (const p of wp?.[t] ?? []) if (!provs.some((x) => x.name === p.provider_name)) provs.push({ name: p.provider_name, logo: `${IMG}w92${p.logo_path}`, type: t === 'flatrate' ? 'Stream' : t === 'rent' ? 'Rent' : 'Buy' })
    return {
      ...norm(r), trailerKey: trailer?.key, director: r.credits?.crew?.find((c: Raw) => c.job === 'Director')?.name,
      cast: (r.credits?.cast ?? []).slice(0, 16).map((c: Raw) => ({ name: c.name, character: c.character, profile: c.profile_path ? `${IMG}w185${c.profile_path}` : null })),
      providers: wp ? { link: wp.link, list: provs } : { list: [] }, similar: (r.recommendations?.results ?? []).map(norm),
    }
  },
  search: async (f: Filters): Promise<Movie[]> => {
    let res: Movie[]
    if (isLive()) {
      res = f.q.trim() ? await list('/search/movie', { query: f.q, ...(f.year ? { year: f.year } : {}) })
        : await list('/discover/movie', { sort_by: f.sort === 'rating' ? 'vote_average.desc' : f.sort === 'newest' ? 'primary_release_date.desc' : 'popularity.desc', 'vote_count.gte': 200, ...(f.genre ? { with_genres: f.genre } : {}), ...(f.year ? { primary_release_year: f.year } : {}), ...(f.minRating ? { 'vote_average.gte': f.minRating } : {}) })
    } else {
      const q = f.q.trim().toLowerCase()
      res = sample.filter((m) => !q || m.title.toLowerCase().includes(q) || m.director?.toLowerCase().includes(q) || m.cast?.some((c) => c.name.toLowerCase().includes(q)))
    }
    res = res.filter((m) => (!f.genre || m.genre_ids.includes(f.genre)) && (!f.year || year(m) === f.year) && m.vote_average >= f.minRating)
    const s = { popularity: byPop, rating: (a: Movie, b: Movie) => b.vote_average - a.vote_average, newest: (a: Movie, b: Movie) => b.release_date.localeCompare(a.release_date), title: (a: Movie, b: Movie) => a.title.localeCompare(b.title) }[f.sort]
    return isLive() && f.sort === 'popularity' ? res : [...res].sort(s)
  },
  pool: async (): Promise<Movie[]> => (isLive() ? [...(await api.trending()), ...(await api.topRated())] : sample),
}
