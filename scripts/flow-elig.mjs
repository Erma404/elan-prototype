import { chromium } from '@playwright/test';
const b = await chromium.launch(); const errs = [];
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(e.message));
await p.goto('http://127.0.0.1:5173/'); await p.evaluate(() => localStorage.clear());
await p.goto('http://127.0.0.1:5173/'); await p.getByRole('button', { name: 'Commencer' }).last().click();
await p.waitForURL('**/eligibilite'); await p.waitForTimeout(700);
await p.screenshot({ path: 'docs/screens/elig-1-question.png' });
await p.keyboard.press('1'); await p.waitForTimeout(700);        // équipement
await p.keyboard.press('2'); await p.waitForTimeout(700);        // 2 à 5 personnes
await p.screenshot({ path: 'docs/screens/elig-2-live.png' });
await p.keyboard.press('3'); await p.waitForTimeout(700);        // 2 à 5 ans
await p.getByRole('button', { name: 'Continuer' }).click(); await p.waitForTimeout(700); // 80 000 €
await p.screenshot({ path: 'docs/screens/elig-3-montant.png' });
await p.keyboard.press('1'); await p.waitForTimeout(900);        // artisanat
await p.screenshot({ path: 'docs/screens/elig-4-resultat.png', fullPage: true });
console.log('titre résultat :', await p.locator('h1').innerText());
// Cas sans correspondance
const p2 = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); p2.on('pageerror', e => errs.push(e.message));
await p2.goto('http://127.0.0.1:5173/eligibilite'); await p2.waitForTimeout(600);
await p2.keyboard.press('4'); await p2.waitForTimeout(500);  // export
await p2.keyboard.press('5'); await p2.waitForTimeout(500);  // 60 pers.
await p2.keyboard.press('1'); await p2.waitForTimeout(500);  // < 1 an
await p2.getByRole('button', { name: 'Continuer' }).click(); await p2.waitForTimeout(500);
await p2.keyboard.press('2'); await p2.waitForTimeout(900);
await p2.screenshot({ path: 'docs/screens/elig-5-aucun.png', fullPage: true });
console.log('titre vide :', await p2.locator('h1').innerText());
await b.close(); console.log(errs.length ? 'ERREURS:\n' + errs.join('\n') : 'console propre');
