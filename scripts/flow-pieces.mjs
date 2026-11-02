import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
writeFileSync('/tmp/kbis.pdf', Buffer.alloc(300_000, 1)); writeFileSync('/tmp/bilan.pdf', Buffer.alloc(900_000, 1)); writeFileSync('/tmp/lourd.pdf', Buffer.alloc(11 * 1024 * 1024, 1)); writeFileSync('/tmp/note.txt', 'x');
const b = await chromium.launch(); const errs = [];
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(e.message));
await p.goto('http://127.0.0.1:5173/demande/pieces'); await p.waitForTimeout(900);
await p.screenshot({ path: 'docs/screens/pieces-1-premier-acces.png', fullPage: true });
// dépôt du Kbis
await p.locator('input[type=file]').first().setInputFiles('/tmp/kbis.pdf'); await p.waitForTimeout(500);
await p.screenshot({ path: 'docs/screens/pieces-2-envoi.png' });
await p.waitForTimeout(3500);
console.log('Kbis :', await p.locator('#piece-kbis').innerText().then(t => t.includes('Vérifiée') ? 'vérifiée' : t.slice(0, 80)));
// format refusé
await p.locator('#piece-identite button[aria-expanded]').first().click().catch(() => {});
await p.locator('#piece-identite input[type=file]').first().setInputFiles('/tmp/note.txt'); await p.waitForTimeout(400);
console.log('format refusé :', (await p.locator('#piece-identite [role=alert]').first().innerText()).slice(0, 90));
// trop lourd
await p.locator('#piece-identite input[type=file]').first().setInputFiles('/tmp/lourd.pdf'); await p.waitForTimeout(400);
console.log('trop lourd :', (await p.locator('#piece-identite [role=alert]').first().innerText()).slice(0, 110));
// bilan : alerte page 2
await p.locator('#piece-bilans button').first().click(); await p.waitForTimeout(400);
await p.locator('#piece-bilans input[type=file]').first().setInputFiles('/tmp/bilan.pdf'); await p.waitForTimeout(4200);
await p.screenshot({ path: 'docs/screens/pieces-3-a-corriger.png', fullPage: true });
console.log('bilan :', (await p.locator('#piece-bilans').innerText()).includes('page 2') ? 'alerte page 2 OK' : 'pas d’alerte');
// envoi bloqué : raison
console.log('envoi :', await p.getByRole('button', { name: /Envoyer ma demande/ }).first().getAttribute('aria-disabled'));
await p.getByRole('button', { name: 'Assistant Élan' }).click(); await p.waitForTimeout(500);
await p.getByRole('button', { name: 'Suis-je éligible ?' }).click(); await p.waitForTimeout(3500);
await p.screenshot({ path: 'docs/screens/pieces-4-assistant.png' });
await b.close(); console.log(errs.length ? 'ERREURS:\n' + errs.join('\n') : 'console propre');
