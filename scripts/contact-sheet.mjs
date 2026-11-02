import { chromium } from '@playwright/test';
import { readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const dir = `${homedir()}/Downloads/assets`;
const files = readdirSync(dir).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const html = `<style>body{margin:0;background:#ddd;font:11px sans-serif;display:grid;grid-template-columns:repeat(8,170px);gap:8px;padding:8px}div{background:#fff;padding:4px;height:150px;display:flex;flex-direction:column}img{object-fit:contain;flex:1;min-height:0;width:100%;background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/12px 12px}</style>` +
  files.map(f => `<div><img src="file://${dir}/${f}"><span>${f.replace('asset ', '')}</span></div>`).join('');
writeFileSync('/tmp/_sheet.html', html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1450, height: 900 } });
await p.goto('file:///tmp/_sheet.html'); await p.waitForTimeout(1500);
await p.screenshot({ path: 'docs/reference/assets-sheet.png', fullPage: true }); await b.close();
