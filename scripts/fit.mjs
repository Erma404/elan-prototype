// Vérifie qu'un écran tient dans la fenêtre sans scroller de page. Échoue sinon.
import { chromium } from '@playwright/test';
const base = process.env.BASE || 'http://127.0.0.1:5180';
const answers = { projet: 'equipement', effectif: 3, anciennete: 4, montant: 80000, secteur: 'artisanat' };
const cas = [
  { nom: 'éligibilité, question 1', path: '/eligibilite', ls: {} },
  { nom: 'éligibilité, résultat', path: '/eligibilite', ls: { 'elan:demande:html': { answers, step: 5, financementId: null } } },
  { nom: 'pièces, premier accès', path: '/demande/pieces', ls: {} },
  { nom: 'récapitulatif', path: '/demande/recapitulatif', ls: {} },
  { nom: 'confirmation', path: '/demande/envoyee', ls: {} },
  { nom: 'Élan Pro, fiche', path: '/pro/dossiers/menuiserie', ls: {} },
  { nom: 'experte-comptable', path: '/expert/demo', ls: {} },
];
const b = await chromium.launch(); let ko = 0;
for (const [w, h] of [[1440, 900], [1280, 720]]) for (const c of cas) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((ls) => { for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, JSON.stringify(v)); }, c.ls);
  const p = await ctx.newPage(); await p.goto(base + c.path, { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
  const m = await p.evaluate(() => ({ doc: document.documentElement.scrollHeight, win: innerHeight }));
  let ok = m.doc <= m.win + 1
  let extra = ''
  if (c.path === '/demande/pieces') {
    const ids = ['kbis', 'identite', 'rib', 'statuts', 'bilans', 'liasse', 'attestation', 'devis', 'plan']
    for (const id of ids) {
      await p.getByRole('navigation', { name: 'Pièces de la demande' }).locator('button').nth(ids.indexOf(id)).click(); await p.waitForTimeout(150)
      const o = await p.evaluate(() => { const e = document.getElementById('piece-corps'); return e ? e.scrollHeight - e.clientHeight : -1 })
      if (o > 1) { ok = false; extra += ` [${id} défile de ${o} px]` }
    }
  }
  if (!ok) ko++;
  console.log(`${ok ? 'OK ' : 'KO '} ${w}×${h}  ${c.nom}  (document ${m.doc} px, fenêtre ${m.win} px)${extra}`);
  await ctx.close();
}
await b.close(); process.exit(ko ? 1 : 0);
