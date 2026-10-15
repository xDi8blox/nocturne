import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { isLive } from '../lib/api'

export const Logo = () => (
  <span className="logo"><img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" width={28} height={28} /><span>Nocturne</span></span>
)
const links = [
  { to: '/', label: 'Home', icon: '⌂' }, { to: '/search', label: 'Search', icon: '⌕' },
  { to: '/tonight', label: "Tonight's Pick", icon: '✦' }, { to: '/watchlist', label: 'My List', icon: '☰' },
]
export function TopNav() {
  const [solid, setSolid] = useState(false)
  const nav = useNavigate()
  useEffect(() => {
    const f = () => setSolid(scrollY > 40); f()
    addEventListener('scroll', f, { passive: true })
    const k = (e: KeyboardEvent) => { if (e.key === '/' && !(e.target instanceof HTMLInputElement)) { e.preventDefault(); nav('/search') } }
    addEventListener('keydown', k)
    return () => { removeEventListener('scroll', f); removeEventListener('keydown', k) }
  }, [nav])
  return (
    <header className={`topnav ${solid ? 'solid' : ''}`}>
      <a href="#main" className="skip">Skip to content</a>
      <NavLink to="/" aria-label="Nocturne home"><Logo /></NavLink>
      <nav aria-label="Primary" className="toplinks">{links.map((l) => <NavLink key={l.to} to={l.to} end>{l.label}</NavLink>)}</nav>
      <NavLink to="/settings" className="settings-link" aria-label="Settings">
        <span className={`mode ${isLive() ? 'live' : ''}`}>{isLive() ? 'TMDB live' : 'Demo data'}</span> ⚙
      </NavLink>
    </header>
  )
}
export const BottomNav = () => (
  <nav className="bottomnav" aria-label="Mobile">
    {links.map((l) => <NavLink key={l.to} to={l.to} end><span aria-hidden>{l.icon}</span><small>{l.label.replace("Tonight's ", '')}</small></NavLink>)}
  </nav>
)
export const Footer = () => (
  <footer className="footer">
    <Logo />
    <p className="tmdb">
      <img src={`${import.meta.env.BASE_URL}tmdb.svg`} alt="TMDB" height={14} />
      This product uses the TMDB API but is not endorsed or certified by TMDB.
    </p>
    <p className="dim">{isLive() ? 'Film data & images © TMDB and respective rights holders.' : 'Demo mode: bundled sample data with generated artwork. Add a TMDB key in Settings for live data.'} Built by <a href="https://github.com/xDi8blox">xDi8blox</a>.</p>
  </footer>
)
