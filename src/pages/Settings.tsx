import { useState } from 'react'
import { getKey, setKey } from '../lib/api'
import { Page } from './Page'

export default function Settings() {
  const [v, setV] = useState(localStorage.getItem('nocturne:tmdbKey') ?? '')
  const save = (k: string) => { setKey(k); location.reload() }
  return (
    <Page className="pad narrow" title="Settings">
      <h1 className="title-art sm">Settings</h1>
      <p className="dim">Nocturne runs on a bundled demo catalogue by default. Paste a free <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">TMDB API key</a> (v3 key or v4 read token) to unlock live trending lists, real artwork, cast photos, trailers and where-to-watch. The key is stored only in this browser’s localStorage.</p>
      <form onSubmit={(e) => { e.preventDefault(); save(v) }} className="key-form">
        <label htmlFor="key">TMDB API key</label>
        <input id="key" value={v} onChange={(e) => setV(e.target.value)} placeholder="e.g. 3f2a…" autoComplete="off" spellCheck={false} />
        <div className="actions"><button className="btn primary" type="submit">Save & reload</button>{getKey() && <button className="btn glass" type="button" onClick={() => save('')}>Use demo data</button>}</div>
      </form>
      <h3>Keyboard</h3>
      <ul className="dim kbd"><li><kbd>/</kbd> open search</li><li><kbd>Tab</kbd> move between titles, <kbd>←</kbd><kbd>→</kbd> move along a row</li><li><kbd>Enter</kbd> open, <kbd>Esc</kbd> close trailer</li></ul>
    </Page>
  )
}
