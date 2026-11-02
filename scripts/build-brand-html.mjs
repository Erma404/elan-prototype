// Marque Élan pour le site HTML. Mot-symbole « élan » en bas de casse, trait régulier (6), coupes à 45°, accent parallèle.
// Génère html/brand/*.svg, html/js/logo-data.js et les favicons PNG. Usage : node scripts/build-brand-html.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
const out = new URL('../html/brand/', import.meta.url).pathname.replace(/%20/g, ' ').replace(/%F0%9F%92%BC/g, '💼').replace(/%26/g, '&');
const racine = new URL('../html/', import.meta.url).pathname.replace(/%20/g, ' ').replace(/%F0%9F%92%BC/g, '💼').replace(/%26/g, '&');
mkdirSync(out, { recursive: true });
const t = 6, w = +(t * Math.SQRT2).toFixed(2), f = (n) => +n.toFixed(2);
const poly = (...p) => { const a = p.reduce((s, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return s + (x * y2 - x2 * y) }, 0); const q = a < 0 ? [...p].reverse() : p; return 'M' + q.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'z' };
const trait = (d) => `<path d="${d}" stroke="{INK}" stroke-width="${t}" fill="none"/>`;
const accent = `<path fill="{ACC}" d="${poly([14, 19], [14 + w, 19], [24 + w, 9], [24, 9])}"/>`;
const e = trait('M6 40h26a13 13 0 1 0-3.81 9.19') + accent;
const MARK = { vb: '-1 6 40 52', inner: e };
const WORD = { vb: '0 6 128 52', inner: e + `<path fill="{INK}" d="${poly([40, 14], [46, 8], [46, 56], [40, 56])}"/>` + `<circle cx="67" cy="40" r="13" stroke="{INK}" stroke-width="${t}" fill="none"/>` + trait('M83 24V56') + trait('M95 56V40a13 13 0 0 1 26 0V56') };
const themes = { '': ['#1F1E1B', '#8F6D2E'], '-sombre': ['#F3F0E8', '#C9A66B'], '-mono': ['#1F1E1B', '#1F1E1B'], '-mono-blanc': ['#FFFFFF', '#FFFFFF'] };
const rempl = (s, ink, acc) => s.replaceAll('{INK}', ink).replaceAll('{ACC}', acc);
const svg = (l, ink, acc, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${l.vb}" fill="none"${extra}>${rempl(l.inner, ink, acc)}</svg>\n`;
for (const [s, [ink, acc]] of Object.entries(themes)) {
  writeFileSync(`${out}logo-mark${s}.svg`, svg(MARK, ink, acc, ' role="img" aria-label="Élan"'));
  writeFileSync(`${out}logo-wordmark${s}.svg`, svg(WORD, ink, acc, ' role="img" aria-label="Élan"'));
  writeFileSync(`${out}logo-lockup${s}.svg`, svg({ vb: '-8 -2 144 64', inner: WORD.inner }, ink, acc, ' role="img" aria-label="Élan"'));
}
writeFileSync(`${out}favicon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.vb}"><style>.i{stroke:#1F1E1B}.a{fill:#8F6D2E}@media(prefers-color-scheme:dark){.i{stroke:#F3F0E8}.a{fill:#C9A66B}}</style>${MARK.inner.replace('stroke="{INK}"', 'class="i"').replace('fill="{ACC}"', 'class="a"')}</svg>\n`);
writeFileSync(`${out}logo-mark-animated.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.vb}" role="img" aria-label="Élan"><style>
.e{stroke:#1F1E1B;clip-path:inset(0 100% 0 0);animation:r 480ms cubic-bezier(.22,1,.36,1) forwards}.a{fill:#8F6D2E;opacity:0;transform:translate(-8px,8px);animation:s 320ms 480ms cubic-bezier(.22,1,.36,1) forwards}
@keyframes r{to{clip-path:inset(0 0 0 0)}}@keyframes s{to{opacity:1;transform:none}}@media(prefers-color-scheme:dark){.e{stroke:#F3F0E8}.a{fill:#C9A66B}}
@media(prefers-reduced-motion:reduce){.e{animation:none;clip-path:none}.a{animation:none;opacity:1;transform:none}}</style>${MARK.inner.replace('stroke="{INK}"', 'class="e"').replace('fill="{ACC}"', 'class="a"')}</svg>\n`);
writeFileSync(`${racine}js/logo-data.js`, `// Généré par scripts/build-brand-html.mjs. Ne pas modifier à la main.\nexport const LOGO = ${JSON.stringify({ mark: MARK, wordmark: WORD }, null, 1)}\n`);
// Favicons PNG depuis le symbole
const b = await chromium.launch(), p = await b.newPage(), marque = svg(MARK, '#1F1E1B', '#8F6D2E');
for (const [px, nom, pad, fond] of [[16, 'favicon-16.png', 0, 'transparent'], [32, 'favicon-32.png', 0, 'transparent'], [180, 'apple-touch-icon.png', 30, '#faf9f6']]) {
  await p.setViewportSize({ width: px, height: px }); await p.setContent(`<body style="margin:0;background:${fond};display:grid;place-items:center;width:${px}px;height:${px}px">${marque.replace('<svg ', `<svg style="height:${px - pad * 2}px;width:auto" `)}</body>`);
  await p.screenshot({ path: `${racine}${nom}`, omitBackground: fond === 'transparent' });
}
await b.close(); console.log('marque HTML générée');
