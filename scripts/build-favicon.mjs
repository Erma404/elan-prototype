// Favicon Élan : « é » sur une tuile pleine (lisible à 16 px, inversée en mode sombre). Génère SVG, PNG 16/32/48/180 et favicon.ico.
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { LOGO } from '../html/js/logo-data.js';
const racine = new URL('../html/', import.meta.url).pathname.replace(/%20/g, ' ').replace(/%F0%9F%92%BC/g, '💼').replace(/%26/g, '&');
const m = LOGO.mark;
const marque = (cI, cA) => m.inner.replace('stroke="{INK}"', `class="${cI}"`).replace('fill="{ACC}"', `class="${cA}"`);
const svg = (rx) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>.t{fill:#1F1E1B}.i{stroke:#F3F0E8}.a{fill:#C9A66B}@media(prefers-color-scheme:dark){.t{fill:#F3F0E8}.i{stroke:#1F1E1B}.a{fill:#8F6D2E}}</style><rect class="t" width="64" height="64" rx="${rx}"/><svg x="15" y="10" width="34" height="44" viewBox="${m.vb}">${marque('i', 'a')}</svg></svg>\n`;
writeFileSync(`${racine}brand/favicon.svg`, svg(14));
const b = await chromium.launch(), p = await b.newPage(), png = {};
for (const [px, rx] of [[16, 14], [32, 14], [48, 14], [180, 0]]) {
  await p.setViewportSize({ width: px, height: px });
  await p.setContent(`<body style="margin:0;background:transparent">${svg(rx).replace('<svg ', `<svg width="${px}" height="${px}" `)}</body>`);
  png[px] = await p.screenshot({ omitBackground: true, type: 'png' });
}
await b.close();
writeFileSync(`${racine}favicon-16.png`, png[16]); writeFileSync(`${racine}favicon-32.png`, png[32]); writeFileSync(`${racine}apple-touch-icon.png`, png[180]);
// favicon.ico : trois images PNG (16, 32, 48) dans un conteneur ICO
const tailles = [16, 32, 48], entetes = Buffer.alloc(6 + 16 * tailles.length); entetes.writeUInt16LE(0, 0); entetes.writeUInt16LE(1, 2); entetes.writeUInt16LE(tailles.length, 4);
let off = entetes.length; tailles.forEach((t, i) => { const o = 6 + 16 * i; entetes.writeUInt8(t, o); entetes.writeUInt8(t, o + 1); entetes.writeUInt16LE(1, o + 4); entetes.writeUInt16LE(32, o + 6); entetes.writeUInt32LE(png[t].length, o + 8); entetes.writeUInt32LE(off, o + 12); off += png[t].length });
writeFileSync(`${racine}favicon.ico`, Buffer.concat([entetes, ...tailles.map((t) => png[t])]));
console.log('favicon généré');
