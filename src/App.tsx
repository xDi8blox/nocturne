import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav, Footer, TopNav } from './components/Chrome'
import Detail from './pages/Detail'
import Home from './pages/Home'
import Picker from './pages/Picker'
import Search from './pages/Search'
import Settings from './pages/Settings'
import Watchlist from './pages/Watchlist'

export default function App() {
  const loc = useLocation()
  useEffect(() => { scrollTo({ top: 0 }) }, [loc.pathname])
  return (
    <>
      <TopNav />
      <AnimatePresence mode="wait">
        <Routes location={loc} key={loc.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<Detail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tonight" element={<Picker />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <BottomNav />
      <div className="grain" aria-hidden /><div className="vignette" aria-hidden />
    </>
  )
}
