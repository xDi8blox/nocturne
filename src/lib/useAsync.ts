import { useEffect, useState } from 'react'
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): { data?: T; error?: string } {
  const [s, set] = useState<{ data?: T; error?: string; key?: string }>({})
  const key = JSON.stringify(deps)
  useEffect(() => {
    let live = true
    fn().then((data) => live && set({ data, key }), (e: Error) => live && set({ error: e.message, key }))
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return s.key === key ? s : {}
}
