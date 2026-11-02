// Serveur statique local avec les mêmes réécritures que vercel.json. Usage : node scripts/serve-html.mjs [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const racine = fileURLToPath(new URL('../html/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const routes = [[/^\/$/, '/index.html'], [/^\/eligibilite\/?$/, '/eligibilite.html'], [/^\/demande\/pieces\/?$/, '/demande/pieces.html'], [/^\/demande\/recapitulatif\/?$/, '/demande/recapitulatif.html'], [/^\/demande\/envoyee\/?$/, '/demande/envoyee.html'], [/^\/expert\/[^/]+\/?$/, '/expert.html'], [/^\/pro(\/dossiers(\/[^/]+)?)?\/?$/, '/pro.html'], [/^\/styleguide\/?$/, '/styleguide.html'], [/^\/bonjour\/?$/, '/bonjour.html']];
createServer(async (req, res) => {
  const chemin = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const cible = routes.find(([re]) => re.test(chemin))?.[1] ?? chemin;
  try { const f = join(racine, normalize(cible)); if (!f.startsWith(racine)) throw 0; const d = await readFile(f); res.writeHead(200, { 'content-type': types[extname(f)] ?? 'application/octet-stream', 'cache-control': 'no-store' }); res.end(d) }
  catch { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Introuvable') }
}).listen(Number(process.argv[2] ?? 5180), '127.0.0.1', () => console.log('http://127.0.0.1:' + (process.argv[2] ?? 5180)));
