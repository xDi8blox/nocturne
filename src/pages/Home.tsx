import { Hero } from '../components/Hero'
import { Row } from '../components/Row'
import { api } from '../lib/api'
import type { Movie } from '../lib/api'
import { useLists } from '../lib/store'
import { useAsync } from '../lib/useAsync'
import { Page } from './Page'

const GENRE_ROWS: [number, string][] = [[878, 'Mind-bending sci-fi'], [53, 'Edge-of-your-seat thrillers'], [16, 'Animated worlds'], [18, 'Prestige drama'], [35, 'Something lighter'], [80, 'Crime & consequence']]

function GenreRow({ g, title }: { g: number; title: string }) {
  const { data } = useAsync(() => api.genre(g), [g])
  return <Row title={title} items={data} />
}
function BecauseRow({ seed }: { seed: Movie }) {
  const { data } = useAsync(() => api.similar(seed), [seed.id])
  return <Row title={`Because you liked ${seed.title}`} items={data} />
}

export default function Home() {
  const trending = useAsync(api.trending, [])
  const top = useAsync(api.topRated, [])
  const { watchlist, seen } = useLists()
  const seed = (seen[0] ?? watchlist[0] ?? trending.data?.[1]) as Movie | undefined
  return (
    <Page className="home">
      <Hero items={trending.data} />
      {trending.error && <p className="error" role="alert">Couldn’t reach TMDB ({trending.error}). Check your key in Settings.</p>}
      <div className="rows">
        <Row title="Trending this week" items={trending.data} ranked />
        {seed && <BecauseRow seed={seed} />}
        <Row title="Top rated of all time" items={top.data} sub="Critics’ shelf" />
        {GENRE_ROWS.map(([g, t]) => <GenreRow key={g} g={g} title={t} />)}
      </div>
    </Page>
  )
}
