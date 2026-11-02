import { chromium } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
const dir = process.argv[2];
const files = readdirSync(dir).filter(f => f.endsWith('.svg') && !f.startsWith('_'));
const sizes = [16, 24, 48, 160];
const row = (svg, bg, fg, accent, label) => `<div class="row" style="background:${bg};color:${fg};--logo-accent:${accent}"><span class="l">${label}</span>${sizes.map(s => `<span class="s" style="height:${s}px">${svg.replace('<svg ', `<svg style="height:${s}px;width:auto" `)}</span>`).join('')}</div>`;
const html = `<style>body{margin:0;font:12px sans-serif}.t{padding:8px 16px;font-weight:700}.row{display:flex;align-items:center;gap:32px;padding:14px 16px}.l{width:80px;opacity:.6}.s{display:inline-flex;align-items:center}</style>` +
  files.map(f => { const svg = readFileSync(`${dir}/${f}`, 'utf8');
    return `<div class="t">${f}</div>` + row(svg, '#faf9f6', '#1f1e1b', '#8f6d2e', 'clair') + row(svg, '#12110e', '#f3f0e8', '#c9a66b', 'sombre') + row(svg, '#faf9f6', '#1f1e1b', '#1f1e1b', 'mono'); }).join('');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 400 }, deviceScaleFactor: 2 });
await p.setContent(html); await p.screenshot({ path: process.argv[3], fullPage: true }); await b.close();
