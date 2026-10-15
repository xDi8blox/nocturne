import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, SkeletonCard } from '../components/Card'
import { ALL_GENRES, api } from '../lib/api'
import type { Filters } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { Page } from './Page'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const f: Filters = { q: params.get('q') ?? '', genre: Number(params.get('genre') ?? 0), year: params.get('year') ?? '', minRating: Number(params.get('min') ?? 0), sort: (params.get('sort') as Filters['sort']) ?? 'popularity' }
  const [q, setQ] = useState(f.q)
  const input = useRef<HTMLInputElement>(null)
  const set = (k: string, v: string | number) => { const p = new URLSearchParams(params); if (v) p.set(k, String(v)); else p.delete(k); setParams(p, { replace: true }) }
  useEffect(() => { const t = setTimeout(() => set('q', q), 180); return () => clearTimeout(t) }, [q]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { input.current?.focus() }, [])
  const { data, error } = useAsync(() => api.search(f), [f])
  const years = Array.from({ length: 60 }, (_, i) => String(2026 - i))
  return (
    <Page className="search pad" title="Search">
      <div className="search-box">
        <span aria-hidden>⌕</span>
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Titles, people, directors…" aria-label="Search films" type="search" />
      </div>
      <div className="filters" role="group" aria-label="Filters">
        <label>Genre<select value={f.genre} onChange={(e) => set('genre', e.target.value)}><option value={0}>All genres</option>{ALL_GENRES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
        <label>Year<select value={f.year} onChange={(e) => set('year', e.target.value)}><option value="">Any year</option>{years.map((y) => <option key={y}>{y}</option>)}</select></label>
        <label>Min rating<select value={f.minRating} onChange={(e) => set('min', e.target.value)}>{[0, 6, 7, 7.5, 8, 8.5].map((r) => <option key={r} value={r}>{r ? `★ ${r}+` : 'Any'}</option>)}</select></label>
        <label>Sort<select value={f.sort} onChange={(e) => set('sort', e.target.value)}><option value="popularity">Popularity</option><option value="rating">Rating</option><option value="newest">Newest</option><option value="title">A–Z</option></select></label>
      </div>
      <p className="dim count" aria-live="polite">{error ? `Search failed: ${error}` : data ? `${data.length} title${data.length === 1 ? '' : 's'}` : 'Searching…'}</p>
      <div className="grid">
        {!data ? Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />) : (
          <AnimatePresence>
            {data.map((m) => <motion.div key={m.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}><Card m={m} /></motion.div>)}
          </AnimatePresence>
        )}
      </div>
      {data && !data.length && <div className="empty"><h2>No matches</h2><p className="dim">Try loosening a filter.</p></div>}
    </Page>
  )
}
