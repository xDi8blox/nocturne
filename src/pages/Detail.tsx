import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Backdrop, Poster } from '../components/Art'
import { Row } from '../components/Row'
import { Trailer, trailerSearch } from '../components/Trailer'
import { api, genreName, isLive, year } from '../lib/api'
import { toggle, useLists } from '../lib/store'
import { useAsync } from '../lib/useAsync'
import { Page } from './Page'

const initials = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('')
const rt = (n?: number) => (n ? `${Math.floor(n / 60)}h ${n % 60}m` : '')

export default function Detail() {
  const id = Number(useParams().id)
  const { data: m, error } = useAsync(() => api.details(id), [id])
  const [trailer, setTrailer] = useState<string | null>(null)
  const { watchlist, seen } = useLists()
  if (error) return <Page><p className="error pad" role="alert">Couldn’t load this title ({error}).</p></Page>
  if (!m) return <Page className="detail"><div className="detail-hero shimmer" aria-busy /><div className="pad"><div className="sk-line shimmer" /><div className="sk-line short shimmer" /></div></Page>
  const inList = watchlist.some((x) => x.id === m.id), wasSeen = seen.some((x) => x.id === m.id)
  const pct = Math.round(m.vote_average * 10)
  return (
    <Page className="detail" title={m.title}>
      <div className="detail-hero">
        <Backdrop m={m} className="kenburns slow" />
        <div className="hero-shade" />
      </div>
      <div className="detail-body">
        <motion.div className="detail-poster" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}><Poster m={m} /></motion.div>
        <div className="detail-copy">
          {m.tagline && <span className="eyebrow">{m.tagline}</span>}
          <h1 className="title-art">{m.title}</h1>
          <div className="meta big">
            <span className="ring" style={{ '--p': pct } as React.CSSProperties} aria-label={`Rated ${m.vote_average.toFixed(1)} out of 10`}><b>{m.vote_average.toFixed(1)}</b></span>
            <span>{year(m)}</span>{m.runtime ? <span>{rt(m.runtime)}</span> : null}
            {m.genre_ids.map((g) => <Link key={g} className="pill" to={`/search?genre=${g}`}>{genreName(g)}</Link>)}
          </div>
          {m.director && <p className="dim">Directed by <strong>{m.director}</strong></p>}
          <p className="lede">{m.overview}</p>
          <div className="actions">
            <button className="btn primary" onClick={() => (m.trailerKey ? setTrailer(m.trailerKey) : window.open(trailerSearch(m.title, year(m)), '_blank', 'noopener'))}>▶ {m.trailerKey ? 'Play trailer' : 'Find trailer'}</button>
            <button className={`btn glass ${inList ? 'on' : ''}`} aria-pressed={inList} onClick={() => toggle('watchlist', m)}>{inList ? '✓ On my list' : '+ Watchlist'}</button>
            <button className={`btn glass ${wasSeen ? 'on' : ''}`} aria-pressed={wasSeen} onClick={() => toggle('seen', m)}>{wasSeen ? '◉ Seen' : '◎ Mark seen'}</button>
          </div>
          <section className="where" aria-label="Where to watch">
            <h3>Where to watch</h3>
            {!isLive() ? <p className="dim">Add a TMDB key in <Link to="/settings">Settings</Link> to see streaming, rental & purchase options for your region.</p>
              : m.providers?.list.length ? (
                <div className="providers">{m.providers.list.map((p) => <a key={p.name} href={m.providers?.link} target="_blank" rel="noreferrer" title={`${p.type} on ${p.name}`}><img src={p.logo} alt={p.name} /><small>{p.type}</small></a>)}<small className="dim">Data by JustWatch via TMDB</small></div>
              ) : <p className="dim">Not currently available to stream in your region.</p>}
          </section>
        </div>
      </div>
      {!!m.cast?.length && (
        <section className="row" aria-label="Cast">
          <header className="row-head"><h2>Cast</h2></header>
          <div className="row-track cast">
            {m.cast.map((c) => (
              <div key={c.name + c.character} className="person">
                {c.profile ? <img src={c.profile} alt="" loading="lazy" /> : <span className="avatar" style={{ '--h': (c.name.length * 37) % 360 } as React.CSSProperties}>{initials(c.name)}</span>}
                <strong>{c.name}</strong>{c.character && <small>{c.character}</small>}
              </div>
            ))}
          </div>
        </section>
      )}
      <Row title="More like this" items={m.similar} />
      <Trailer id={trailer} title={m.title} onClose={() => setTrailer(null)} />
    </Page>
  )
}
