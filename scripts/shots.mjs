import { chromium } from 'playwright'
const base = process.env.URL || 'http://localhost:4173/'
const b = await chromium.launch({ executablePath: process.env.CHROME || undefined })
const errors = []
for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }]]) {
  const { isMobile, deviceScaleFactor, ...viewport } = vp
  const ctx = await b.newContext({ viewport, isMobile, deviceScaleFactor, hasTouch: !!isMobile })
  await ctx.addInitScript(() => { if (!localStorage.getItem('nocturne:lists')) localStorage.setItem('nocturne:lists', '{"watchlist":[],"seen":[]}') })
  const p = await ctx.newPage()
  p.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`))
  p.on('pageerror', (e) => errors.push(`${name}: ${e.message}`))
  const go = async (h, wait = 1400) => { await p.goto(base + '#' + h); await p.waitForTimeout(wait) }
  await go('/', 2200); await p.screenshot({ path: `screenshots/${name}-home.png` })
  await go('/movie/438631', 1600); await p.screenshot({ path: `screenshots/${name}-detail.png` })
  for (const id of [438631, 157336, 496243, 129, 843, 872585]) { await go('/movie/' + id, 500); await p.getByRole('button', { name: /watchlist/i }).first().click() }
  await go('/search?genre=878&sort=rating'); await p.screenshot({ path: `screenshots/${name}-search.png` })
  await go('/tonight', 900); await p.getByRole('button', { name: /shuffle/i }).click(); await p.waitForTimeout(3400); await p.screenshot({ path: `screenshots/${name}-picker.png` })
  await go('/watchlist', 900); await p.screenshot({ path: `screenshots/${name}-watchlist.png` })
  await ctx.close()
}
await b.close()
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors')
