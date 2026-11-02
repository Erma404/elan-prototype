import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://qonto.com/fr', { waitUntil: 'domcontentloaded', timeout: 45000 });
await p.waitForTimeout(3000);
const data = await p.evaluate(() => {
  const count = (m, k) => (m[k] = (m[k] || 0) + 1);
  const fonts = {}, sizes = {}, colors = {}, bgs = {}, radii = {}, shadows = {};
  const btns = [], heads = [];
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    if (!el.offsetParent && s.position !== 'fixed') continue;
    if (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) {
      count(fonts, s.fontFamily.split(',')[0] + ' ' + s.fontWeight);
      count(sizes, s.fontSize + '/' + s.lineHeight);
      count(colors, s.color);
    }
    if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') count(bgs, s.backgroundColor);
    if (s.borderRadius !== '0px') count(radii, s.borderRadius);
    if (s.boxShadow !== 'none') count(shadows, s.boxShadow.slice(0, 90));
    if (/^(A|BUTTON)$/.test(el.tagName) && btns.length < 400 && s.borderRadius !== '0px' && s.backgroundColor !== 'rgba(0, 0, 0, 0)')
      btns.push({ t: el.textContent.trim().slice(0, 30), bg: s.backgroundColor, c: s.color, r: s.borderRadius, p: s.padding, fs: s.fontSize, fw: s.fontWeight });
    if (/^H[1-3]$/.test(el.tagName) && heads.length < 12)
      heads.push({ t: el.textContent.trim().slice(0, 50), fs: s.fontSize, fw: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, c: s.color });
  }
  const top = (m, n = 10) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);
  return { title: document.title, fonts: top(fonts), sizes: top(sizes, 14), colors: top(colors), bgs: top(bgs), radii: top(radii), shadows: top(shadows, 5), btns: btns.slice(0, 8), heads };
});
console.log(JSON.stringify(data, null, 1));
await p.screenshot({ path: 'docs/screens/_reference-qonto-hero.png' }).catch(() => {});
await b.close();
