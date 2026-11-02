import { chromium } from '@playwright/test';
const b = await chromium.launch(); const errs = [];
for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const [i, f] of [0, 0.35, 0.6].entries()) {
    await p.evaluate(y => scrollTo(0, y), Math.round(total * f * (190 / 100) * 0.5)); await p.waitForTimeout(700);
    await p.screenshot({ path: `docs/screens/hero-${tag}-${i}.png` });
  }
}
await b.close(); console.log(errs.length ? errs.join('\n') : 'console propre');
