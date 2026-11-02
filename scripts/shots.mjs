// Captures de tous les écrans : npm run shots [filtre]. Sortie : docs/screens/
import { chromium } from '@playwright/test';
const base = process.env.BASE || 'http://127.0.0.1:5173';
const filter = process.argv[2];
const pages = [{ name: 'landing', path: '/' }, { name: 'styleguide', path: '/styleguide' }];
const sizes = [[1440, 900, '1440'], [768, 1024, '768'], [390, 844, '390']];
const b = await chromium.launch();
const errors = [];
for (const theme of ['light', 'dark']) {
  const ctx = await b.newContext({ colorScheme: theme });
  const p = await ctx.newPage();
  p.on('console', m => m.type() === 'error' && errors.push(`${theme} ${m.text()}`));
  p.on('pageerror', e => errors.push(`${theme} ${e.message}`));
  for (const pg of pages.filter(x => !filter || x.name.includes(filter))) for (const [w, h, tag] of sizes) {
    await p.setViewportSize({ width: w, height: h });
    await p.goto(base + pg.path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(900);
    await p.screenshot({ path: `docs/screens/${pg.name}-${tag}-${theme}.png`, fullPage: true });
  }
  await ctx.close();
}
await b.close();
console.log(errors.length ? 'ERREURS CONSOLE:\n' + [...new Set(errors)].join('\n') : 'captures ok, console propre');
