import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import type { Movie } from '../lib/api'
import { useLists } from '../lib/store'
import { Page } from './Page'

export default function Watchlist() {
  const lists = useLists()
  const [tab, setTab] = useState<'watchlist' | 'seen'>('watchlist')
  const items = lists[tab] as Movie[]
  return (
    <Page className="pad" title="My List">
      <h1 className="title-art sm">My List</h1>
      <div className="tabs" role="tablist">
        {(['watchlist', 'seen'] as const).map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'watchlist' ? 'Watchlist' : 'Seen'} <span className="count-badge">{lists[t].length}</span></button>)}
      </div>
      {items.length ? <div className="grid">{items.map((m) => <Card key={m.id} m={m} />)}</div> : (
        <div className="empty"><h2>{tab === 'watchlist' ? 'Nothing saved yet' : 'No films marked seen'}</h2><p className="dim">Tap <b>+</b> on any title to save it here. Stored privately in this browser.</p><Link className="btn primary" to="/">Browse films</Link></div>
      )}
    </Page>
  )
}
