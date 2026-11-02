// Compare le wordmark actuel (capitales fines) à deux variantes plus mémorables. Même règle : coupes à 45°, accent parallèle.
import { writeFileSync } from 'node:fs';
const TOP = 24, BASE = 56, f = (n) => +n.toFixed(2);
const poly = (...pts) => { const aire = pts.reduce((a, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return a + (x * y2 - x2 * y) }, 0); const p = aire < 0 ? [...pts].reverse() : pts; return 'M' + p.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'z' };
const E = (x, t) => { const arm = (y, len) => poly([x, y], [x + len, y], [x + len - t, y + t], [x, y + t]); const w = t * Math.SQRT2, bx = x + 5 + t * 0.4, by = TOP - 5; return { ink: poly([x, TOP], [x + t, TOP], [x + t, BASE], [x, BASE]) + arm(TOP, 20) + arm((TOP + BASE) / 2 - t / 2, 17) + arm(BASE - t, 20), acc: poly([bx, by], [bx + w, by], [bx + w + 10, by - 10], [bx + 10, by - 10]) } };
const A = (x, t) => { let hw = t / 2; for (let i = 0; i < 6; i++) hw = (t / 2) / Math.cos(Math.atan((12 - 2 * hw) / (BASE - TOP))); const cb = x + hw, ct = x + 12 - hw, s = (ct - cb) / (BASE - TOP), m = (v) => 2 * (x + 12) - v; const yb = BASE - 13 - t, cx = (y) => cb + (BASE - y) * s; return poly([cb - hw, BASE], [cb + hw, BASE], [ct + hw, TOP], [ct - hw, TOP]) + poly([m(cb) - hw, BASE], [m(cb) + hw, BASE], [m(ct) + hw, TOP], [m(ct) - hw, TOP]) + poly([cx(yb + t / 2), yb], [m(cx(yb + t / 2)), yb], [m(cx(yb + t / 2)), yb + t], [cx(yb + t / 2), yb + t]) };
const N = (x, t) => { const d = t * 1.18, r = x + 18; return poly([x, TOP], [x + t, TOP], [x + t, BASE], [x, BASE]) + poly([r, TOP], [r + t, TOP], [r + t, BASE], [r, BASE]) + poly([x, TOP], [x + d, TOP], [r + t, BASE], [r + t - d, BASE]) };
const Lp = (x, t, foot = 16) => poly([x, TOP], [x + t, TOP], [x + t, BASE - t], [x + foot, BASE - t], [x + foot - t, BASE], [x, BASE]);
const svg = (vb, corps) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none">${corps}</svg>\n`;
const ink = 'currentColor', acc = 'var(--logo-accent,currentColor)';

// Actuel : capitales fines (t = 4)
{ const t = 4, e = E(0, t), xl = 26, xa = xl + 16 + 4, xn = xa + 24 + 7; writeFileSync('docs/brand-explorations/v3/0-actuel-capitales-fines.svg', svg(`-2 6 ${xn + 18 + t + 4} 52`, `<path fill="${ink}" d="${e.ink + Lp(xl, t) + A(xa, t) + N(xn, t)}"/><path fill="${acc}" d="${e.acc}"/>`)) }
// A : capitales régulières, ligature LA (le pied du L se prolonge jusqu'au pied du A, ligne de base continue)
{ const t = 6, e = E(0, t), xl = 28, xa = xl + 13, xn = xa + 24 + 6; writeFileSync('docs/brand-explorations/v3/A-ligature-LA.svg', svg(`-2 6 ${xn + 18 + t + 4} 52`, `<path fill="${ink}" d="${e.ink + Lp(xl, t, xa - xl + 7) + A(xa, t) + N(xn, t)}"/><path fill="${acc}" d="${e.acc}"/>`)) }
// B : bas de casse « élan », trait régulier, « l » coupé à 45° dans le prolongement de l'accent
{ const t = 6, w = t * Math.SQRT2, g = (d) => `<path d="${d}" stroke="${ink}" stroke-width="${t}"/>`
  const corps = g('M6 40h26a13 13 0 1 0-3.81 9.19') + `<path fill="${acc}" d="${poly([14, 19], [14 + w, 19], [24 + w, 9], [24, 9])}"/>` + `<path fill="${ink}" d="${poly([40, 14], [46, 8], [46, 56], [40, 56])}"/>` + `<circle cx="67" cy="40" r="13" stroke="${ink}" stroke-width="${t}"/>` + g('M83 24V56') + g('M101 56V40a13 13 0 0 1 26 0V56')
  writeFileSync('docs/brand-explorations/v3/B-bas-de-casse.svg', svg('0 6 130 52', corps)) }
console.log('variantes écrites')
