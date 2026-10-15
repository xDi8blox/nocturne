import { motion } from 'framer-motion'
import { useEffect } from 'react'
export function Page({ children, className = '', title }: { children: React.ReactNode; className?: string; title?: string }) {
  useEffect(() => { document.title = title ? `${title} · Nocturne` : 'Nocturne — Cinema after dark' }, [title])
  return (
    <motion.main id="main" className={`page ${className}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </motion.main>
  )
}
