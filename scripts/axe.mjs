// Audit axe-core : npm run axe. Échoue s'il reste une violation.
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base = process.env.BASE || 'http://127.0.0.1:5173';
const paths = (process.argv[2] ? process.argv[2].split(',') : ['/', '/styleguide']);
const b = await chromium.launch();
let total = 0;
for (const theme of ['light', 'dark']) for (const w of [1440, 390]) for (const path of paths) {
  const ctx = await b.newContext({ colorScheme: theme, viewport: { width: w, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(base + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
  const r = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
  for (const v of r.violations) { total++; console.log(`[${theme} ${w} ${path}] ${v.id} (${v.impact}): ${v.help}\n   ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`); }
  await ctx.close();
}
await b.close();
console.log(total ? `${total} violation(s)` : 'axe : zéro violation'); process.exit(total ? 1 : 0);
