// Génère tous les assets de marque Élan depuis une seule construction géométrique.
// Règle : capitale de 32 unités, tous les terminaux coupés à 45°, accent parallèle à la coupe.
// Deux graisses optiques : légère (t = 4, ratio 0,125 proche du wordmark LEDGE) et régulière (t = 6, pour 16 px).
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../public/brand/', import.meta.url));
const fin = fileURLToPath(new URL('../docs/brand-explorations/final/', import.meta.url));
const src = fileURLToPath(new URL('../src/components/ui/', import.meta.url));
for (const d of [out, fin]) mkdirSync(d, { recursive: true });

const TOP = 24, BASE = 56;
const f = (n) => +n.toFixed(2);
// Tous les polygones sont tracés dans le même sens : leurs recouvrements s'additionnent au lieu de se retrancher.
const poly = (...pts) => {
  const aire = pts.reduce((a, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return a + (x * y2 - x2 * y) }, 0)
  const p = aire < 0 ? [...pts].reverse() : pts
  return 'M' + p.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'z'
}

/** É : fût, trois barres coupées à 45° (le bas de la coupe recule de t), accent parallèle. */
function eLettre(x, t) {
  const arm = (y, len) => poly([x, y], [x + len, y], [x + len - t, y + t], [x, y + t]);
  const yMid = (TOP + BASE) / 2 - t / 2;
  const w = t * Math.SQRT2;
  const bx = x + 5 + t * 0.4, by = TOP - 5;
  return {
    ink: [poly([x, TOP], [x + t, TOP], [x + t, BASE], [x, BASE]), arm(TOP, 20), arm(yMid, 17), arm(BASE - t, 20)].join(''),
    accent: poly([bx, by], [bx + w, by], [bx + w + 10, by - 10], [bx + 10, by - 10]),
    width: 20, top: by - 10,
  }
}
function lLettre(x, t) { return poly([x, TOP], [x + t, TOP], [x + t, BASE - t], [x + 16, BASE - t], [x + 16 - t, BASE], [x, BASE]) }
function aLettre(x, t) {
  let hw = t / 2;
  for (let i = 0; i < 6; i++) hw = (t / 2) / Math.cos(Math.atan((12 - 2 * hw) / (BASE - TOP)));
  const cb = x + hw, ct = x + 12 - hw, s = (ct - cb) / (BASE - TOP);
  const leg = (m) => { const c = (y) => m(cb + (BASE - y) * s); return poly([c(BASE) - hw, BASE], [c(BASE) + hw, BASE], [c(TOP) + hw, TOP], [c(TOP) - hw, TOP]) };
  const mirror = (xx) => 2 * (x + 12) - xx;
  const left = leg((v) => v);
  const right = poly([mirror(cb) - hw, BASE], [mirror(cb) + hw, BASE], [mirror(ct) + hw, TOP], [mirror(ct) - hw, TOP]);
  const yb = BASE - 13 - t, cx = (y) => cb + (BASE - y) * s;
  const bar = poly([cx(yb + t / 2), yb], [mirror(cx(yb + t / 2)), yb], [mirror(cx(yb + t / 2)), yb + t], [cx(yb + t / 2), yb + t]);
  return left + right + bar;
}
function nLettre(x, t) {
  const d = t * 1.18, r = x + 18;
  return poly([x, TOP], [x + t, TOP], [x + t, BASE], [x, BASE]) + poly([r, TOP], [r + t, TOP], [r + t, BASE], [r, BASE]) + poly([x, TOP], [x + d, TOP], [r + t, BASE], [r + t - d, BASE]);
}

function wordmark(t) {
  const e = eLettre(0, t);
  const xl = 20 + 6, xa = xl + 16 + 4, xn = xa + 24 + 7;
  const ink = e.ink + lLettre(xl, t) + aLettre(xa, t) + nLettre(xn, t);
  const W = xn + 18 + t;
  return { ink, accent: e.accent, vb: `-2 ${f(e.top - 2)} ${f(W + 4)} ${f(BASE - e.top + 4)}` };
}
function mark(t) {
  const e = eLettre(0, t);
  return { ink: e.ink, accent: e.accent, vb: `-3 ${f(e.top - 3)} ${f(20 + 10 + 6)} ${f(BASE - e.top + 6)}` };
}
const LIGHT = wordmark(4), MARK = mark(6), LOCKUP = wordmark(4);

const svg = (vb, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none"${extra}>${body}</svg>\n`;
const parts = (g, ink, acc) => `<path fill="${ink}" d="${g.ink}"/><path fill="${acc}" d="${g.accent}"/>`;
const themes = { clair: ['#1F1E1B', '#8F6D2E'], sombre: ['#F3F0E8', '#C9A66B'], mono: ['#1F1E1B', '#1F1E1B'], 'mono-blanc': ['#FFFFFF', '#FFFFFF'] };
for (const [t, [ink, acc]] of Object.entries(themes)) {
  const s = t === 'clair' ? '' : `-${t}`;
  writeFileSync(`${out}logo-mark${s}.svg`, svg(MARK.vb, parts(MARK, ink, acc), ' role="img" aria-label="Élan"'));
  writeFileSync(`${out}logo-wordmark${s}.svg`, svg(LIGHT.vb, parts(LIGHT, ink, acc), ' role="img" aria-label="Élan"'));
  writeFileSync(`${out}logo-lockup${s}.svg`, svg(`-10 ${f(+LOCKUP.vb.split(' ')[1] - 8)} ${f(+LOCKUP.vb.split(' ')[2] + 16)} ${f(+LOCKUP.vb.split(' ')[3] + 16)}`, parts(LOCKUP, ink, acc), ' role="img" aria-label="Élan"'));
}
writeFileSync(`${fin}a-mark.svg`, svg(MARK.vb, parts(MARK, 'currentColor', 'var(--logo-accent,currentColor)')));
writeFileSync(`${fin}b-wordmark.svg`, svg(LIGHT.vb, parts(LIGHT, 'currentColor', 'var(--logo-accent,currentColor)')));
writeFileSync(`${out}favicon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.vb}"><style>.i{fill:#1F1E1B}.a{fill:#8F6D2E}@media(prefers-color-scheme:dark){.i{fill:#F3F0E8}.a{fill:#C9A66B}}</style><path class="i" d="${MARK.ink}"/><path class="a" d="${MARK.accent}"/></svg>\n`);
writeFileSync(`${out}logo-mark-animated.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.vb}" role="img" aria-label="Élan"><style>
.e{fill:#1F1E1B;clip-path:inset(0 100% 0 0);animation:r 480ms cubic-bezier(.22,1,.36,1) forwards}
.a{fill:#8F6D2E;opacity:0;transform:translate(-8px,8px);animation:s 320ms 480ms cubic-bezier(.22,1,.36,1) forwards}
@keyframes r{to{clip-path:inset(0 0 0 0)}}@keyframes s{to{opacity:1;transform:none}}
@media(prefers-color-scheme:dark){.e{fill:#F3F0E8}.a{fill:#C9A66B}}
@media(prefers-reduced-motion:reduce){.e{animation:none;clip-path:none}.a{animation:none;opacity:1;transform:none}}
</style><path class="e" d="${MARK.ink}"/><path class="a" d="${MARK.accent}"/></svg>\n`);
// Données partagées avec l'application : une seule source de vérité.
writeFileSync(`${src}logo-data.ts`, `// Généré par scripts/build-brand.mjs. Ne pas modifier à la main.\nexport const LOGO = ${JSON.stringify({ mark: MARK, wordmark: LIGHT }, null, 1)} as const\n`);
console.log('assets écrits dans public/brand');
