// Écran 3 : fiche dossier dans Élan Pro. La file ne contient que des dossiers ENVOYÉS ; chaque dossier a sa fiche complète.
import { $, esc, btn, modale, tiroir, toast, badge, badgeStatut, anneau, progression } from './core.js'
import { icon } from './icons.js'
import { logo } from './shell.js'
import { monterDemo, boutonDemo, boutonProfil } from './demo.js'
import { demande, pieces, ui, evenements, relances, ajouterRelance, eur } from './state.js'
import { PIECES, compter, complete, pieceById } from './pieces.js'
import { evaluer, financements, libelleAnciennete, libelleEffectif, LIBELLES_PROJET, LIBELLES_SECTEUR } from './engine.js'
import { GENERALES } from './reponses.js'
import { chronologie, documentExemple } from './composants.js'

ui.set({ persona: 'nicolas' })
const racine = $('#racine'); racine.className = 'relative min-h-dvh bg-bg-soft text-text lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden'; document.title = 'Fiche dossier · Élan Pro'
const QUESTIONS_IA = Object.fromEntries([...PIECES.flatMap((p) => p.suggestions), ...GENERALES].map((q) => [q.id, q.question]))
const jour = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
const heure = (iso) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
const PREUVE = { projet: 'devis', effectif: null, anciennete: 'kbis', montant: 'devis', secteur: 'kbis' }
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1)
const heureS = (iso) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' })
const instruit = (d) => relances.get().items.some((r) => (r.dossier ?? 'argile') === d.id && r.type === 'instruction')
let onglet = 'criteres', ouvert = null

// ---------- Dossiers : celui de Fabienne (en direct, une fois envoyé) et des dossiers fictifs reçus ----------
const etatMock = ({ corriger = {}, manquantes = [] }) => Object.fromEntries(PIECES.map((p, i) => {
  if (corriger[p.id]) return [p.id, { statut: 'a-corriger', fichier: { nom: `${p.id}.pdf`, taille: 900000 }, message: corriger[p.id] }]
  if (manquantes.includes(p.id)) return [p.id, { statut: 'a-fournir' }]
  return [p.id, { statut: 'verifiee', fichier: { nom: `${p.id}-${p.nom.split(' ')[0].toLowerCase()}.pdf`, taille: 350000 + i * 90000 }, verifie: 'Document lisible, 2 pages' }]
}))
const MOCKS = [
  { id: 'menuiserie', entreprise: 'Menuiserie Verdier', dirigeant: 'Paul V.', financementId: 'garantie-croissance-tpe', answers: { projet: 'equipement', effectif: 8, anciennete: 8, montant: 45000, secteur: 'artisanat' }, envoyeLe: '2026-10-29T10:12:00', numero: 'ELAN-2026-04790', etat: etatMock({}) },
  { id: 'boulangerie', entreprise: 'Boulangerie des Halles', dirigeant: 'Inès B.', financementId: 'pret-equipement-artisans', answers: { projet: 'equipement', effectif: 8, anciennete: 8, montant: 38000, secteur: 'artisanat' }, envoyeLe: '2026-10-30T15:40:00', numero: 'ELAN-2026-04803', etat: etatMock({ corriger: { bilans: 'La page 2 du bilan est manquante.', attestation: 'Document illisible, merci de le renvoyer.' } }) },
  { id: 'studio', entreprise: 'Studio Lumen', dirigeant: 'Karim D.', financementId: 'avance-innovation', answers: { projet: 'innovation', effectif: 8, anciennete: 1.5, montant: 60000, secteur: 'services' }, envoyeLe: '2026-11-01T09:05:00', numero: 'ELAN-2026-04811', etat: etatMock({ manquantes: ['rib', 'devis', 'statuts', 'plan'] }) },
]
// Dossier d’Atelier Argile & Feu : toujours présent, complet (9/9). Il ne dépend pas de la session de Fabienne ;
// si elle a réellement envoyé sa demande, la fiche reflète alors ses vraies réponses et ses vraies pièces.
const ARGILE = { id: 'argile', entreprise: 'Atelier Argile & Feu', dirigeant: 'Fabienne M.', financementId: 'pret-equipement-artisans', answers: { projet: 'equipement', effectif: 3, anciennete: 4, montant: 42000, secteur: 'artisanat' }, envoyeLe: '2026-11-02T14:40:00', numero: 'ELAN-2026-04817', etat: etatMock({}), nouveau: true }
function dossiers() {
  const st = pieces.get(), live = st.envoyeLe ? { ...ARGILE, financementId: demande.get().financementId ?? ARGILE.financementId, answers: { ...ARGILE.answers, ...demande.get().answers }, envoyeLe: st.envoyeLe, numero: st.numero ?? ARGILE.numero, etat: st.etat, live: true } : ARGILE
  return [live, ...MOCKS].map((d) => {
    const c = compter(d.etat), aCorriger = PIECES.filter((p) => d.etat[p.id].statut === 'a-corriger'), manque = c.bloquantes.filter((p) => d.etat[p.id].statut !== 'a-corriger')
    return { ...d, f: financements.find((x) => x.id === d.financementId), c, aCorriger, manque, statut: c.bloquantes.length === 0 ? 'pret' : aCorriger.length ? 'corriger' : 'incomplet' }
  }).sort((a, b) => b.c.faites - a.c.faites || new Date(b.envoyeLe) - new Date(a.envoyeLe))
}
const statutBadge = (d) => (d.statut === 'pret' ? badge('Prêt à instruire', 'success') : d.statut === 'corriger' ? badge(`${d.aCorriger.length} pièce${d.aCorriger.length > 1 ? 's' : ''} à corriger`, 'warning') : badge(`${d.manque.length} pièce${d.manque.length > 1 ? 's' : ''} à fournir`))

// Un dossier absent de la file (non envoyé, inconnu) ramène au premier dossier de la file.
const idUrl = location.pathname.split('/').filter(Boolean)[2]
{ const file = dossiers(); if (!file.some((d) => d.id === idUrl)) { location.replace(`/pro/dossiers/${file[0].id}`) } }
const courant = () => dossiers().find((d) => d.id === idUrl) ?? dossiers()[0]

/** Messages de Nicolas. Jamais « il manque 0 pièce » : dossier complet → confirmation ; incomplet → pièces listées. */
function message(kind, d) {
  const liste = (l) => l.map((p) => `- ${p.nom}`).join('\n'), aC = d.aCorriger.map((p) => `- ${p.nom} : ${minus(d.etat[p.id].message)}`).join('\n'), n = d.manque.length
  if (kind === 'confirmation') return 'Bonjour,\n\nVotre dossier est complet : toutes les pièces obligatoires sont là et vérifiées. Nous démarrons l’instruction, vous serez prévenu·e à chaque étape.\n\nCordialement, Nicolas B.'
  if (kind === 'correction') return `Bonjour,\n\nUne correction est nécessaire :\n${aC}\n\nVous pouvez remplacer le fichier directement dans votre demande.\n\nCordialement, Nicolas B.`
  return `Bonjour,\n\n${n > 0 ? `Pour instruire votre demande, il nous manque ${n === 1 ? 'une pièce' : `${n} pièces`} :\n${liste(d.manque)}\n` : ''}${d.aCorriger.length ? `\n${d.aCorriger.length === 1 ? 'Une pièce est à corriger' : 'Des pièces sont à corriger'} :\n${aC}\n` : ''}\nVous pouvez les déposer depuis votre demande, l’assistant vous aide à les trouver.\n\nCordialement, Nicolas B.`
}

function fileTravail(file) {
  return `<nav aria-label="Dossiers à instruire" class="flex min-h-0 min-w-0 flex-col gap-2 overflow-y-auto"><div class="px-1"><h2 class="font-semibold tracking-tight">Dossiers à instruire</h2><p class="text-xs text-muted">Demandes reçues, triées par complétude.</p></div><ul class="flex flex-col gap-2 pb-1">${file.map((x) => `<li><a href="/pro/dossiers/${x.id}" ${x.id === idUrl ? 'aria-current="page"' : ''} class="tr block rounded-md border p-3 ${x.id === idUrl ? 'border-text bg-surface shadow-sm' : 'border-border bg-surface hover:border-border-strong'}"><p class="break-words font-semibold tracking-tight">${esc(x.entreprise)}</p><p class="break-words text-xs text-muted">${esc(x.f.nom)}</p><div class="mt-2 flex items-center gap-2"><div class="flex-1">${progression((x.c.faites / x.c.total) * 100, `${x.entreprise} : ${x.c.faites} pièces sur ${x.c.total}`, '!h-1.5')}</div><span class="tabular text-xs text-muted">${x.c.faites}/${x.c.total}</span></div><div class="mt-2 flex flex-wrap items-center gap-2">${statutBadge(x)}${x.nouveau ? badge('Nouveau', 'accent') : ''}</div></a></li>`).join('')}</ul></nav>`
}
function criteres(d) {
  const ev = evaluer(d.f, d.answers), a = d.answers
  return ev.criteres.map((cr) => {
    const preuveId = PREUVE[cr.id], preuve = preuveId ? pieceById(preuveId) : null, prouve = preuve ? complete(d.etat[preuve.id].statut) : false
    const reponse = { projet: a.projet ? LIBELLES_PROJET[a.projet] : '—', effectif: a.effectif !== undefined ? libelleEffectif(a.effectif) : '—', anciennete: a.anciennete !== undefined ? libelleAnciennete(a.anciennete) : '—', montant: a.montant !== undefined ? eur(a.montant) : 'Non renseigné', secteur: a.secteur ? LIBELLES_SECTEUR[a.secteur] : '—' }[cr.id]
    return { ...cr, preuve, reponse, statut: cr.ok === false ? 'À vérifier' : prouve ? 'Vérifié par pièce' : cr.ok === null ? 'À vérifier' : 'Rempli' }
  })
}
function journal(d) {
  const plus = (iso, min) => new Date(new Date(iso).getTime() + min * 60000).toISOString()
  const relancesD = relances.get().items.filter((r) => (r.dossier ?? 'argile') === d.id)
  const vus = d.id === 'argile' ? evenements.get().items.filter((e) => e.name === 'aide_ia_utilisee').slice(0, 5).map((e) => ({ detail: `« ${QUESTIONS_IA[e.detail] ?? 'Question'} »`, iso: new Date(e.at).toISOString() })) : []
  const echanges = vus.length ? vus : d.id === 'argile' ? [{ detail: '« Où trouver mon dernier bilan ? » Réponse appuyée sur la liste des pièces du financeur.', iso: '2026-11-02T13:52:00' }] : []
  const nonVides = d.c.faites > 0, tous = d.statut === 'pret'
  const base = [
    ...(tous && !relancesD.length ? [{ titre: 'Aucune relance nécessaire', detail: 'Toutes les pièces obligatoires étaient présentes à l’envoi.', iso: plus(d.envoyeLe, 3) }] : []),
    { titre: 'Critères d’éligibilité contrôlés', detail: `${d.f.nom} : réponses comparées aux conditions du financeur.`, iso: plus(d.envoyeLe, 2) },
    ...(nonVides ? [{ titre: 'Pièces vérifiées', detail: `${d.c.faites} pièce${d.c.faites > 1 ? 's' : ''} sur ${d.c.total} lisible${d.c.faites > 1 ? 's' : ''} et complète${d.c.faites > 1 ? 's' : ''}.`, iso: plus(d.envoyeLe, 1) }] : []),
    { titre: 'Demande reçue', detail: d.numero, iso: d.envoyeLe },
    ...echanges.map((e) => ({ titre: 'Échange avec l’assistant', ...e }))]
  const actions = relancesD.map((r) => r.type === 'instruction'
    ? { titre: 'Instruction faite', detail: 'Dossier pris en instruction par Nicolas B.', iso: new Date(r.date).toISOString(), time: heureS(r.date) }
    : { titre: { relance: 'Relance envoyée', correction: 'Correction demandée', modification: 'Modification par l’entrepreneur', confirmation: 'Réception confirmée' }[r.type] ?? 'Action', detail: r.texte.split('\n').find((l) => l.trim() && !l.startsWith('Bonjour'))?.slice(0, 90), iso: new Date(r.date).toISOString() })
  return chronologie([...actions, ...base].sort((a, b) => new Date(b.iso) - new Date(a.iso)).map((e) => ({ titre: e.titre, detail: e.detail, time: e.time ?? heure(e.iso), etat: 'done' })))
}

function rendre() {
  const file = dossiers(), d = file.find((x) => x.id === idUrl) ?? file[0], a = d.answers, c = d.c, cr = criteres(d), pret = d.statut === 'pret'
  const entete = `<header class="border-b border-border bg-bg"><p id="bandeau" class="tabular bg-text px-4 py-1.5 text-center text-xs text-bg" ${ui.get().bandeauMasque ? 'hidden' : ''}>Prototype, données fictives</p><div class="mx-auto flex h-14 max-w-[96rem] items-center justify-between px-4 sm:px-8"><div class="flex items-center gap-6"><a href="/pro/dossiers" aria-label="Élan Pro, dossiers" class="flex items-center">${logo('wordmark', 'h-6')}<span class="ml-2 rounded-sm border border-border-strong px-1.5 py-px text-xs font-semibold leading-4 text-muted">Pro</span></a><nav aria-label="Élan Pro"><a href="/pro/dossiers" aria-current="page" class="text-sm font-semibold">Dossiers</a></nav></div><div class="flex items-center gap-2">${boutonDemo()}${boutonProfil()}</div></div></header>`
  const fait = instruit(d)
  const aInstruire = `<button type="button" data-instruire ${pret && !fait ? '' : 'aria-disabled="true"'} class="${btn(pret && !fait ? 'primary' : 'secondary')}">${fait ? 'Instruction faite' : 'Instruire'}</button>`
  const relancer = pret ? `<button type="button" data-msg="confirmation" class="${btn('secondary')}">Confirmer la réception</button>` : `<button type="button" data-msg="relance" class="${btn('primary')}">Relancer</button>`
  const correction = d.aCorriger.length ? `<button type="button" data-msg="correction" class="${btn('ghost')}">Demander une correction</button>` : ''
  const corps = `${fileTravail(file)}<div class="flex min-h-0 min-w-0 flex-col gap-4">
    <div class="rounded-card border border-border bg-surface p-5 shadow-sm"><div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3"><div class="min-w-0"><div class="flex flex-wrap items-center gap-3"><h1 tabindex="-1" class="text-2xl font-bold tracking-tighter outline-none">${esc(d.entreprise)}</h1>${statutBadge(d)}</div><p class="mt-1 text-muted">${esc(d.f.nom)} · <span class="tabular">${a.montant !== undefined ? eur(a.montant) : 'montant non renseigné'}</span> · envoyé le ${jour(d.envoyeLe)} · <span class="ident text-sm">${esc(d.numero ?? '')}</span></p><p class="mt-2 flex items-center gap-2 text-sm text-muted">${icon('clock')}<span class="tabular">Temps de relance estimé : environ 25 min (45 min sans Élan)</span><span class="text-xs text-subtle">ordre de grandeur à calibrer</span></p></div>
      <div class="flex flex-wrap items-center gap-2">${pret ? aInstruire + relancer : relancer + aInstruire}${correction}</div></div>
      ${pret ? '' : `<p id="raison-instruire" class="mt-3 text-sm text-muted">Instruire sera possible quand les pièces obligatoires ${d.manque.length ? 'manquantes ' : ''}${d.manque.length && d.aCorriger.length ? 'et ' : ''}${d.aCorriger.length ? 'à corriger ' : ''}seront reçues et vérifiées.</p>`}</div>
    <div class="grid min-h-0 min-w-0 flex-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[minmax(0,1fr)]">
      <section aria-labelledby="completude" class="flex min-h-0 min-w-0 flex-col rounded-card border border-border bg-surface p-5 shadow-sm"><div class="flex items-center gap-4">${anneau((c.faites / c.total) * 100, 64, `${c.faites} pièces sur ${c.total}`, `<span class="text-base font-bold">${c.faites}/${c.total}</span>`)}<div><h2 id="completude" class="font-semibold tracking-tight">Complétude</h2><p class="text-sm text-muted">${c.bloquantes.length === 0 ? 'Toutes les pièces obligatoires sont là.' : `${c.bloquantes.length} pièce${c.bloquantes.length > 1 ? 's' : ''} obligatoire${c.bloquantes.length > 1 ? 's' : ''} ${d.aCorriger.length && d.aCorriger.length === c.bloquantes.length ? 'à corriger' : 'manque' + (c.bloquantes.length > 1 ? 'nt' : '')}.`}</p></div></div>
        <ul class="mt-3 flex min-h-0 flex-col overflow-y-auto">${PIECES.map((p) => { const s = d.etat[p.id]; return `<li><button type="button" data-apercu="${p.id}" class="tr flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 rounded-sm px-2 text-left hover:bg-bg-soft"><span class="min-w-0 py-1.5 text-sm font-medium">${esc(p.nom)}</span>${s.statut === 'a-fournir' && !p.obligatoire ? badge('Facultative') : badgeStatut(s.statut)}</button>${s.statut === 'a-corriger' ? `<p class="mx-2 mb-1 flex items-start gap-1.5 rounded-sm bg-warning-soft px-2.5 py-1.5 text-xs text-text">${icon('message-square-quote', 'mt-0.5 size-3.5 shrink-0')}Message envoyé à l’entrepreneur : « ${esc(s.message)} »</p>` : ''}</li>` }).join('')}</ul></section>
      <section class="flex min-h-0 min-w-0 flex-col rounded-card border border-border bg-surface p-5 shadow-sm"><div role="tablist" aria-label="Détail du dossier" class="flex gap-1 border-b border-border">${[['criteres', 'Critères d’éligibilité'], ['journal', 'Journal']].map(([k, l]) => `<button role="tab" type="button" id="t-${k}" data-onglet="${k}" aria-selected="${onglet === k}" aria-controls="v-${k}" tabindex="${onglet === k ? 0 : -1}" class="tr -mb-px min-h-11 cursor-pointer border-b-2 border-transparent px-4 text-base font-medium text-muted hover:text-text aria-selected:border-accent aria-selected:text-text">${l}</button>`).join('')}</div>
        <div id="v-criteres" role="tabpanel" aria-labelledby="t-criteres" ${onglet === 'criteres' ? '' : 'hidden'} class="min-h-0 min-w-0 flex-1 overflow-auto pt-3 text-sm"><div aria-hidden="true" class="grid min-w-[30rem] grid-cols-[1.1fr_1fr_1.2fr_0.9fr] gap-2 border-b border-border px-2 pb-2 text-muted">${['Critère', 'Réponse', 'Preuve', 'Statut'].map((h) => `<span>${h}</span>`).join('')}</div><ul aria-label="Critères d’éligibilité" class="min-w-[30rem]">${cr.map((x) => `<li><button type="button" data-critere="${x.id}" aria-expanded="${ouvert === x.id}" class="tr grid w-full cursor-pointer grid-cols-[1.1fr_1fr_1.2fr_0.9fr] items-center gap-2 rounded-sm px-2 py-2 text-left hover:bg-bg-soft"><span class="font-medium">${esc(x.label)}<span class="sr-only">. Réponse : ${esc(x.reponse)}. Preuve : ${esc(x.preuve?.nom ?? 'déclaré')}. Statut : ${x.statut}.</span></span><span aria-hidden="true" class="tabular break-words">${esc(x.reponse)}</span><span aria-hidden="true" class="break-words text-muted">${esc(x.preuve?.nom ?? 'Déclaré')}</span><span aria-hidden="true">${badge(x.statut, x.statut === 'À vérifier' ? 'warning' : x.statut === 'Rempli' ? 'neutral' : 'success')}</span></button>${ouvert === x.id ? `<p class="mx-2 mb-1 rounded-sm bg-bg-soft px-3 py-2 text-muted">${esc(x.ok === false ? x.raison : x.preuve ? `Preuve attendue : ${x.preuve.nom}.` : 'Déclaré par l’entrepreneur, aucune pièce ne le prouve.')}</p>` : ''}</li>`).join('')}</ul></div>
        <div id="v-journal" role="tabpanel" aria-labelledby="t-journal" ${onglet === 'journal' ? '' : 'hidden'} class="min-h-0 flex-1 overflow-y-auto pt-4">${journal(d)}</div></section></div></div>`
  racine.innerHTML = `<a href="#contenu" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>${entete}<main id="contenu" class="mx-auto w-full max-w-[96rem] px-4 py-4 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-hidden"><div class="grid h-full min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[17rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">${corps}</div></main>`
  monterDemo()
}

racine.addEventListener('click', (e) => {
  const t = e.target, d = courant()
  const o = t.closest('[data-onglet]'); if (o) { onglet = o.dataset.onglet; return rendre() }
  const c = t.closest('[data-critere]'); if (c) { ouvert = ouvert === c.dataset.critere ? null : c.dataset.critere; return rendre() }
  const ap = t.closest('[data-apercu]'); if (ap) { const p = pieceById(ap.dataset.apercu), s = d.etat[p.id]; return tiroir({ titre: p.nom, description: s.fichier ? s.fichier.nom : 'Aucun fichier déposé', corps: `<div class="flex flex-col gap-4 p-5">${badgeStatut(s.statut)}${s.verifie ? `<p class="text-sm text-muted">${esc(s.verifie)}</p>` : ''}${s.message ? `<p class="rounded-md bg-warning-soft p-3 text-sm">Message envoyé à l’entrepreneur : « ${esc(s.message)} »</p>` : ''}${documentExemple(p)}</div>` }).ouvrir() }
  if (t.closest('[data-instruire]')) {
    if (d.statut !== 'pret' || instruit(d)) return
    ajouterRelance('instruction', 'Instruction démarrée par Nicolas B.', d.id); onglet = 'journal'; rendre()
    const quand = new Date().toLocaleTimeString('fr-FR')
    return modale({ titre: 'Instruction démarrée', description: `${d.entreprise} · ${d.numero ?? ''}`, corps: `<p class="text-base">Le dossier est pris en instruction. L’entrepreneur est prévenu.</p><p class="tabular mt-3 text-sm text-muted">Instruction faite à ${quand}. L’historique du dossier est à jour.</p>`, pied: `<button type="button" data-fermer class="${btn('primary')}">Fermer</button>` }).ouvrir()
  }
  const m = t.closest('[data-msg]'); if (m) {
    const kind = m.dataset.msg, texte = message(kind, d)
    const dlg = modale({ titre: kind === 'correction' ? 'Demander une correction' : kind === 'confirmation' ? 'Confirmer la réception' : 'Relancer l’entrepreneur', description: 'Message pré-rédigé, modifiable. Il part avec le lien vers la demande.', corps: `<div role="tablist" aria-label="Message" class="flex gap-1 border-b border-border"><button role="tab" type="button" data-m="modifier" aria-selected="true" class="tr -mb-px min-h-11 cursor-pointer border-b-2 border-transparent px-4 font-medium text-muted aria-selected:border-accent aria-selected:text-text">Modifier</button><button role="tab" type="button" data-m="apercu" aria-selected="false" class="tr -mb-px min-h-11 cursor-pointer border-b-2 border-transparent px-4 font-medium text-muted aria-selected:border-accent aria-selected:text-text">Aperçu</button></div><div class="pt-3"><label for="msg" class="sr-only">Message</label><textarea id="msg" rows="9" class="w-full rounded-sm border border-border-strong bg-surface p-3 text-sm leading-relaxed">${esc(texte)}</textarea><div id="apercu" hidden class="whitespace-pre-wrap rounded-md border border-border bg-bg-soft p-4 text-sm leading-relaxed"></div></div>`, pied: `<button type="button" data-fermer class="${btn('ghost')}">Annuler</button><button type="button" id="envoyer" class="${btn('primary')}">Envoyer</button>` }).ouvrir()
    dlg.addEventListener('click', (ev) => { const b = ev.target.closest('[data-m]'); if (!b) return; const ap = b.dataset.m === 'apercu'; dlg.querySelectorAll('[data-m]').forEach((x) => x.setAttribute('aria-selected', String(x === b))); dlg.querySelector('#msg').hidden = ap; dlg.querySelector('#apercu').hidden = !ap; dlg.querySelector('#apercu').textContent = dlg.querySelector('#msg').value })
    dlg.querySelector('#envoyer').onclick = () => { ajouterRelance(kind, dlg.querySelector('#msg').value, d.id); toast({ title: kind === 'correction' ? 'Correction demandée' : kind === 'confirmation' ? 'Réception confirmée' : 'Relance envoyée', description: 'Message transmis à l’entrepreneur.' }); dlg.close(); rendre() }
  }
})
let cle = ''; const emp = () => JSON.stringify([pieces.get(), demande.get().answers, relances.get(), evenements.get().items.length])
for (const s of [pieces, demande, relances, evenements, ui]) s.sub(() => { const k = emp(); if (k !== cle) { cle = k; rendre() } })
cle = emp(); rendre(); setTimeout(() => $('h1')?.focus({ preventScroll: true }), 80)
