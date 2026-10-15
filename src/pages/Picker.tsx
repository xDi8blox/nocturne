import { motion, useAnimationControls } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Poster } from '../components/Art'
import { api, genreName, year } from '../lib/api'
import type { Movie } from '../lib/api'
import { toggle, useLists } from '../lib/store'
import { useAsync } from '../lib/useAsync'
import { Page } from './Page'

const MOODS = [
  { id: 'thrill', label: 'Wired', emoji: '⚡', desc: 'Adrenaline & tension', g: [28, 53, 80] },
  { id: 'cozy', label: 'Cozy', emoji: '☕', desc: 'Warm, gentle, light', g: [35, 10751, 16, 10749] },
  { id: 'think', label: 'Pensive', emoji: '◐', desc: 'Big ideas, slow burn', g: [878, 9648, 18] },
  { id: 'cry', label: 'Tender', emoji: '❤', desc: 'Something to feel', g: [18, 10749, 10402] },
  { id: 'scare', label: 'Spooked', emoji: '☾', desc: 'Lights off', g: [27, 53] },
  { id: 'epic', label: 'Epic', emoji: '⛰', desc: 'Go big tonight', g: [12, 14, 10752, 36] },
]
const H = 300

export default function Picker() {
  const { data: pool } = useAsync(api.pool, [])
  const { seen } = useLists()
  const [mood, setMood] = useState(MOODS[2])
  const [reel, setReel] = useState<Movie[]>([])
  const [pick, setPick] = useState<Movie | null>(null)
  const [spinning, setSpinning] = useState(false)
  const ctl = useAnimationControls()
  const spin = async () => {
    if (!pool || spinning) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const cand = pool.filter((m) => m.genre_ids.some((g) => mood.g.includes(g)) && !seen.some((s) => s.id === m.id))
    const src = cand.length ? cand : pool
    const winner = src[Math.floor(Math.random() * src.length)]
    const filler = Array.from({ length: 24 }, () => pool[Math.floor(Math.random() * pool.length)])
    setReel([...filler, winner]); setPick(null); setSpinning(true)
    await ctl.set({ y: 0 })
    await ctl.start({ y: -24 * H }, { duration: reduce ? 0 : 2.6, ease: [0.12, 0.6, 0.18, 1] })
    setPick(winner); setSpinning(false)
  }
  return (
    <Page className="picker pad" title="Tonight’s Pick">
      <span className="eyebrow">Can’t decide?</span>
      <h1 className="title-art sm">Tonight’s Pick</h1>
      <p className="dim">Choose a mood. We’ll pull the lever.</p>
      <div className="moods" role="radiogroup" aria-label="Mood">
        {MOODS.map((m) => (
          <button key={m.id} role="radio" aria-checked={mood.id === m.id} className={`mood ${mood.id === m.id ? 'on' : ''}`} onClick={() => setMood(m)}>
            <span className="emoji" aria-hidden>{m.emoji}</span><strong>{m.label}</strong><small>{m.desc}</small>
          </button>
        ))}
      </div>
      <div className="slot-stage">
        <div className="slot" aria-hidden>
          <motion.div className="reel" animate={ctl}>
            {(reel.length ? reel : (pool ?? []).slice(0, 1)).map((m, i) => <div key={i} className="reel-item" style={{ height: H }}><Poster m={m} /></div>)}
          </motion.div>
          <div className="slot-glass" />
        </div>
        <div className="slot-side" aria-live="polite">
          {pick ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="eyebrow">Your {mood.label.toLowerCase()} pick</span>
              <h2 className="pick-title">{pick.title}</h2>
              <div className="meta"><span className="score">★ {pick.vote_average.toFixed(1)}</span><span>{year(pick)}</span><span>{pick.genre_ids.slice(0, 3).map(genreName).join(' · ')}</span></div>
              <p className="dim clamp">{pick.overview}</p>
              <div className="actions">
                <Link className="btn primary" to={`/movie/${pick.id}`}>View details</Link>
                <button className="btn glass" onClick={() => toggle('watchlist', pick)}>+ Watchlist</button>
              </div>
            </motion.div>
          ) : <p className="dim">{spinning ? 'Rolling the reels…' : 'Ready when you are.'}</p>}
          <button className="btn lever" onClick={spin} disabled={!pool || spinning}>{spinning ? 'Shuffling…' : pick ? '↻ Spin again' : '✦ Shuffle'}</button>
        </div>
      </div>
    </Page>
  )
}
