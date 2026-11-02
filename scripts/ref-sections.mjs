import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://qonto.com/fr', { waitUntil: 'domcontentloaded', timeout: 45000 });
await p.waitForTimeout(2500);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
await p.waitForTimeout(800);
const h = await p.evaluate(() => document.body.scrollHeight);
console.log('hauteur', h);
for (const [i, y] of [900, 1800, 2700, 3600, 4500, 5400].entries()) {
  await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(700);
  await p.screenshot({ path: `docs/reference/qonto-${i + 1}.png` });
}
await b.close();
