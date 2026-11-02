// Écran de bienvenue par profil : « Bonjour Fabienne », « Bonjour Nicolas », puis on démarre le parcours.
import { $, esc, btn } from './core.js'
import { icon } from './icons.js'
import { logo } from './shell.js'
import { monterDemo, boutonDemo } from './demo.js'
import { ui, demande, pieces } from './state.js'
import { complete, PIECES } from './pieces.js'

const PROFILS = {
  fabienne: { salut: 'Bonjour Fabienne.', texte: 'Vous voulez un four deux fois plus grand pour votre atelier de céramique. Voyons si un financement vous correspond, puis préparons votre dossier ensemble.', cta: 'Commencer ma demande', url: '/eligibilite', nom: 'Fabienne', role: 'Dirigeante, atelier de céramique' },
  nicolas: { salut: 'Bonjour Nicolas.', texte: 'Des dossiers vous attendent. Les plus complets sont en haut de votre file, avec ce qu’il reste à vérifier.', cta: 'Voir mes dossiers', url: '/pro/dossiers/argile', nom: 'Nicolas', role: 'Chargé d’affaires, instruit les demandes' },
  experte: { salut: 'Bonjour.', texte: 'Fabienne M. vous a invitée à déposer des pièces pour sa demande. Vous ne voyez que ces pièces, jamais le reste du dossier.', cta: 'Déposer les pièces', url: '/expert/demo', nom: 'Experte-comptable', role: 'Invitée par Fabienne pour déposer des pièces' },
}
const racine = $('#racine'); racine.className = 'relative flex min-h-dvh flex-col bg-bg text-text'; document.title = 'Bonjour · Élan'
function rendre() {
  const id = ui.get().persona in PROFILS ? ui.get().persona : 'fabienne', p = PROFILS[id]
  const commence = id === 'fabienne' && (Object.keys(pieces.get().etat).some((k) => complete(pieces.get().etat[k].statut)) || demande.get().step > 0)
  racine.innerHTML = `<a href="#contenu" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>
  <header class="mx-auto flex h-20 w-full max-w-[88rem] items-center justify-between px-5 sm:px-8"><a href="/" aria-label="Élan, accueil">${logo('wordmark', 'h-8')}</a><div class="flex items-center gap-2">${boutonDemo()}</div></header>
  <main id="contenu" class="mx-auto flex w-full max-w-[64rem] flex-1 flex-col justify-center px-5 pb-16 sm:px-8"><p class="eyebrow">Bienvenue</p>
    <h1 tabindex="-1" class="mt-6 text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-[1.02] tracking-[-0.03em] outline-none">${esc(p.salut)}</h1><p class="mt-6 max-w-2xl text-xl leading-relaxed text-muted">${esc(p.texte)}</p>
    <div class="mt-9 flex flex-wrap items-center gap-4"><a href="${p.url}" class="${btn('primary', 'lg')}">${commence ? 'Reprendre ma demande' : esc(p.cta)}${icon('arrow-right', 'size-5')}</a>${commence ? `<a href="/eligibilite" class="${btn('ghost', 'lg')}">Recommencer</a>` : ''}</div>
    <fieldset class="mt-16 max-w-3xl"><legend class="eyebrow before:!hidden">Qui êtes-vous ?</legend><div class="mt-4 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Profil">${Object.entries(PROFILS).map(([k, v]) => `<button type="button" role="radio" aria-checked="${k === id}" data-profil-choix="${k}" class="tr flex min-h-20 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-md border px-4 py-3 text-left ${k === id ? 'border-accent bg-accent-soft outline outline-1 outline-accent' : 'border-border bg-surface hover:bg-bg-soft'}"><span class="font-semibold tracking-tight">${esc(v.nom)}</span><span class="text-sm leading-snug text-muted">${esc(v.role)}</span></button>`).join('')}</div></fieldset></main>
  <footer class="px-5 py-6 text-center sm:px-8"><p class="text-sm text-muted">Prototype, données fictives</p></footer>`
  monterDemo()
}
document.addEventListener('click', (e) => { const c = e.target.closest('[data-profil-choix]'); if (c && racine.contains(c) && !c.closest('dialog')) { ui.set({ persona: c.dataset.profilChoix }); rendre(); $(`[data-profil-choix="${c.dataset.profilChoix}"]`)?.focus(); $('h1').removeAttribute('tabindex') } })
rendre(); setTimeout(() => $('h1')?.focus({ preventScroll: true }), 80)
void PIECES
