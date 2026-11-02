// Écran 3 : fiche dossier dans Élan Pro. File de travail, complétude, critères, journal, relance.
import { $, $$, esc, btn, modale, tiroir, toast, badge, badgeStatut, anneau, progression } from './core.js'
import { icon } from './icons.js'
import { logo } from './shell.js'
import { monterDemo, boutonDemo, boutonProfil } from './demo.js'
import { demande, pieces, ui, evenements, relances, ajouterRelance, eur } from './state.js'
import { PIECES, compter, complete, pieceById } from './pieces.js'
import { evaluer, financements, libelleAnciennete, libelleEffectif, LIBELLES_PROJET, LIBELLES_SECTEUR } from './engine.js'
import { AUTRES } from './dossiers.js'
import { GENERALES } from './reponses.js'
import { chronologie, documentExemple } from './composants.js'

ui.set({ persona: 'nicolas' })
const id = location.pathname.split('/').filter(Boolean)[2] ?? 'argile'
const racine = $('#racine'); racine.className = 'relative min-h-dvh bg-bg-soft text-text lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden'; document.title = 'Fiche dossier · Élan Pro'
const QUESTIONS_IA = Object.fromEntries([...PIECES.flatMap((p) => p.suggestions), ...GENERALES].map((q) => [q.id, q.question]))
const jour = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
const heure = (iso) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
const PREUVE = { projet: 'devis', effectif: null, anciennete: 'kbis', montant: 'devis', secteur: 'kbis' }
let onglet = 'criteres', ouvert = null
const statutBadge = (s, n) => (s === 'pret' ? badge('Prêt à instruire', 'success') : s === 'corriger' ? badge(`${n} pièce${n > 1 ? 's' : ''} à corriger`, 'warning') : badge('Incomplet'))

function donnees() {
  const st = pieces.get(), { answers, financementId } = demande.get(), c = compter(st.etat)
  const aCorriger = PIECES.filter((p) => st.etat[p.id].statut === 'a-corriger'), manquantes = PIECES.filter((p) => !complete(st.etat[p.id].statut))
  const f = financements.find((x) => x.id === (financementId ?? 'pret-equipement-artisans')), ev = evaluer(f, answers)
  const complet = c.bloquantes.length === 0 && aCorriger.length === 0
  return { st, answers, c, aCorriger, manquantes, f, ev, complet, statut: complet ? 'pret' : aCorriger.length ? 'corriger' : 'incomplet' }
}
/** Message de relance. Jamais « il manque 0 pièce » : dossier complet → confirmation ; incomplet → pièces listées. */
function message(kind, d) {
  if (kind === 'confirmation') return 'Bonjour,\n\nVotre dossier est complet : toutes les pièces obligatoires sont là et vérifiées. Nous démarrons l’instruction, vous serez prévenue à chaque étape.\n\nCordialement, Nicolas B.'
  const liste = (l) => l.map((p) => `- ${p.nom}`).join('\n')
  const aC = d.aCorriger.map((p) => `- ${p.nom} : ${d.st.etat[p.id].message}`).join('\n')
  if (kind === 'correction') return `Bonjour,\n\nUne correction est nécessaire :\n${aC}\n\nVous pouvez remplacer le fichier directement dans votre demande.\n\nCordialement, Nicolas B.`
  const manque = d.manquantes.filter((p) => !d.aCorriger.includes(p))
  const n = manque.length
  return `Bonjour,\n\n${n > 0 ? `Pour instruire votre demande, il nous manque ${n === 1 ? 'une pièce' : `${n} pièces`} :\n${liste(manque)}\n` : ''}${d.aCorriger.length ? `\n${d.aCorriger.length === 1 ? 'Une pièce est à corriger' : 'Des pièces sont à corriger'} :\n${aC}\n` : ''}\nVous pouvez les déposer depuis votre demande, l’assistant vous aide à les trouver.\n\nCordialement, Nicolas B.`
}

function fileTravail(d) {
  const file = [{ id: 'argile', entreprise: 'Atelier Argile & Feu', financement: d.f.nom, faites: d.c.faites, total: d.c.total, statut: d.statut, corrections: d.aCorriger.length }, ...AUTRES].sort((a, b) => b.faites - a.faites)
  return `<nav aria-label="Dossiers à instruire" class="flex min-h-0 min-w-0 flex-col gap-2 overflow-y-auto"><div class="px-1"><h2 class="font-semibold tracking-tight">Dossiers à instruire</h2><p class="text-xs text-muted">Trié par complétude, du plus complet au moins complet.</p><p class="mt-1.5">${badge('Vague 2', 'outline')}</p></div><ul class="flex flex-col gap-2">${file.map((x) => `<li><a href="/pro/dossiers/${x.id}" ${x.id === id ? 'aria-current="page"' : ''} class="tr block rounded-md border p-3 ${x.id === id ? 'border-text bg-surface shadow-sm' : 'border-border bg-surface hover:border-border-strong'}"><p class="truncate font-semibold tracking-tight">${esc(x.entreprise)}</p><p class="truncate text-xs text-muted">${esc(x.financement)}</p><div class="mt-2 flex items-center gap-2"><div class="flex-1">${progression((x.faites / x.total) * 100, `${x.entreprise} : ${x.faites} pièces sur ${x.total}`, '!h-1.5')}</div><span class="tabular text-xs text-muted">${x.faites}/${x.total}</span></div><div class="mt-2">${statutBadge(x.statut, x.corrections)}</div></a></li>`).join('')}</ul></nav>`
}
function criteres(d) {
  return d.ev.criteres.map((cr) => {
    const preuveId = PREUVE[cr.id], preuve = preuveId ? pieceById(preuveId) : null, prouve = preuve ? complete(d.st.etat[preuve.id].statut) : false, a = d.answers
    const reponse = { projet: a.projet ? LIBELLES_PROJET[a.projet] : '—', effectif: a.effectif !== undefined ? libelleEffectif(a.effectif) : '—', anciennete: a.anciennete !== undefined ? libelleAnciennete(a.anciennete) : '—', montant: a.montant !== undefined ? eur(a.montant) : 'Non renseigné', secteur: a.secteur ? LIBELLES_SECTEUR[a.secteur] : '—' }[cr.id]
    const statut = cr.ok === false ? 'À vérifier' : prouve ? 'Vérifié par pièce' : cr.ok === null ? 'À vérifier' : 'Rempli'
    return { ...cr, preuve, reponse, statut }
  })
}
function journal(d) {
  const ev = evenements.get().items.filter((e) => e.name === 'aide_ia_utilisee').slice(0, 3)
  const items = [...relances.get().items.map((r) => ({ titre: { relance: 'Relance envoyée', correction: 'Correction demandée', instruction: 'Instruction démarrée', modification: 'Modification par l’entrepreneur', confirmation: 'Réception confirmée' }[r.type] ?? 'Action', detail: r.texte.split('\n').find((l) => l.trim() && !l.startsWith('Bonjour'))?.slice(0, 90), time: heure(r.date), etat: 'done' })),
    ...ev.map((e) => ({ titre: 'Échange avec l’assistant', detail: `« ${QUESTIONS_IA[e.detail] ?? 'Question'} »`, time: heure(new Date(e.at).toISOString()), etat: 'done' })),
    d.st.envoyeLe ? { titre: 'Demande envoyée', detail: d.st.numero, time: heure(d.st.envoyeLe), etat: 'done' } : { titre: 'Demande en cours de constitution', detail: 'Pas encore envoyée par l’entrepreneur.', etat: 'current' }]
  return chronologie(items)
}

function rendre() {
  const d = donnees(), autre = AUTRES.find((x) => x.id === id), st = d.st
  const entete = `<header class="border-b border-border bg-bg"><p id="bandeau" class="tabular bg-text px-4 py-1.5 text-center text-xs text-bg" ${ui.get().bandeauMasque ? 'hidden' : ''}>Prototype, données fictives</p><div class="mx-auto flex h-14 max-w-[96rem] items-center justify-between px-4 sm:px-8"><div class="flex items-center gap-6"><a href="/pro/dossiers/argile" aria-label="Élan Pro, dossiers" class="flex items-center">${logo('wordmark', 'h-6')}<span class="ml-2 rounded-sm border border-border-strong px-1.5 py-px text-xs font-semibold leading-4 text-muted">Pro</span></a><nav aria-label="Élan Pro"><a href="/pro/dossiers/argile" aria-current="page" class="text-sm font-semibold">Dossiers</a></nav></div><div class="flex items-center gap-2">${boutonDemo()}${boutonProfil()}</div></div></header>`
  let corps
  if (autre) corps = `${fileTravail(d)}<div class="self-start rounded-card border border-border bg-surface p-6"><p class="eyebrow">Dossier</p><h1 tabindex="-1" class="mt-3 text-2xl font-bold tracking-tighter outline-none">${esc(autre.entreprise)}</h1><p class="mt-1 text-muted">${esc(autre.financement)} · ${esc(autre.dirigeant)}</p><p class="mt-4 text-sm text-muted">Ouvrez le dossier d’Atelier Argile &amp; Feu pour la fiche complète.</p><a href="/pro/dossiers/argile" class="mt-5 inline-block font-semibold underline underline-offset-4">Ouvrir Atelier Argile &amp; Feu</a></div>`
  else {
    const cr = criteres(d), a = d.answers
    const actionRelance = d.complet ? `<button type="button" data-msg="confirmation" class="${btn('secondary')}">Confirmer la réception</button>` : `<button type="button" data-msg="relance" class="${btn('secondary')}">Relancer</button>`
    corps = `${fileTravail(d)}<div class="flex min-h-0 min-w-0 flex-col gap-4">
      <div class="rounded-card border border-border bg-surface p-5 shadow-sm"><div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3"><div class="min-w-0"><div class="flex flex-wrap items-center gap-3"><h1 tabindex="-1" class="text-2xl font-bold tracking-tighter outline-none">Atelier Argile &amp; Feu</h1>${statutBadge(d.statut, d.aCorriger.length)}</div><p class="mt-1 text-muted">${esc(d.f.nom)} · <span class="tabular">${a.montant !== undefined ? eur(a.montant) : 'montant non renseigné'}</span> · ${st.envoyeLe ? `envoyé le ${jour(st.envoyeLe)}` : 'pas encore envoyé'}</p><p class="mt-2 flex items-center gap-2 text-sm text-muted">${icon('clock')}<span class="tabular">Temps de relance estimé : environ 25 min (45 min sans Élan)</span><span class="text-xs text-subtle">ordre de grandeur à calibrer</span></p></div>
        <div class="flex flex-wrap items-center gap-2"><button type="button" data-instruire ${d.c.bloquantes.length ? 'aria-disabled="true" title="Des pièces obligatoires manquent : relancez d’abord l’entrepreneur."' : ''} class="${btn('primary')}">Instruire</button>${actionRelance}<button type="button" data-msg="correction" ${d.aCorriger.length ? '' : 'aria-disabled="true" title="Aucune pièce à corriger pour l’instant."'} class="${btn('ghost')}">Demander une correction</button></div></div></div>
      <div class="grid min-h-0 min-w-0 flex-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section aria-labelledby="completude" class="flex min-h-0 min-w-0 flex-col rounded-card border border-border bg-surface p-5 shadow-sm"><div class="flex items-center gap-4">${anneau((d.c.faites / d.c.total) * 100, 64, `${d.c.faites} pièces sur ${d.c.total}`, `<span class="text-base font-bold">${d.c.faites}/${d.c.total}</span>`)}<div><h2 id="completude" class="font-semibold tracking-tight">Complétude</h2><p class="text-sm text-muted">${d.c.bloquantes.length === 0 ? 'Toutes les pièces obligatoires sont là.' : `${d.c.bloquantes.length} pièce${d.c.bloquantes.length > 1 ? 's' : ''} obligatoire${d.c.bloquantes.length > 1 ? 's' : ''} manque${d.c.bloquantes.length > 1 ? 'nt' : ''}.`}</p></div></div>
          <ul class="mt-3 flex min-h-0 flex-col overflow-y-auto">${PIECES.map((p) => `<li><button type="button" data-apercu="${p.id}" class="tr flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 rounded-sm px-2 text-left hover:bg-bg-soft"><span class="truncate text-sm font-medium">${esc(p.nom)}</span>${badgeStatut(st.etat[p.id].statut)}</button>${st.etat[p.id].statut === 'a-corriger' ? `<p class="mx-2 mb-1 flex items-start gap-1.5 rounded-sm bg-warning-soft px-2.5 py-1.5 text-xs text-text">${icon('message-square-quote', 'mt-0.5 size-3.5 shrink-0')}Message envoyé à l’entrepreneur : « ${esc(st.etat[p.id].message)} »</p>` : ''}</li>`).join('')}</ul></section>
        <section class="flex min-h-0 min-w-0 flex-col rounded-card border border-border bg-surface p-5 shadow-sm"><div role="tablist" aria-label="Détail du dossier" class="flex gap-1 border-b border-border">${[['criteres', 'Critères d’éligibilité'], ['journal', 'Journal']].map(([k, l]) => `<button role="tab" type="button" id="t-${k}" data-onglet="${k}" aria-selected="${onglet === k}" aria-controls="v-${k}" tabindex="${onglet === k ? 0 : -1}" class="tr -mb-px min-h-11 cursor-pointer border-b-2 border-transparent px-4 text-base font-medium text-muted hover:text-text aria-selected:border-accent aria-selected:text-text">${l}</button>`).join('')}</div>
          <div id="v-criteres" role="tabpanel" aria-labelledby="t-criteres" ${onglet === 'criteres' ? '' : 'hidden'} class="min-h-0 min-w-0 flex-1 overflow-auto pt-3 text-sm"><div aria-hidden="true" class="grid min-w-[30rem] grid-cols-[1.2fr_1fr_1fr_1fr] gap-2 border-b border-border px-2 pb-2 text-muted">${['Critère', 'Réponse', 'Preuve', 'Statut'].map((h) => `<span>${h}</span>`).join('')}</div><ul aria-label="Critères d’éligibilité" class="min-w-[30rem]">${cr.map((x) => `<li><button type="button" data-critere="${x.id}" aria-expanded="${ouvert === x.id}" class="tr grid w-full cursor-pointer grid-cols-[1.2fr_1fr_1fr_1fr] items-center gap-2 rounded-sm px-2 py-2 text-left hover:bg-bg-soft"><span class="font-medium">${esc(x.label)}<span class="sr-only">. Réponse : ${esc(x.reponse)}. Preuve : ${esc(x.preuve?.nom ?? 'déclaré')}. Statut : ${x.statut}.</span></span><span aria-hidden="true" class="tabular">${esc(x.reponse)}</span><span aria-hidden="true" class="truncate text-muted">${esc(x.preuve?.nom ?? 'Déclaré')}</span><span aria-hidden="true">${badge(x.statut, x.statut === 'À vérifier' ? 'warning' : x.statut === 'Rempli' ? 'neutral' : 'success')}</span></button>${ouvert === x.id ? `<p class="mx-2 mb-1 rounded-sm bg-bg-soft px-3 py-2 text-muted">${esc(x.ok === false ? x.raison : x.preuve ? `Preuve attendue : ${x.preuve.nom}.` : 'Déclaré par l’entrepreneur, aucune pièce ne le prouve.')}</p>` : ''}</li>`).join('')}</ul></div>
          <div id="v-journal" role="tabpanel" aria-labelledby="t-journal" ${onglet === 'journal' ? '' : 'hidden'} class="min-h-0 flex-1 overflow-y-auto pt-4">${journal(d)}</div></section></div></div>`
  }
  racine.innerHTML = `<a href="#contenu" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>${entete}<main id="contenu" class="mx-auto w-full max-w-[96rem] px-4 py-4 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-hidden"><div class="grid h-full min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">${corps}</div></main>`
  monterDemo()
}

racine.addEventListener('click', (e) => {
  const t = e.target, d = donnees()
  const o = t.closest('[data-onglet]'); if (o) { onglet = o.dataset.onglet; return rendre() }
  const c = t.closest('[data-critere]'); if (c) { ouvert = ouvert === c.dataset.critere ? null : c.dataset.critere; return rendre() }
  const ap = t.closest('[data-apercu]'); if (ap) { const p = pieceById(ap.dataset.apercu), s = d.st.etat[p.id]; return tiroir({ titre: p.nom, description: s.fichier ? s.fichier.nom : 'Aucun fichier déposé', corps: `<div class="flex flex-col gap-4 p-5">${badgeStatut(s.statut)}${s.verifie ? `<p class="text-sm text-muted">${esc(s.verifie)}</p>` : ''}${s.message ? `<p class="rounded-md bg-warning-soft p-3 text-sm">Message envoyé à l’entrepreneur : « ${esc(s.message)} »</p>` : ''}${documentExemple(p)}</div>` }).ouvrir() }
  if (t.closest('[data-instruire]')) { if (d.c.bloquantes.length) return; ajouterRelance('instruction', 'Instruction démarrée par Nicolas B.'); toast({ title: 'Instruction démarrée', description: 'L’entrepreneur est prévenu.' }); return rendre() }
  const m = t.closest('[data-msg]'); if (m && m.getAttribute('aria-disabled') !== 'true') {
    const kind = m.dataset.msg; let texte = message(kind, d)
    const dlg = modale({ titre: kind === 'correction' ? 'Demander une correction' : kind === 'confirmation' ? 'Confirmer la réception' : 'Relancer l’entrepreneur', description: 'Message pré-rédigé, modifiable. Il part avec le lien vers la demande.', corps: `<div role="tablist" aria-label="Message" class="flex gap-1 border-b border-border"><button role="tab" type="button" data-m="modifier" aria-selected="true" class="tr -mb-px min-h-11 cursor-pointer border-b-2 border-transparent px-4 font-medium text-muted aria-selected:border-accent aria-selected:text-text">Modifier</button><button role="tab" type="button" data-m="apercu" aria-selected="false" class="tr -mb-px min-h-11 cursor-pointer border-b-2 border-transparent px-4 font-medium text-muted aria-selected:border-accent aria-selected:text-text">Aperçu</button></div><div class="pt-3"><label for="msg" class="sr-only">Message</label><textarea id="msg" rows="9" class="w-full rounded-sm border border-border-strong bg-surface p-3 text-sm leading-relaxed">${esc(texte)}</textarea><div id="apercu" hidden class="whitespace-pre-wrap rounded-md border border-border bg-bg-soft p-4 text-sm leading-relaxed"></div></div>`, pied: `<button type="button" data-fermer class="${btn('ghost')}">Annuler</button><button type="button" id="envoyer" class="${btn('primary')}">Envoyer</button>` }).ouvrir()
    dlg.addEventListener('click', (ev) => { const b = ev.target.closest('[data-m]'); if (!b) return; const ap = b.dataset.m === 'apercu'; dlg.querySelectorAll('[data-m]').forEach((x) => x.setAttribute('aria-selected', String(x === b))); dlg.querySelector('#msg').hidden = ap; dlg.querySelector('#apercu').hidden = !ap; dlg.querySelector('#apercu').textContent = dlg.querySelector('#msg').value })
    dlg.querySelector('#envoyer').onclick = () => { ajouterRelance(kind, dlg.querySelector('#msg').value); toast({ title: kind === 'correction' ? 'Correction demandée' : kind === 'confirmation' ? 'Réception confirmée' : 'Relance envoyée', description: 'Message transmis à l’entrepreneur.' }); dlg.close(); rendre() }
  }
})
let cle = ''; const emp = () => JSON.stringify([pieces.get(), demande.get().answers, relances.get(), evenements.get().items.length])
for (const s of [pieces, demande, relances, evenements, ui]) s.sub(() => { const k = emp(); if (k !== cle) { cle = k; rendre() } })
cle = emp(); rendre(); setTimeout(() => $('h1')?.focus({ preventScroll: true }), 80)
