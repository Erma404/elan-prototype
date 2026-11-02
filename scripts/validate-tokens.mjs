// Vérifie le contraste AA de toutes les paires sémantiques, en clair et en sombre.
import { readFileSync } from 'node:fs';
import { ratio } from './contrast.mjs';
const css = readFileSync(new URL('../html/css/input.css', import.meta.url), 'utf8');
const grab = (block) => Object.fromEntries([...block.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(m => [m[1], m[2]]));
const light = grab(css.split(':root[data-theme="dark"]')[0]);
const dark = { ...light, ...grab(css.split(':root[data-theme="dark"]')[1]) };
const text = [['text', 'bg'], ['text', 'bg-soft'], ['text', 'surface'], ['muted', 'bg'], ['muted', 'bg-soft'], ['muted', 'surface'], ['subtle', 'bg'], ['subtle', 'surface'],
  ['primary-fg', 'primary'], ['primary-fg', 'primary-hover'], ['accent-fg', 'accent'], ['accent-fg', 'accent-hover'], ['accent-text', 'accent-soft'], ['accent', 'bg'],
  ['success', 'bg'], ['success', 'success-soft'], ['warning', 'bg'], ['warning', 'warning-soft'], ['danger', 'bg'], ['danger', 'danger-soft'],
  ['ai-text', 'ai-bg'], ['ai-muted', 'ai-bg'], ['ai-accent', 'ai-bg'], ['ai-text', 'ai-surface'], ['ai-muted', 'ai-surface']];
const ui = [['border-strong', 'bg'], ['border-strong', 'surface'], ['focus', 'bg'], ['accent', 'bg'], ['accent', 'surface']];
let fail = 0;
for (const [name, t] of [['clair', light], ['sombre', dark]]) {
  for (const [list, min] of [[text, 4.5], [ui, 3]]) for (const [a, b] of list) {
    if (!t[a] || !t[b]) { console.log(`? ${name} ${a}/${b} manquant`); fail++; continue; }
    const r = ratio(t[a], t[b]);
    if (r < min) { console.log(`ECHEC ${name} ${a} sur ${b}: ${r.toFixed(2)} (min ${min})`); fail++; }
  }
}
console.log(fail ? `${fail} échec(s)` : 'Jetons validés AA (clair et sombre)');
process.exit(fail ? 1 : 0);
