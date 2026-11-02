const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const L = h => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
if (process.argv[1].endsWith('contrast.mjs')) {
  const pairs = JSON.parse(process.argv[2]);
  for (const [fg, bg, min] of pairs) { const r = ratio(fg, bg); console.log(fg, bg, r.toFixed(2), r >= min ? 'OK' : 'ECHEC', `(min ${min})`); }
}
