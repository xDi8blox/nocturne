import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Movie } from '../lib/api'
import { api, genreName, year } from '../lib/api'
import { toggle, useLists } from '../lib/store'
import { Backdrop } from './Art'
import { Trailer, trailerSearch } from './Trailer'

export function Hero({ items }: { items?: Movie[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [trailer, setTrailer] = useState<string | null>(null)
  const { watchlist } = useLists()
  const list = items?.slice(0, 6) ?? []
  const m = list[i]
  useEffect(() => {
    if (paused || trailer || list.length < 2) return
    const t = setTimeout(() => setI((x) => (x + 1) % list.length), 8000)
    return () => clearTimeout(t)
  }, [i, paused, trailer, list.length])
  const play = useCallback(async () => {
    if (!m) return
    const d = await api.details(m.id)
    if (d?.trailerKey) setTrailer(d.trailerKey)
    else window.open(trailerSearch(m.title, year(m)), '_blank', 'noopener')
  }, [m])
  if (!m) return <div className="hero skeleton-hero shimmer" aria-busy />
  const inList = watchlist.some((x) => x.id === m.id)
  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Featured films" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="sync">
        <motion.div key={m.id} className="hero-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
          <Backdrop m={m} className="kenburns" />
        </motion.div>
      </AnimatePresence>
      <div className="hero-shade" />
      <AnimatePresence mode="wait">
        <motion.div key={m.id} className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}>
          <span className="eyebrow">Featured · No. {i + 1}</span>
          <h1 className="title-art">{m.title}</h1>
          <div className="meta big"><span className="score">★ {m.vote_average.toFixed(1)}</span><span>{year(m)}</span>{m.genre_ids.slice(0, 3).map((g) => <span key={g} className="pill">{genreName(g)}</span>)}</div>
          <p className="hero-over">{m.overview}</p>
          <div className="actions">
            <button className="btn primary" onClick={play}>▶ Play trailer</button>
            <Link className="btn glass" to={`/movie/${m.id}`}>More info</Link>
            <button className={`btn icon glass ${inList ? 'on' : ''}`} onClick={() => toggle('watchlist', m)} aria-pressed={inList} aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}>{inList ? '✓' : '+'}</button>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="hero-dots" role="tablist">
        {list.map((x, j) => (
          <button key={x.id} role="tab" aria-selected={j === i} aria-label={`Show ${x.title}`} className={j === i ? 'on' : ''} onClick={() => setI(j)}>
            {j === i && !paused && !trailer && <span className="fill" />}
          </button>
        ))}
      </div>
      <Trailer id={trailer} title={m.title} onClose={() => setTrailer(null)} />
    </section>
  )
}
