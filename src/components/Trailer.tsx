import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'

export function Trailer({ id, title, onClose }: { id: string | null; title: string; onClose: () => void }) {
  useEffect(() => {
    if (!id) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [id, onClose])
  return (
    <AnimatePresence>
      {id && (
        <motion.div className="trailer" role="dialog" aria-modal aria-label={`${title} trailer`} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="trailer-box" initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', damping: 24 }} onClick={(e) => e.stopPropagation()}>
            <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={`${title} trailer`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            <button className="close" onClick={onClose} aria-label="Close trailer" autoFocus>✕</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export const trailerSearch = (t: string, y: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${t} ${y} official trailer`)}`
