// Extrait les icônes Lucide utilisées vers html/js/icons.js (SVG en ligne, aucune dépendance au runtime).
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const noms = 'banknote sparkles plus triangle-alert arrow-left arrow-right camera check circle-check chevron-down chevron-left chevron-right circle-dashed circle-question-mark clock download external-link eye file-check file-text flame flask-conical info life-buoy loader-circle message-circle message-circle-question-mark message-square-quote circle-minus moon pause pencil phone play rotate-ccw shield-check sun trash-2 truck undo-2 upload user-plus user-round wifi-off x circle-x'.split(' ');
const alias = { 'circle-question-mark': ['circle-help'], 'message-circle-question-mark': ['message-circle-question'], 'file-check': ['file-check-2', 'file-check-corner'], 'triangle-alert': ['alert-triangle'], 'loader-circle': ['loader-2'] };
const out = {}; const manque = [];
for (const n of noms) {
  const essais = [n, ...(alias[n] ?? [])]; const f = essais.map((e) => `node_modules/lucide-react/dist/esm/icons/${e}.mjs`).find(existsSync);
  if (!f) { manque.push(n); continue; }
  // Certains fichiers ne sont que des alias : on suit la réexportation jusqu'au fichier qui porte les données.
  let cible = f
  for (let i = 0; i < 4; i++) { const t = readFileSync(cible, 'utf8'); const r = t.match(/from '\.\/([^']+\.mjs)'/); if (t.includes('__iconData = {') || !r) break; cible = cible.replace(/[^/]+$/, r[1]) }
  const mod = await import(pathToFileURL(cible).href)
  if (!mod.__iconData) { manque.push(n); continue }
  out[n] = mod.__iconData.node.map(([tag, attrs]) => { const { key, ...a } = attrs; return [tag, a]; });
}
writeFileSync('html/js/icons.js', `// Généré par scripts/build-icons.mjs (icônes Lucide, licence ISC).
const ICONS = ${JSON.stringify(out)}
export function icon(nom, classe = 'size-4') {
  const noeuds = ICONS[nom]
  if (!noeuds) return ''
  const corps = noeuds.map(([t, a]) => '<' + t + ' ' + Object.entries(a).map(([k, v]) => k + '="' + v + '"').join(' ') + '/>').join('')
  return '<svg class="' + classe + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + corps + '</svg>'
}
`);
console.log('icônes :', Object.keys(out).length, manque.length ? 'MANQUANTES : ' + manque.join(', ') : 'toutes présentes');
