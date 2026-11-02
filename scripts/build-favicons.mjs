import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const dir = fileURLToPath(new URL('../public/', import.meta.url));
const mark = readFileSync(`${dir}brand/logo-mark.svg`, 'utf8');
const b = await chromium.launch(); const p = await b.newPage();
for (const [size, name, pad, bg] of [[16, 'favicon-16.png', 0, 'transparent'], [32, 'favicon-32.png', 0, 'transparent'], [180, 'apple-touch-icon.png', 28, '#ffffff']]) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<body style="margin:0;background:${bg};display:grid;place-items:center;width:${size}px;height:${size}px">${mark.replace('<svg ', `<svg style="height:${size - pad * 2}px;width:auto" `)}</body>`);
  await p.screenshot({ path: `${dir}${name}`, omitBackground: bg === 'transparent' });
}
await b.close(); console.log('favicons ok');
