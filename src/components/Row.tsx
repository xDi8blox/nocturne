import { useRef } from 'react'
import type { Movie } from '../lib/api'
import { Card, SkeletonCard } from './Card'

export function Row({ title, items, ranked, sub }: { title: string; items?: Movie[]; ranked?: boolean; sub?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.85, behavior: 'smooth' })
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const links = [...(ref.current?.querySelectorAll<HTMLAnchorElement>('.card-link') ?? [])]
    const i = links.indexOf(document.activeElement as HTMLAnchorElement)
    if (i < 0) return
    e.preventDefault()
    const next = links[Math.max(0, Math.min(links.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)))]
    next.focus(); next.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
  }
  if (items && !items.length) return null
  return (
    <section className="row" aria-label={title}>
      <header className="row-head"><h2>{title}</h2>{sub && <span className="row-sub">{sub}</span>}</header>
      <div className="row-wrap">
        <button className="row-arrow l" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}>‹</button>
        <div className={`row-track ${ranked ? 'ranked' : ''}`} ref={ref} onKeyDown={onKey}>
          {items ? items.map((m, i) => <Card key={m.id} m={m} rank={ranked ? i + 1 : undefined} />) : Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
        <button className="row-arrow r" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}>›</button>
      </div>
    </section>
  )
}
