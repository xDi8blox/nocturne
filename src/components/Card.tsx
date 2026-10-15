import { Link } from 'react-router-dom'
import type { Movie } from '../lib/api'
import { genreName, year } from '../lib/api'
import { toggle, useLists } from '../lib/store'
import { Poster } from './Art'

export function Card({ m, rank }: { m: Movie; rank?: number }) {
  const { watchlist } = useLists()
  const inList = watchlist.some((x) => x.id === m.id)
  return (
    <div className="card" data-card>
      {rank && <span className="rank" aria-hidden>{rank}</span>}
      <Link to={`/movie/${m.id}`} className="card-link" aria-label={`${m.title} (${year(m)}), rated ${m.vote_average.toFixed(1)}`}>
        <div className="card-art"><Poster m={m} /></div>
      </Link>
      <div className="card-info" aria-hidden>
        <div className="card-row">
          <strong>{m.title}</strong>
          <button tabIndex={-1} className={`mini ${inList ? 'on' : ''}`} onClick={() => toggle('watchlist', m)} title={inList ? 'Remove from watchlist' : 'Add to watchlist'}>{inList ? '✓' : '+'}</button>
        </div>
        <div className="meta"><span className="score">★ {m.vote_average.toFixed(1)}</span><span>{year(m)}</span><span>{m.genre_ids.slice(0, 2).map(genreName).join(' · ')}</span></div>
      </div>
    </div>
  )
}

export const SkeletonCard = () => <div className="card skeleton" aria-hidden><div className="card-art shimmer" /></div>
