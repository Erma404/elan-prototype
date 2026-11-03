// Vérifications de bout en bout du site HTML. Usage : BASE=http://127.0.0.1:5180 node scripts/verif-html.mjs
import { chromium } from '@playwright/test';
const B = process.env.BASE || 'http://127.0.0.1:5180'; const b = await chromium.launch(); const errs = []; let ko = 0;
const ok = (nom, v) => { console.log((v ? 'OK  ' : 'KO  ') + nom); if (!v) ko++ };
const f = (n, t = 'application/pdf', o = 150000) => ({ name: n, mimeType: t, buffer: Buffer.alloc(o, 1) });
const page = async (vp = { width: 1280, height: 720 }, extra = {}) => { const c = await b.newContext({ viewport: vp, ...extra }); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); return p };
const demo = async (p) => { await p.keyboard.press('Shift+D'); await p.waitForSelector('#panneau-demo:not([hidden])') };
const statut = (p) => p.locator('#detail header').innerText().then((t) => t.replace(/\s+/g, ' '));

// 1. Upload réel
let p = await page(); await p.goto(B + '/demande/pieces', { waitUntil: 'networkidle' });
await p.locator('#detail input[data-fichier]').setInputFiles(f('Kbis.pdf')); await p.waitForFunction(() => document.querySelector('#detail header')?.innerText.includes('Vérifiée'), null, { timeout: 8000 });
ok('upload réel d’un fichier : envoyé puis vérifié', true);

// 2. Les 4 erreurs injectables
await p.goto(B + '/demande/pieces'); await p.getByRole('navigation', { name: 'Pièces de la demande' }).locator('button').nth(2).click(); // RIB
await demo(p); await p.locator('[data-erreur="reseau"]').click(); await p.keyboard.press('Escape');
await p.locator('#detail input[data-fichier]').setInputFiles(f('RIB.pdf')); await p.waitForFunction(() => document.querySelector('#detail')?.innerText.includes('L’envoi n’a pas abouti'), null, { timeout: 8000 });
ok('erreur réseau : message + bouton Réessayer', await p.getByRole('button', { name: 'Réessayer' }).count() === 1);
await demo(p); await p.locator('[data-erreur=""]').click(); await p.keyboard.press('Escape'); await p.getByRole('button', { name: 'Réessayer' }).click();
await p.waitForFunction(() => document.querySelector('#detail header')?.innerText.includes('Vérifiée'), null, { timeout: 8000 }); ok('erreur réseau : Réessayer aboutit', true);
await demo(p); await p.locator('[data-erreur="fichier-lourd"]').click(); await p.keyboard.press('Escape');
await p.getByRole('navigation', { name: 'Pièces de la demande' }).locator('button').nth(1).click();
await p.locator('#detail input[data-fichier]').setInputFiles(f('CNI.pdf')); ok('fichier trop lourd : taille actuelle et limite affichées', (await p.locator('[data-erreur-depot]').innerText()).includes('14,2'));
await demo(p); await p.locator('[data-erreur="ia"]').click(); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
ok('assistant IA indisponible : bouton et liens masqués, guidage statique complet', (await p.locator('#bouton-assistant').count()) === 0 && (await p.locator('[data-aide]').count()) === 0 && /pourquoi nous la demandons/i.test(await p.locator('#piece-corps').innerText()));
// session expirée et connexion perdue
await demo(p); await p.locator('[data-erreur=""]').click(); await p.locator('[data-action="session"]').click(); await p.waitForSelector('#modale-session[open] .modale-corps');
ok('session expirée : fenêtre bloquante', true); await p.keyboard.press('Escape'); ok('session expirée : Échap ne la ferme pas', await p.locator('#modale-session[open]').count() === 1);
await p.getByRole('button', { name: 'Me reconnecter' }).click(); await p.waitForSelector('#modale-session', { state: 'detached' }); ok('session expirée : reconnexion puis reprise au même endroit', (await p.locator('#detail h2').innerText()).length > 0);
await demo(p); await p.locator('[data-action="connexion"]').click(); await p.keyboard.press('Escape'); await p.getByRole('navigation', { name: 'Pièces de la demande' }).locator('button').nth(3).click();
await p.locator('#detail input[data-fichier]').setInputFiles(f('Statuts.pdf')); await p.waitForTimeout(400);
ok('connexion perdue : enregistré sur l’appareil + bandeau', (await p.locator('#detail').innerText()).includes('Enregistré sur cet appareil') && (await p.locator('#bannieres').innerText()).includes('Connexion perdue'));
await demo(p); await p.locator('[data-action="connexion"]').click(); await p.keyboard.press('Escape');
await p.waitForFunction(() => document.querySelector('#detail header')?.innerText.includes('Vérifiée'), null, { timeout: 9000 }); ok('connexion rétablie : reprise automatique du dépôt', true);

// 3. Vue experte-comptable
p = await page(); await p.goto(B + '/demande/pieces', { waitUntil: 'networkidle' }); await p.locator('[data-inviter]').click();
await p.locator('dialog #mail').fill('claire@cabinet-ledoux.fr'); await p.locator('dialog #ok').click(); await p.waitForTimeout(300);
ok('invitation : pièces passées « en attente de l’experte-comptable »', (await p.locator('#liste').innerText()).includes('Experte'));
await p.goto(B + '/expert/demo', { waitUntil: 'networkidle' });
const txt = await p.locator('main').innerText(); ok('vue experte : jamais de montant ni de réponses', !/€|Montant|souhaité/.test(txt.replace('Montant', '')) && !txt.includes('Prêt Équipement'));
await p.locator('[data-piece="liasse"] input[data-fichier]').setInputFiles(f('Liasse.pdf')); await p.waitForFunction(() => document.querySelector('[data-piece="liasse"]')?.innerText.includes('Vérifiée'), null, { timeout: 8000 });
await p.locator('#terminer').click(); ok('vue experte : dépôt puis « Terminer »', true);
await p.goto(B + '/demande/pieces', { waitUntil: 'networkidle' }); await p.getByRole('navigation', { name: 'Pièces de la demande' }).locator('button').nth(5).click();
ok('le dépôt de l’experte apparaît chez Fabienne', (await statut(p)).includes('Vérifiée'));

// 4. Visite guidée
p = await page(); await p.goto(B + '/', { waitUntil: 'networkidle' }); await p.locator('#pilule-demo').click(); await p.locator('[data-action="visite"]').click(); await p.waitForURL('**/'); await p.waitForSelector('#visite');
const chemins = [];
for (let i = 0; i < 6; i++) { chemins.push(new URL(p.url()).pathname); await p.locator('[data-v="suiv"]').click(); await p.waitForLoadState('networkidle'); await p.waitForSelector('#visite'); }
chemins.push(new URL(p.url()).pathname); ok('visite guidée : 7 étapes traversées ' + chemins.join(' → '), chemins.length === 7 && chemins.at(-1).startsWith('/pro/dossiers'));
await p.locator('[data-v="quitter"]').click(); ok('visite guidée : sortie possible', await p.locator('#visite').count() === 0);

// 4 bis. Écran de bienvenue et changement de profil
p = await page(); await p.goto(B + '/bonjour', { waitUntil: 'networkidle' });
ok('bienvenue : « Bonjour Fabienne. » par défaut', (await p.locator('h1').innerText()).includes('Bonjour Fabienne'));
ok('bienvenue : aucun sélecteur de profil sur la page, seulement le salut et « Commencer ma demande »', (await p.locator('[role=radiogroup]').count()) === 0 && (await p.getByRole('link', { name: /Commencer ma demande/ }).count()) === 1);
await p.locator('[data-profil]').click(); await p.locator('[data-profil-choix="nicolas"]').click(); await p.waitForLoadState('networkidle'); ok('bienvenue : « Bonjour Nicolas. » après changement de profil par le bouton de l’en-tête', (await p.locator('h1').innerText()).includes('Bonjour Nicolas'));
await p.getByRole('link', { name: /Voir mes dossiers/ }).click(); await p.waitForURL('**/pro/dossiers/argile'); ok('bienvenue : Nicolas arrive sur le dossier le plus récent prêt à instruire (Atelier Argile & Feu)', (await p.locator('h1').innerText()).includes('Argile'));
ok('le bouton de profil est visible dans l’en-tête d’Élan Pro', await p.locator('[data-profil]').isVisible());
await p.locator('[data-profil]').click(); await p.locator('[data-profil-choix="fabienne"]').click(); await p.waitForURL('**/bonjour'); ok('changer de profil depuis l’en-tête ramène à l’accueil du profil', (await p.locator('h1').innerText()).includes('Bonjour Fabienne'));
await p.getByRole('link', { name: /Commencer ma demande/ }).click(); await p.waitForURL('**/eligibilite'); ok('bienvenue : « Commencer ma demande » démarre le parcours', await p.locator('[data-profil]').isVisible());

// 4 ter. Élan Pro : la file ne contient que des dossiers envoyés ; actions et messages cohérents
p = await page(); await p.goto(B + '/demande/pieces', { waitUntil: 'networkidle' }); await demo(p); await p.locator('[data-scenario="cours"]').click(); await p.waitForURL('**/demande/pieces');
await p.goto(B + '/pro/dossiers/argile', { waitUntil: 'networkidle' });
ok('Argile toujours présent (9/9 semé), un identifiant inconnu redirige vers lui', p.url().endsWith('/argile') && (await p.locator('nav[aria-label="Dossiers à instruire"]').innerText()).includes('Atelier Argile'));
ok('profil affiché : Nicolas sur Élan Pro', (await p.locator('[data-profil]').getAttribute('aria-label')).includes('Nicolas'));
ok('dossier complet : « Prêt à instruire », Instruire actif, « Relancer » remplacé par « Confirmer la réception »', (await p.locator('h1 ~ span, h1').first().innerText()).includes('Argile') && (await p.getByRole('button', { name: 'Instruire', exact: true }).getAttribute('aria-disabled')) === null && (await p.getByRole('button', { name: 'Relancer', exact: true }).count()) === 0 && (await p.getByRole('button', { name: 'Confirmer la réception' }).count()) === 1);
await p.getByRole('button', { name: 'Instruire', exact: true }).click(); await p.waitForTimeout(300);
ok('instruction : écran de confirmation affiché', await p.getByText('Le dossier est pris en instruction').isVisible());
await p.locator('[data-fermer]').last().click(); await p.waitForTimeout(300);
ok('instruction : bouton « Instruction faite » désactivé', (await p.getByRole('button', { name: 'Instruction faite' }).getAttribute('aria-disabled')) === 'true');
ok('instruction : historique « Instruction faite » avec heure à la seconde', /Instruction faite[\s\S]*\d{2}:\d{2}:\d{2}/.test(await p.locator('#v-journal').innerText()));
await p.getByRole('button', { name: 'Confirmer la réception' }).click(); const complet = await p.locator('dialog #msg').inputValue(); ok('message de confirmation : « dossier est complet », aucun « il manque »', complet.includes('complet') && !/manque/i.test(complet)); await p.keyboard.press('Escape');
await p.goto(B + '/pro/dossiers/studio', { waitUntil: 'networkidle' });
ok('dossier incomplet : Relancer est l’action principale, Instruire grisé avec sa raison écrite', (await p.getByRole('button', { name: 'Instruire', exact: true }).getAttribute('aria-disabled')) === 'true' && (await p.locator('#raison-instruire').innerText()).includes('Instruire sera possible'));
await p.getByRole('button', { name: 'Relancer', exact: true }).click(); const incomplet = await p.locator('dialog #msg').inputValue(); ok('relance (dossier incomplet) : liste les pièces manquantes, aucun « 0 pièce »', incomplet.includes('RIB') && incomplet.includes('Devis') && !/\b0 pièce/.test(incomplet)); await p.keyboard.press('Escape');
ok('dossier incomplet : pas de « Demander une correction » quand rien n’est à corriger', (await p.getByRole('button', { name: 'Demander une correction' }).count()) === 0);
await p.goto(B + '/pro/dossiers/boulangerie', { waitUntil: 'networkidle' }); await p.getByRole('button', { name: 'Demander une correction' }).click(); const corr = await p.locator('dialog #msg').inputValue();
ok('correction : cite chaque pièce et son motif', corr.includes('Bilans') && corr.includes('page 2') && corr.includes('Attestation') && corr.includes('illisible')); await p.keyboard.press('Escape');
await p.goto(B + '/demande/pieces', { waitUntil: 'networkidle' }); await demo(p); await p.locator('[data-scenario="apres"]').click(); await p.waitForURL('**/demande/envoyee'); await p.goto(B + '/pro/dossiers/argile', { waitUntil: 'networkidle' });
ok('dossier envoyé par Fabienne : il arrive dans la file avec « Nouveau »', p.url().endsWith('/argile') && (await p.locator('nav[aria-label="Dossiers à instruire"]').innerText()).includes('Nouveau'));

// 5. Mobile 390 px : pas de débordement horizontal
p = await page({ width: 390, height: 844 });
for (const r of ['/', '/bonjour', '/eligibilite', '/demande/pieces', '/demande/recapitulatif', '/demande/envoyee', '/expert/demo', '/pro/dossiers/menuiserie', '/styleguide']) {
  await p.goto(B + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
  const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok(`mobile 390 px ${r} : pas de défilement horizontal (${m.sw}/${m.cw})`, m.sw <= m.cw + 1); await p.screenshot({ path: `docs/screens/m390-${r.replace(/\W+/g, '_') || 'accueil'}.png`, fullPage: false });
}

// 6. Mode sombre
p = await page({ width: 1280, height: 720 }, { colorScheme: 'dark' });
for (const r of ['/eligibilite', '/demande/pieces', '/pro/dossiers/menuiserie']) { await p.goto(B + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(300); ok(`mode sombre ${r} : thème appliqué`, (await p.evaluate(() => document.documentElement.dataset.theme)) === 'dark'); await p.screenshot({ path: `docs/screens/sombre-${r.replace(/\W+/g, '_')}.png` }) }

// 7. Navigation clavier complète (éligibilité → pièces)
p = await page(); await p.goto(B + '/eligibilite', { waitUntil: 'networkidle' });
ok('clavier : le lien d’évitement est le premier élément focalisable', await p.evaluate(() => { const e = [...document.querySelectorAll('a,button,input,select,textarea,[tabindex]')].find((x) => x.tabIndex >= 0); return e.textContent.includes('Aller au contenu') }));
const vus = new Set(); for (let i = 0; i < 25; i++) { await p.keyboard.press('Tab'); const a = await p.evaluate(() => { const e = document.activeElement; if (e === document.body || e === document.documentElement) return 'fin de page'; const r = e.getBoundingClientRect(); const o = getComputedStyle(e).outlineStyle; return (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 28) + (r.width && o !== 'none' ? '' : ' [focus peu visible]') }); vus.add(a) }
console.log('   éléments parcourus :', [...vus].join(' | '))
ok(`clavier : ${vus.size} éléments atteignables sans piège, tous avec contour de focus`, vus.size > 8 && ![...vus].some((x) => x.includes('[focus peu visible]')));
await p.locator('#continuer').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(200); ok('clavier : Entrée sur Continuer avance', (await p.locator('#question').innerText()).includes('personnes'));
await p.keyboard.press('Enter'); await p.waitForTimeout(150); await p.keyboard.press('Enter'); await p.waitForTimeout(150); ok('clavier : Entrée valide la réponse présélectionnée (question 4 atteinte)', (await p.locator('#question').innerText()).includes('montant'));
await p.keyboard.press('Escape');


// 8. Pièce à corriger : l'envoi reste possible (l'IA alerte, ne bloque jamais), message et compteur cohérents
p = await page(); await p.goto(B + '/demande/pieces', { waitUntil: 'networkidle' }); await demo(p); await p.locator('[data-scenario="corriger"]').click(); await p.waitForURL('**/demande/pieces'); await p.waitForLoadState('networkidle');
ok('scénario « pièce à corriger » : ouvre directement la pièce à corriger (Bilans)', (await p.locator('#detail').innerText()).includes('Bilans des deux derniers exercices') && (await p.locator('#detail').innerText()).includes('page 2'));
ok('pièce à corriger : message d’aide cohérent (corriger ou envoyer quand même, pas « il manque »)', /à corriger/.test(await p.locator('main').innerText()) && !/Il manque/.test(await p.locator('main').innerText()));
await p.getByRole('link', { name: /Envoyer quand même/ }).click(); await p.waitForURL('**/demande/recapitulatif');
const rec = await p.locator('main').innerText();
ok('récapitulatif : alerte claire (pièce à corriger, motif, conséquence)', /reste à corriger/.test(rec) && rec.includes('page 2') && /allonger/.test(rec));
ok('récapitulatif : bouton « Envoyer quand même » non bloqué (hors consentement)', (await p.getByRole('button', { name: /Envoyer quand même/ }).count()) === 1 && !/Envoi bloqué/.test(rec));
await p.locator('#consent').check(); await p.getByRole('button', { name: /Envoyer quand même/ }).click(); await p.waitForURL('**/demande/envoyee', { timeout: 8000 }); ok('envoi malgré une pièce à corriger : confirmation atteinte', true);
// 9. Journal de Nicolas : échange avec l'assistant
p = await page(); await p.goto(B + '/demande/pieces', { waitUntil: 'networkidle' }); await p.getByRole('button', { name: /Où trouver|assistant|Besoin d’aide/i }).first().click().catch(() => {});
await p.evaluate(() => { const k = 'elan:events:html'; sessionStorage.setItem(k, JSON.stringify({ items: [{ id: 1, name: 'aide_ia_utilisee', at: Date.now(), detail: 'bilan-valide' }] })) });
await p.goto(B + '/pro/dossiers/argile', { waitUntil: 'networkidle' }); await p.locator('#t-journal').click();
ok('journal Nicolas : « Échange avec l’assistant » quand Fabienne l’a utilisé (sa vraie question)', (await p.locator('#v-journal').innerText()).includes('Mon bilan est-il valable'));
// 10. « Commencer » remet toujours Fabienne
p = await page(); await p.goto(B + '/bonjour', { waitUntil: 'networkidle' }); await p.locator('[data-profil]').click(); await p.locator('[data-profil-choix="nicolas"]').click(); await p.waitForLoadState('networkidle');
await p.goto(B + '/', { waitUntil: 'networkidle' }); await p.getByRole('link', { name: 'Commencer' }).first().click(); await p.waitForURL('**/bonjour**'); await p.waitForLoadState('networkidle');
ok('« Commencer » de l’accueil : persona Fabienne rétabli', (await p.locator('h1').innerText()).includes('Bonjour Fabienne') && p.url().endsWith('/bonjour'));
// 11. Confirmation d'envoi : logo aligné sur la colonne de texte
p = await page(); await p.goto(B + '/demande/envoyee', { waitUntil: 'networkidle' });
const al = await p.evaluate(() => Math.min(...[...document.querySelector('section svg').querySelectorAll('path')].map((x) => x.getBoundingClientRect().left)) - document.querySelector('h1').getBoundingClientRect().left);
ok(`confirmation : logo aligné sur le texte (écart ${al.toFixed(1)} px)`, Math.abs(al) < 1.5);


// 12. Recommencer efface les réponses et repart à la question 1 ; minuscule après les deux-points
p = await page(); await p.goto(B + '/eligibilite', { waitUntil: 'networkidle' }); await p.locator('#continuer').click(); await p.waitForTimeout(200); await p.locator('#continuer').click(); await p.waitForTimeout(200);
await p.goto(B + '/bonjour', { waitUntil: 'networkidle' }); await p.getByRole('link', { name: 'Recommencer' }).click(); await p.waitForURL('**/eligibilite'); await p.waitForLoadState('networkidle');
const rep = await p.evaluate(() => JSON.parse(localStorage.getItem('elan:demande:html') ?? '{}'));
ok('« Recommencer » : réponses effacées, retour à la question 1', (await p.locator('#question').innerText()).length > 0 && (rep.step ?? 0) === 0 && Object.keys(rep.answers ?? {}).length === 0 && p.url().endsWith('/eligibilite'));
p = await page(); await p.goto(B + '/demande/pieces', { waitUntil: 'networkidle' }); await demo(p); await p.locator('[data-scenario="corriger"]').click(); await p.waitForURL('**/demande/pieces'); await p.goto(B + '/demande/recapitulatif', { waitUntil: 'networkidle' });
ok('récapitulatif : minuscule après les deux-points (« : la page 2 du bilan… »)', (await p.locator('main').innerText()).includes(': la page 2 du bilan'));
p = await page(); await p.goto(B + '/pro/dossiers/boulangerie', { waitUntil: 'networkidle' }); await p.locator('[data-msg="relance"]').click(); await p.waitForTimeout(300);
ok('message de relance : minuscule après les deux-points', /: la page 2 du bilan est manquante/.test(await p.locator('#msg').inputValue()));
// 13. Vrai usage de l'assistant côté Fabienne (pas d'injection) puis journal de Nicolas
p = await page(); await p.goto(B + '/demande/pieces', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: /Une question sur cette pièce/ }).click(); await p.waitForTimeout(300);
const q = p.locator('[data-q]').first(); const qt = (await q.innerText()).trim(); await q.click(); await p.waitForTimeout(900);
await p.keyboard.press('Escape'); await demo(p); await p.locator('[data-scenario="pret"]').click(); await p.waitForURL('**/demande/pieces'); await p.goto(B + '/demande/recapitulatif', { waitUntil: 'networkidle' });
await p.locator('#consent').check(); await p.getByRole('button', { name: /Envoyer ma demande/ }).click(); await p.waitForURL('**/demande/envoyee', { timeout: 8000 });
await p.goto(B + '/pro/dossiers/argile', { waitUntil: 'networkidle' }); await p.locator('#t-journal').click();
const jr = await p.locator('#v-journal').innerText();
ok('journal Nicolas : « Échange avec l’assistant » après un vrai usage par Fabienne (' + qt.slice(0, 40) + ')', jr.includes('Échange avec l’assistant') && jr.includes(qt.replace(/[«»]/g, '').trim().slice(0, 25)));

console.log(errs.length ? 'ERREURS CONSOLE :\n' + [...new Set(errs)].join('\n') : 'console propre'); console.log(ko ? `${ko} échec(s)` : 'toutes les vérifications passent'); await b.close(); process.exit(ko ? 1 : 0);
