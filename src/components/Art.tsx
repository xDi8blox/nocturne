import { useState } from 'react'
import type { Movie } from '../lib/api'
import { year } from '../lib/api'

const hue = (id: number, o = 0) => (id * 47 + o) % 360
/** Generated key art: a deterministic gradient composition used when no TMDB image is available. */
export function artStyle(id: number): React.CSSProperties {
  const h1 = hue(id), h2 = hue(id, 140), h3 = hue(id, 220), x = 20 + (id % 60), y = 15 + ((id >> 3) % 50)
  return {
    background: `radial-gradient(circle at ${x}% ${y}%, hsl(${h1} 90% 62% / .95), transparent 34%),
      radial-gradient(ellipse at ${100 - x}% ${100 - y / 2}%, hsl(${h2} 80% 45% / .8), transparent 55%),
      conic-gradient(from ${id % 360}deg at 70% 80%, hsl(${h3} 70% 18%), hsl(${h1} 60% 12%), hsl(${h2} 65% 20%), hsl(${h3} 70% 18%)),
      #0b0b10`,
  }
}

export function Poster({ m, showTitle = true }: { m: Movie; showTitle?: boolean }) {
  const [err, setErr] = useState(false)
  if (m.poster && !err) return <img className="art-img" src={m.poster} alt="" loading="lazy" onError={() => setErr(true)} />
  return (
    <div className="art gen" style={artStyle(m.id)} aria-hidden>
      <div className="art-lines" />
      {showTitle && <div className="art-title"><span>{m.title}</span><small>{year(m)}</small></div>}
    </div>
  )
}

export function Backdrop({ m, className = '' }: { m: Movie; className?: string }) {
  const [err, setErr] = useState(false)
  if (m.backdrop && !err) return <img className={`art-img ${className}`} src={m.backdrop} alt="" onError={() => setErr(true)} />
  return <div className={`art gen wide ${className}`} style={artStyle(m.id)} aria-hidden><div className="art-lines" /></div>
}
