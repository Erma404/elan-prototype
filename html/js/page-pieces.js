// Écran 2 : pièces guidées. Liste, détail de la pièce choisie, avancement. Tout tient dans la fenêtre (≥ 1024 px).
import { $, $$, esc, btn, modale, tiroir, toast, banniere, badge, badgeStatut, anneau, STATUTS, annoncer } from './core.js'
import { icon } from './icons.js'
import { monterCoque } from './shell.js'
import { ouvrirDepotGroupe } from './depot-groupe.js'
import { demande, pieces, patch, deposer, annulerDepot, inviter, revoquer, suivre, relances, ajouterRelance, eur, objetProjet } from './state.js'
import { PIECES, GROUPES, complete, compter } from './pieces.js'
import { financements } from './engine.js'
import { documentExemple, ligneFichier, zoneDepot, brancherDepot } from './composants.js'
import { REPONSES, GENERALES, SOURCE } from './reponses.js'

const main = monterCoque({ step: 1, titre: 'Vos pièces' })
let selection = sessionStorage.getItem('elan:piece') ?? (PIECES.find((p) => !complete(pieces.get().etat[p.id].statut)) ?? PIECES[0]).id
let remplacer = false, retire = null
const E = () => pieces.get().etat
const iaActive = () => pieces.get().erreur !== 'ia'
const choisir = (id) => { selection = id; remplacer = false; retire = null; sessionStorage.setItem('elan:piece', id); rendreTout(); $('#piece-titre')?.focus?.() }

// ---------- Calculs ----------
function suivante() {
  const etat = E(), idx = PIECES.findIndex((p) => p.id === selection), c = compter(etat)
  const reste = PIECES.filter((p) => !complete(etat[p.id].statut) && p.id !== selection)
  const ordre = (l) => [...l.filter((p) => PIECES.indexOf(p) > idx), ...l.filter((p) => PIECES.indexOf(p) < idx)]
  const apres = [...ordre(reste.filter((p) => p.obligatoire)), ...ordre(reste.filter((p) => !p.obligatoire))][0]
  const primaire = complete(etat[selection].statut)
  if (apres) return { label: 'Pièce suivante', id: apres.id, primaire }
  if (c.manquantes.length === 0) return { label: 'Passer à l’envoi', url: '/demande/recapitulatif', primaire: true }
  return { label: 'Pièce suivante', id: PIECES[(idx + 1) % PIECES.length].id, primaire: false }
}

// ---------- Liste ----------
const liste = () => `<nav aria-label="Pièces de la demande" class="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">${GROUPES.map((g) => `<section aria-labelledby="g-${g.id}"><h2 id="g-${g.id}" class="mb-1 px-2.5 text-sm font-semibold text-muted">${g.titre}</h2><ul class="flex flex-col gap-0.5">${PIECES.filter((p) => p.groupe === g.id).map((p) => {
  const st = E()[p.id].statut, m = STATUTS[st], actif = selection === p.id
  return `<li><button type="button" data-piece="${p.id}" data-focus="piece-${p.id}" ${actif ? 'aria-current="true"' : ''} title="${esc(p.nom)}" class="tr flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1 text-left ${actif ? 'bg-text text-bg' : 'hover:bg-bg-soft'}"><span aria-hidden="true" class="grid size-6 shrink-0 place-items-center rounded-full ${actif ? 'bg-bg/15 text-bg' : m.cls}">${icon(m.ic, `size-3.5${m.spin ? ' animate-[spin_0.8s_linear_infinite]' : ''}`)}</span><span class="min-w-0 flex-1 truncate text-[0.8125rem] font-medium leading-tight">${esc(p.nom)}</span><span class="shrink-0 text-xs ${actif ? 'opacity-75' : 'text-subtle'}">${st === 'a-fournir' ? (p.obligatoire ? '' : 'Facultative') : st === 'attente-experte' ? 'Experte' : m.label}</span></button></li>`
}).join('')}</ul></section>`).join('')}</nav>`

// ---------- Détail ----------
function actions(p, s) {
  const st = s.statut, fait = complete(st)
  const retirerBtn = `<button type="button" data-retirer data-focus="retirer" class="${btn('ghost', 'sm')}">${icon('trash-2')}Retirer</button>`
  const fichierActions = `<span class="flex flex-wrap items-center gap-1.5"><button type="button" data-remplacer data-focus="remplacer" aria-expanded="${remplacer}" class="${btn('secondary', 'sm')}">Remplacer le fichier</button>${retirerBtn}</span>`
  if (st === 'a-fournir') return `<div class="flex flex-col gap-3">${retire ? banniere({ ton: 'info', titre: 'Fichier retiré', corps: 'Vous pouvez en déposer un autre ou revenir en arrière.', action: `<button type="button" data-annuler-retrait class="${btn('secondary', 'sm')}">${icon('undo-2')}Annuler, le remettre</button>` }) : ''}${s.message ? banniere({ ton: 'danger', titre: 'L’envoi n’a pas abouti', corps: esc(s.message), action: s.fichier ? `<button type="button" data-reessayer class="${btn('secondary', 'sm')}">${icon('rotate-ccw')}Réessayer</button>` : '' }) : ''}${zoneDepot(p.nom)}<div class="flex flex-wrap items-center gap-2"><button type="button" data-reporter aria-pressed="${!!s.reporte}" class="${btn('ghost', 'sm')}">${icon('clock')}Je ne l’ai pas encore</button><button type="button" data-na class="${btn('ghost', 'sm')}">${icon('ban')}Non applicable</button>${s.reporte ? `<p class="flex items-center gap-1.5 text-sm text-muted" role="status">${icon('clock')}${p.obligatoire ? 'Noté. Cette pièce reste nécessaire avant l’envoi.' : 'Reportée. Elle ne bloque pas l’envoi, vous pourrez l’ajouter ensuite.'}</p>` : ''}</div></div>`
  if (st === 'envoi') return ligneFichier({ nom: s.fichier.nom, taille: s.fichier.taille, statut: 'envoi', progress: s.progress ?? 0, message: s.message, actions: `<button type="button" data-retirer data-focus="annuler" class="${btn('ghost', 'sm')}">Annuler l’envoi</button>` })
  if (st === 'a-corriger') return `<div class="flex flex-col gap-3">${banniere({ ton: 'warning', titre: 'À corriger', corps: `${esc(s.message)} Remplacez le fichier, ou envoyez tel quel : l’IA alerte, elle ne bloque pas.` })}${s.fichier ? ligneFichier({ nom: s.fichier.nom, taille: s.fichier.taille, statut: st, actions: fichierActions }) : ''}${remplacer ? zoneDepot(p.nom) : ''}</div>`
  if (st === 'non-applicable') return `<div class="flex flex-wrap items-center justify-between gap-3"><p><span class="font-medium">Non applicable.</span> <span class="text-muted">${esc(s.raison)}</span></p><button type="button" data-annuler-na class="${btn('ghost', 'sm')}">Annuler</button></div>`
  if (st === 'attente-experte') { const inv = pieces.get().invitation; return `<div class="flex flex-col gap-3">${banniere({ ton: 'info', titre: 'En attente de l’experte-comptable', corps: `${inv ? `Invitée le ${new Date(inv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}, ${esc(inv.email)}.` : 'Invitation envoyée.'} Vous pouvez aussi déposer cette pièce vous-même.` })}<div><button type="button" data-moi-meme class="${btn('secondary', 'sm')}">Déposer moi-même</button></div></div>` }
  return `<div class="flex flex-col gap-3">${ligneFichier({ nom: s.fichier.nom, taille: s.fichier.taille, statut: st, message: s.verifie, actions: fichierActions })}${remplacer ? zoneDepot(p.nom) : ''}</div>`
}
function detail() {
  const p = PIECES.find((x) => x.id === selection), s = E()[selection], idx = PIECES.indexOf(p), n = suivante()
  return `<section aria-labelledby="piece-titre" class="flex h-full min-h-0 flex-col overflow-hidden rounded-card border border-border bg-surface shadow-sm">
    <header class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-5 py-3"><span class="tabular text-xs text-subtle" aria-label="Pièce ${idx + 1} sur ${PIECES.length}">${idx + 1}/${PIECES.length}</span><h2 id="piece-titre" tabindex="-1" class="text-lg font-semibold tracking-tight outline-none">${esc(p.nom)}</h2>${badge(p.obligatoire ? 'Obligatoire' : 'Recommandée', p.obligatoire ? 'accent' : 'neutral')}
      <div class="ml-auto flex items-center gap-2">${s.statut === 'a-fournir' ? '' : badgeStatut(s.statut)}<button type="button" data-suivante data-focus="suivante" class="${btn(n.primaire ? 'primary' : 'secondary', 'sm')}">${n.label}${icon('arrow-right')}</button></div></header>
    <div id="piece-corps" class="grid min-h-0 flex-1 content-start overflow-y-auto gap-x-5 gap-y-3 px-5 py-3 min-[1400px]:grid-cols-[minmax(0,1fr)_13.5rem]"><div class="flex min-w-0 flex-col gap-2"><div><h3 class="flex items-center gap-2 text-sm font-semibold text-muted">${icon('info', 'size-4')}Pourquoi nous la demandons</h3><p class="mt-1 text-[0.9375rem] leading-snug">${esc(p.pourquoi)}</p></div><div><h3 class="flex items-center gap-2 text-sm font-semibold text-muted">${icon('map-pin', 'size-4')}Où la trouver</h3><ol class="mt-1 flex flex-col gap-1 text-[0.9375rem] leading-snug">${p.ouTrouver.map((o, i) => `<li class="flex gap-2.5"><span class="tabular mt-px text-xs text-subtle">0${i + 1}</span><span>${esc(o)}</span></li>`).join('')}</ol></div>
      <div class="flex flex-wrap items-center gap-x-4"><button type="button" data-exemple class="tr -ml-1 inline-flex min-h-8 cursor-pointer items-center rounded-sm px-1 text-sm font-medium underline underline-offset-4 hover:text-accent-text min-[1400px]:hidden">${icon('eye', 'size-4')}<span class="ml-1.5">Voir un exemple</span></button>${iaActive() ? `<button type="button" data-aide="${p.id}" class="tr -ml-1 inline-flex min-h-8 w-fit cursor-pointer items-center gap-2 rounded-sm px-1 text-sm font-medium text-accent-text underline-offset-4 hover:underline">${icon('message-circle-question-mark')}Une question sur cette pièce ?</button>` : ''}</div></div><div class="hidden min-[1400px]:block">${documentExemple(p)}</div></div>
    <div id="piece-action" class="border-t border-border bg-bg-soft px-5 py-3">${actions(p, s)}</div></section>`
}

// ---------- Résumé d'avancement (colonne de gauche) et invitation ----------
function lateral() {
  const c = compter(pieces.get().etat), pct = (c.faites / c.total) * 100
  return `<div class="flex items-center gap-4 rounded-card border border-border bg-surface p-4 shadow-sm">${anneau(pct, 56, `${c.faites} ${c.faites > 1 ? 'pièces' : 'pièce'} sur ${c.total}`, `<span class="text-base font-bold tracking-tighter">${c.faites}<span class="text-xs font-normal text-subtle">/${c.total}</span></span>`)}<div><p class="font-semibold tracking-tight"><span class="tabular">${c.faites}</span> ${c.faites > 1 ? 'pièces' : 'pièce'} sur <span class="tabular">${c.total}</span></p><p class="text-sm text-muted">${c.faites === c.total ? 'Tout est prêt.' : `Il vous en reste ${c.total - c.faites}.`}</p></div></div>`
}
function blocInvitation() {
  const inv = pieces.get().invitation
  if (!(inv && !inv.revoquee)) return `<button type="button" data-inviter class="${btn('ghost', 'sm', '-ml-2')}">${icon('user-plus')}Inviter mon experte-comptable</button>`
  return `<div class="flex flex-wrap items-center justify-between gap-2"><p class="text-sm"><span class="font-medium">${esc(inv.email)}</span><span class="block text-xs text-muted">Invitée le ${new Date(inv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span></p><button type="button" data-revoquer class="${btn('ghost', 'sm')}">Révoquer l’accès</button></div>`
}

// ---------- En-tête de page ----------
function entete() {
  const st = pieces.get(), a = demande.get().answers, c = compter(st.etat), env = !!st.envoyeLe, bloque = c.manquantes.length > 0, corr = c.aCorriger.length > 0
  const f = financements.find((x) => x.id === (demande.get().financementId ?? 'pret-equipement-artisans'))
  const raison = bloque ? `Il manque ${c.manquantes.length} pièce${c.manquantes.length > 1 ? 's' : ''} obligatoire${c.manquantes.length > 1 ? 's' : ''} : ${c.manquantes.map((p) => p.nom).join(', ')}.` : ''
  const consigne = bloque ? `Déposez les pièces obligatoires : il en reste ${c.manquantes.length}. Quand elles sont prêtes, l’envoi se débloque.` : corr ? 'Une pièce est à corriger. Vous pouvez la remplacer, ou envoyer quand même.' : 'Toutes les pièces obligatoires sont prêtes. Vous pouvez envoyer votre demande.'
  const envoyer = env ? `<a href="/demande/envoyee" class="${btn('primary', 'md', '!rounded-full')}">Voir le suivi${icon('arrow-right', 'size-5')}</a>` : `<a href="/demande/recapitulatif" ${bloque ? `aria-disabled="true" title="${esc(raison)}"` : ''} class="${btn(c.faites === 0 ? 'secondary' : 'primary', 'md', '!rounded-full')}">${corr && !bloque ? 'Envoyer quand même' : 'Envoyer ma demande'}${icon('arrow-right', 'size-5')}</a>`
  return `<a href="/eligibilite" class="${btn('ghost', 'sm', '-ml-3 w-fit')}">${icon('arrow-left')}Mon résultat</a><header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-3"><div class="min-w-0"><h1 class="text-[clamp(1.5rem,2.4vw,2.125rem)] font-bold leading-tight tracking-tighter">${esc(f.nom)}<span class="font-normal text-muted">, ${esc(objetProjet(a).toLowerCase())}${a.montant !== undefined ? `, <span class="tabular">${eur(a.montant)}</span>` : ''}</span></h1><p class="mt-1 text-[0.9375rem] text-muted" aria-live="polite">${consigne}</p></div>
    <div class="flex flex-wrap items-center gap-2"><button type="button" data-groupe class="${btn(c.faites === 0 ? 'primary' : 'secondary', 'md', '!rounded-full')}">${icon('upload')}Déposer plusieurs documents</button>${envoyer}</div></header>`
}
function bannieres() {
  const st = pieces.get(); return [st.envoyeLe ? banniere({ ton: 'info', titre: 'Votre demande est envoyée', corps: 'Vous pouvez encore remplacer, retirer ou ajouter une pièce. Votre chargé d’affaires est prévenu de chaque changement.', action: `<a href="/demande/envoyee" class="${btn('secondary', 'sm')}">Voir le suivi</a>` }) : '', st.hors_ligne ? banniere({ ton: 'warning', titre: 'Connexion perdue', corps: 'Vous pouvez continuer : tout est gardé sur cet appareil et partira au retour du réseau.' }) : '', st.erreur === 'reseau' ? banniere({ ton: 'danger', titre: 'Réseau instable (démonstration)', corps: 'Les prochains dépôts échoueront, avec la possibilité de réessayer.' }) : ''].join('')
}

// ---------- Rendu avec conservation du focus ----------
function avecFocus(f) { const cle = document.activeElement?.dataset?.focus; f(); if (cle) $(`[data-focus="${cle}"]`)?.focus({ preventScroll: true }) }
function rendreTout() {
  avecFocus(() => {
    if (!$('#squelette')) main.innerHTML = `<div id="squelette" class="flex h-full min-h-0 flex-col gap-4"><div id="entete"></div><div id="bannieres" class="flex flex-col gap-3 empty:hidden"></div><div class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]"><div class="flex min-h-0 flex-col gap-3"><aside id="lateral" aria-label="Avancement de la demande"></aside><div id="liste" class="min-h-0 flex-1 overflow-hidden [&>nav]:h-full"></div><div id="invitation"></div></div><div id="detail" class="min-h-0"></div></div></div>`
    $('#entete').innerHTML = entete(); $('#bannieres').innerHTML = bannieres(); $('#liste').innerHTML = liste(); $('#detail').innerHTML = detail(); $('#lateral').innerHTML = lateral(); $('#invitation').innerHTML = blocInvitation()
    brancherDepot($('#detail'), { onMulti: (fs) => ouvrirDepotGroupe(fs, { apres: apresGroupe }), onFile: (f) => { remplacer = false; retire = null; prevenir(E()[selection].fichier ? 'remplacé une pièce' : 'ajouté une pièce'); deposer(selection, f.name, f.size, f) }, forceLourd: () => (pieces.get().erreur === 'fichier-lourd' ? 14900000 : 0) })
    bouton()
  })
}
const apresGroupe = (ids) => { if (pieces.get().envoyeLe) for (const id of ids) ajouterRelance('modification', `Fabienne M. a ajouté une pièce : ${PIECES.find((p) => p.id === id).nom}.`); if (ids[0]) choisir(ids[0]) }
const prevenir = (quoi) => { if (pieces.get().envoyeLe) ajouterRelance('modification', `Fabienne M. a ${quoi} : ${PIECES.find((p) => p.id === selection).nom}.`) }
function bouton() {
  let b = $('#bouton-assistant'); if (!iaActive()) return b?.remove()
  if (!b) { b = document.createElement('button'); b.id = 'bouton-assistant'; b.type = 'button'; b.className = 'bg-ai tr fixed bottom-3 right-3 z-[var(--z-sticky)] inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full px-5 text-sm font-semibold text-[var(--color-ai-text)] shadow-lg hover:scale-[1.02] active:scale-[0.98]'; b.innerHTML = `${icon('message-circle')}Assistant Élan`; b.onclick = () => assistant(null); document.body.append(b) }
}

// ---------- Interactions (délégation) ----------
main.addEventListener('click', (e) => {
  const t = e.target, s = E()[selection], p = PIECES.find((x) => x.id === selection)
  if (t.closest('[data-groupe]')) return ouvrirDepotGroupe([], { apres: apresGroupe })
  const pc = t.closest('[data-piece]'); if (pc) return choisir(pc.dataset.piece)
  if (t.closest('[data-suivante]')) { const n = suivante(); return n.url ? (location.href = n.url) : choisir(n.id) }
  if (t.closest('[data-remplacer]')) { remplacer = !remplacer; return rendreTout() }
  if (t.closest('[data-retirer]')) { retire = { ...s }; annulerDepot(selection); prevenir('retiré une pièce'); remplacer = false; return patch(selection, { statut: 'a-fournir', fichier: undefined, message: undefined, verifie: undefined, progress: undefined }) }
  if (t.closest('[data-annuler-retrait]')) { const r = retire; retire = null; prevenir('rétabli une pièce'); return patch(selection, r) }
  if (t.closest('[data-reessayer]')) return deposer(selection, s.fichier.nom, s.fichier.taille)
  if (t.closest('[data-reporter]')) return patch(selection, { reporte: !s.reporte })
  if (t.closest('[data-annuler-na]')) return patch(selection, { statut: 'a-fournir', raison: undefined })
  if (t.closest('[data-moi-meme]')) return patch(selection, { statut: 'a-fournir' })
  if (t.closest('[data-na]')) return nonApplicable(p)
  if (t.closest('[data-exemple]')) return modale({ titre: `Exemple : ${p.nom}`, description: 'Pour savoir ce qu’on attend.', corps: `<div class="grid place-items-center py-2">${documentExemple(p)}</div>`, pied: `<button type="button" data-fermer class="${btn('secondary')}">Fermer</button>` }).ouvrir()
  const ai = t.closest('[data-aide]'); if (ai) return assistant(ai.dataset.aide)
  if (t.closest('[data-inviter]')) return invitation()
  if (t.closest('[data-revoquer]')) return revoquer()
})
$('#racine').addEventListener('click', (e) => { if (e.target.closest('a[aria-disabled="true"]')) e.preventDefault() })

const RAISONS = [['pas-concerne', 'Je ne suis pas concerné·e'], ['fonds-propres', 'Je finance sur fonds propres'], ['entreprise-recente', 'Mon entreprise est trop récente'], ['autre', 'Autre raison']]
function nonApplicable(p) {
  const d = modale({ titre: 'Pièce non applicable', description: `Dites-nous pourquoi « ${p.nom} » ne vous concerne pas.`, corps: `<label for="raison" class="text-sm font-medium">Raison <span aria-hidden="true" class="text-danger">*</span></label><select id="raison" class="mt-1.5 h-11 w-full rounded-sm border border-border-strong bg-surface px-3.5 text-base"><option value="">Choisir une raison</option>${RAISONS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select><p id="raison-err" role="alert" class="mt-1.5 text-sm font-medium text-danger" hidden>Choisissez une raison pour continuer.</p><p class="mt-3 text-sm text-muted">La complétude sera recalculée. Votre chargé d’affaires verra cette raison.</p>`, pied: `<button type="button" data-fermer class="${btn('ghost')}">Annuler</button><button type="button" id="ok" class="${btn('primary')}">Confirmer</button>` }).ouvrir()
  d.querySelector('#ok').onclick = () => { const v = d.querySelector('#raison').value; if (!v) { d.querySelector('#raison-err').hidden = false; d.querySelector('#raison').setAttribute('aria-invalid', 'true'); return } patch(p.id, { statut: 'non-applicable', raison: RAISONS.find((r) => r[0] === v)[1] }); d.close() }
}
function invitation() {
  const dispo = PIECES.filter((p) => E()[p.id].statut === 'a-fournir'), defaut = ['bilans', 'liasse', 'attestation']
  const d = modale({ titre: 'Inviter mon experte-comptable', description: 'Elle dépose les pièces à votre place. Elle ne voit jamais le montant de votre demande.', corps: `<div class="flex flex-col gap-5"><div><label for="mail" class="text-sm font-medium">Adresse e-mail de l’experte-comptable <span aria-hidden="true" class="text-danger">*</span></label><input id="mail" type="email" autocomplete="off" placeholder="prenom@cabinet.fr" class="mt-1.5 h-11 w-full rounded-sm border border-border-strong bg-surface px-3.5 text-base"><p id="mail-err" role="alert" class="mt-1.5 text-sm font-medium text-danger" hidden></p></div>
    <fieldset><legend class="text-sm font-medium">Pièces à lui confier</legend><div class="mt-2 flex flex-col gap-1">${dispo.length ? dispo.map((p) => `<label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-2 hover:bg-bg-soft"><input type="checkbox" value="${p.id}" ${defaut.includes(p.id) ? 'checked' : ''} class="size-5 accent-[var(--color-accent)]"><span>${esc(p.nom)}</span></label>`).join('') : '<p class="text-sm text-muted">Il n’y a plus de pièce à déléguer.</p>'}</div></fieldset>
    <div class="rounded-md bg-bg-soft p-4"><p class="flex items-center gap-2 text-sm font-semibold">${icon('eye')}Ce qu’elle verra</p><ul class="mt-2 list-inside list-disc text-sm text-muted"><li>La liste des pièces choisies et leurs zones de dépôt</li><li>Rien d’autre : ni le montant, ni vos réponses</li></ul><div class="mt-3 flex flex-wrap gap-2">${badge('Pièces uniquement', 'outline')}${badge('Révocable à tout moment', 'outline')}</div></div></div>`, pied: `<button type="button" data-fermer class="${btn('ghost')}">Annuler</button><button type="button" id="ok" class="${btn('primary')}">Envoyer l’invitation</button>` }).ouvrir()
  d.querySelector('#ok').onclick = () => {
    const mail = d.querySelector('#mail').value.trim(), ids = [...d.querySelectorAll('input[type=checkbox]:checked')].map((c) => c.value), err = d.querySelector('#mail-err')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { err.textContent = 'Cette adresse n’est pas valide. Vérifiez le « @ » et le nom de domaine.'; err.hidden = false; d.querySelector('#mail').setAttribute('aria-invalid', 'true'); d.querySelector('#mail').focus(); return }
    if (!ids.length) { err.textContent = 'Choisissez au moins une pièce à déléguer.'; err.hidden = false; return }
    inviter({ email: mail, date: new Date().toISOString(), pieces: ids, revoquee: false }); d.close()
  }
}

// ---------- Assistant IA : réponses scriptées, source citée, jamais de verdict ----------
function assistant(pieceId) {
  const p = pieceId ? PIECES.find((x) => x.id === pieceId) : null, chips = [...(p?.suggestions ?? []), ...GENERALES]
  const d = tiroir({ titre: 'Assistant Élan', description: 'L’IA prépare, vous validez.', classe: 'ia', corps: `<div class="min-h-0 flex-1 overflow-y-auto px-5 pb-4"><p class="rounded-md bg-white/5 p-3 text-sm text-[var(--color-ai-muted)]">${p ? `Vous êtes sur <span class="font-medium text-[var(--color-ai-text)]">${esc(p.nom)}</span>. Choisissez une question.` : 'Choisissez une question.'} Je m’appuie uniquement sur le référentiel du financeur.</p><ul id="fil" class="mt-4 flex flex-col gap-4" aria-live="polite"></ul></div><div class="border-t border-[var(--color-ai-border)] p-5"><p class="mb-3 text-xs font-medium uppercase tracking-widest text-[var(--color-ai-muted)]">Questions suggérées</p><div class="flex flex-wrap gap-2">${chips.map((c) => `<button type="button" data-q="${c.id}" class="tr inline-flex min-h-9 cursor-pointer items-center rounded-full border border-[var(--color-ai-border)] px-3.5 text-sm font-medium hover:bg-white/10">${esc(c.question)}</button>`).join('')}</div><button type="button" id="conseiller" class="${btn('secondary', 'md', 'mt-4 w-full')}">${icon('phone')}Parler à un conseiller</button></div>` }).ouvrir()
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches
  d.addEventListener('click', (e) => {
    if (e.target.closest('#conseiller')) return toast({ title: 'Rappel demandé', description: 'Un conseiller vous appelle sous un jour ouvré.' })
    const q = e.target.closest('[data-q]'); if (!q) return
    suivre('aide_ia_utilisee', q.dataset.q); const r = REPONSES[q.dataset.q], fil = d.querySelector('#fil')
    const li = document.createElement('li'); li.className = 'flex flex-col gap-2'
    li.innerHTML = `<p class="self-end rounded-md bg-white/10 px-3.5 py-2 text-sm text-[var(--color-ai-text)]">${esc(q.textContent)}</p><div class="bg-ai rounded-md border border-[var(--color-ai-border)] p-4 text-[var(--color-ai-text)]"><p class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ai-accent)]"><span aria-hidden="true" class="ai-line h-0.5 w-4 rounded-full"></span>Assistant Élan, généré par IA</p><p data-texte class="text-base leading-relaxed"></p><div data-pied></div></div>`
    fil.append(li); li.scrollIntoView({ block: 'end' })
    const cible = li.querySelector('[data-texte]'); let n = 0
    const fin = () => { cible.textContent = r.texte; li.querySelector('[data-pied]').innerHTML = `<p class="mt-3 border-t border-[var(--color-ai-border)] pt-2 text-xs text-[var(--color-ai-muted)]">Source : ${esc(SOURCE)}</p>${r.incertain ? '<p class="mt-2 text-sm text-[var(--color-ai-accent)]">Je ne suis pas sûr de pouvoir vous répondre seul. Un conseiller peut vous aider.</p>' : ''}`; li.scrollIntoView({ block: 'end' }) }
    if (reduit) return fin()
    const t = setInterval(() => { n += 2; cible.textContent = r.texte.slice(0, n); if (n >= r.texte.length) { clearInterval(t); fin() } }, 14)
  })
}

// ---------- Cas limites : connexion perdue, session expirée ----------
addEventListener('offline', () => pieces.set({ hors_ligne: true })); addEventListener('online', () => pieces.set({ hors_ligne: false }))
let dejaHorsLigne = pieces.get().hors_ligne
pieces.sub((st) => {
  const etait = dejaHorsLigne; dejaHorsLigne = st.hors_ligne // mémorisé AVANT d'agir : relancer un dépôt modifie le store et rappelle ce gestionnaire
  if (etait && !st.hors_ligne) { toast({ title: 'Connexion rétablie', description: 'Vos pièces en attente partent maintenant.' }); PIECES.filter((p) => st.etat[p.id].statut === 'envoi' && st.etat[p.id].progress === 0 && st.etat[p.id].fichier).forEach((p) => deposer(p.id, st.etat[p.id].fichier.nom, st.etat[p.id].fichier.taille)) }
  if (st.session_expiree && !$('#modale-session')) sessionExpiree()
})
function sessionExpiree() {
  const d = modale({ titre: 'Votre session a expiré', description: 'Par sécurité, reconnectez-vous. Rien n’est perdu : vous reprendrez là où vous en étiez.', corps: `<p class="flex items-center gap-2 text-sm text-muted">${icon('wifi-off')}Vos pièces et vos réponses sont gardées.</p>`, pied: `<button type="button" id="reco" class="${btn('primary')}">Me reconnecter</button>` })
  d.id = 'modale-session'; d.querySelector('[data-fermer]').remove(); d.addEventListener('cancel', (e) => e.preventDefault()); d.ouvrir()
  d.addEventListener('close', () => { if (pieces.get().session_expiree) setTimeout(sessionExpiree, 0) })
  d.querySelector('#reco').onclick = (e) => { e.target.setAttribute('aria-busy', 'true'); setTimeout(() => { pieces.set({ session_expiree: false }); d.close(); toast({ title: 'Reconnectée', description: 'Vous reprenez là où vous en étiez.' }) }, 900) }
}

// ---------- Mise à jour : seule la progression change → on ne redessine pas ----------
let cle = ''
const empreinte = (st) => JSON.stringify([st.etat && Object.fromEntries(Object.entries(st.etat).map(([k, v]) => [k, { ...v, progress: undefined }])), st.savedAt, st.invitation, st.envoyeLe, st.hors_ligne, st.erreur])
pieces.sub((st) => {
  const k = empreinte(st)
  if (k !== cle) { cle = k; rendreTout(); return }
  const prog = st.etat[selection]?.progress; const b = $('#progression-fichier [role=progressbar]')
  if (b && typeof prog === 'number') { b.setAttribute('aria-valuenow', String(prog)); b.firstElementChild.style.transform = `scaleX(${prog / 100})` }
})
cle = empreinte(pieces.get()); rendreTout(); suivre('pieces_ecran_vu')
if (pieces.get().session_expiree) sessionExpiree()
