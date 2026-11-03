// Vue de l'experte-comptable invitée : les pièces seulement, jamais le montant ni les réponses.
import { $, esc, btn, toast, banniere } from './core.js'
import { icon } from './icons.js'
import { logo } from './shell.js'
import { monterDemo, boutonDemo, boutonProfil } from './demo.js'
import { pieces, ui, deposer } from './state.js'
import { pieceById } from './pieces.js'
import { ligneFichier, zoneDepot, brancherDepot } from './composants.js'

const PAR_DEFAUT = ['bilans', 'liasse', 'attestation']
const token = location.pathname.split('/').filter(Boolean)[1] ?? 'demo'
const racine = $('#racine'); racine.className = 'relative min-h-dvh bg-bg text-text lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden'; document.title = 'Dépôt de pièces · Élan'
ui.set({ persona: 'experte' })
let fini = false
function rendre() {
  const st = pieces.get(), inv = st.invitation, revoque = !!inv?.revoquee, ids = inv && !revoque ? inv.pieces : PAR_DEFAUT
  racine.innerHTML = `<a href="#contenu" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>
  <header class="border-b border-border"><p id="bandeau" class="bg-text px-4 py-1.5 text-center text-xs text-bg" ${ui.get().bandeauMasque ? 'hidden' : ''}>Prototype, données fictives</p><div class="mx-auto flex h-16 max-w-[80rem] items-center justify-between px-4 sm:px-8">${logo('wordmark', 'h-7')}<div class="flex items-center gap-3">${boutonDemo()}${boutonProfil()}</div></div></header>
  <main id="contenu" class="mx-auto w-full max-w-[80rem] px-4 py-6 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"><div class="mb-4 inline-flex items-center gap-4 rounded-md border border-border bg-white px-4 py-3"><img src="/brand/cabinet-ledoux-logo.svg" alt="Cabinet Ledoux &amp; Associés" width="232" height="48" class="h-9 w-auto"><span class="hidden text-sm text-[#5f5a52] sm:inline">Expertise comptable</span></div><h1 tabindex="-1" class="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-tighter outline-none">Déposez les pièces de Fabienne M.</h1>
    <div class="mt-4 max-w-3xl">${banniere({ ton: 'info', titre: 'Vous avez été invitée par Fabienne M. à déposer des pièces pour sa demande.', corps: `Vous ne voyez que ces pièces : ni le montant, ni les réponses, ni le reste du dossier. <span class="tabular text-xs text-subtle">Lien ${esc(token)}</span>` })}</div>
    ${revoque ? `<div class="mt-6 max-w-3xl">${banniere({ ton: 'danger', titre: 'Accès révoqué', corps: 'Fabienne M. a retiré votre accès. Demandez-lui une nouvelle invitation.' })}</div>` : `<ul class="mt-6 grid gap-4 md:grid-cols-3">${ids.map((id) => { const p = pieceById(id), s = st.etat[id], depose = s.fichier && s.statut !== 'a-fournir' && s.statut !== 'attente-experte'; return `<li class="flex flex-col gap-3 rounded-card border border-border bg-surface p-5" data-piece="${id}"><h2 class="font-semibold tracking-tight">${esc(p.nom)}</h2><p class="text-sm text-muted">${esc(p.pourquoi)}</p>${depose ? ligneFichier({ nom: s.fichier.nom, taille: s.fichier.taille, statut: s.statut, progress: s.progress, message: s.verifie }) : zoneDepot(p.nom)}</li>` }).join('')}</ul>
    <div class="mt-6"><button type="button" id="terminer" ${fini ? 'aria-disabled="true"' : ''} class="${btn('primary', 'lg')}">${fini ? icon('check', 'size-5') + 'Terminé' : 'Terminer'}</button></div>`}</main>`
  document.querySelectorAll('[data-piece]').forEach((li) => brancherDepot(li, { onFile: (f) => deposer(li.dataset.piece, f.name, f.size, f), forceLourd: () => (pieces.get().erreur === 'fichier-lourd' ? 14900000 : 0) }))
  $('#terminer')?.addEventListener('click', () => { fini = true; toast({ title: 'Fabienne M. a été prévenue', description: 'Vos dépôts sont visibles dans sa demande.' }); rendre() })
  monterDemo()
}
let cle = ''; const empreinte = (s) => JSON.stringify([Object.fromEntries(Object.entries(s.etat).map(([k, v]) => [k, { ...v, progress: undefined }])), s.invitation])
pieces.sub((s) => { const k = empreinte(s); if (k !== cle) { cle = k; rendre() } })
cle = empreinte(pieces.get()); rendre()
