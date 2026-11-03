// Écran de bienvenue par profil : « Bonjour Fabienne », « Bonjour Nicolas », puis on démarre le parcours.
import { $, esc, btn } from './core.js'
import { icon } from './icons.js'
import { logo } from './shell.js'
import { monterDemo, boutonDemo, boutonProfil, avatar } from './demo.js'
import { ui, demande, pieces } from './state.js'
import { complete, PIECES } from './pieces.js'

const PROFILS = {
  fabienne: { salut: 'Bonjour Fabienne.', texte: 'Prête à démarrer votre demande ?', cta: 'Commencer ma demande', url: '/eligibilite', nom: 'Fabienne', role: 'Dirigeante, atelier de céramique' },
  nicolas: { salut: 'Bonjour Nicolas.', texte: 'Vos dossiers vous attendent.', cta: 'Voir mes dossiers', url: '/pro/dossiers', nom: 'Nicolas', role: 'Chargé d’affaires, instruit les demandes' },
  experte: { salut: 'Bonjour.', texte: 'Fabienne M. vous a invitée à déposer des pièces.', cta: 'Déposer les pièces', url: '/expert/demo', nom: 'Experte-comptable', role: 'Invitée par Fabienne pour déposer des pièces' },
}
if (new URLSearchParams(location.search).has('depuis-accueil')) { ui.set({ persona: 'fabienne' }); history.replaceState(null, '', '/bonjour') }
const racine = $('#racine'); racine.className = 'relative flex min-h-dvh flex-col bg-bg text-text'; document.title = 'Bonjour · Élan'
function rendre() {
  const id = ui.get().persona in PROFILS ? ui.get().persona : 'fabienne', p = PROFILS[id]
  const commence = id === 'fabienne' && (Object.keys(pieces.get().etat).some((k) => complete(pieces.get().etat[k].statut)) || demande.get().step > 0)
  racine.innerHTML = `<a href="#contenu" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>
  <header class="mx-auto flex h-20 w-full max-w-[88rem] items-center justify-between px-5 sm:px-8"><a href="/" aria-label="Élan, accueil">${logo('wordmark', 'h-8')}</a><div class="flex items-center gap-2">${boutonDemo()}${boutonProfil()}</div></header>
  <main id="contenu" class="mx-auto flex w-full max-w-[64rem] flex-1 flex-col justify-center px-5 pb-16 sm:px-8">${avatar(id, 'size-20')}<p class="eyebrow mt-6">Bienvenue</p>
    <h1 tabindex="-1" class="mt-6 text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-[1.02] tracking-[-0.03em] outline-none">${esc(p.salut)}</h1><p class="mt-6 max-w-2xl text-xl leading-relaxed text-muted">${esc(p.texte)}</p>
    <div class="mt-9 flex flex-wrap items-center gap-4"><a href="${p.url}" class="${btn('primary', 'lg')}">${commence ? 'Reprendre ma demande' : esc(p.cta)}${icon('arrow-right', 'size-5')}</a>${commence ? `<a href="/eligibilite" class="${btn('ghost', 'lg')}">Recommencer</a>` : ''}</div>
</main>
  <footer class="px-5 py-6 text-center sm:px-8"><p class="text-sm text-muted">Prototype, données fictives</p></footer>`
  monterDemo()
}
rendre(); setTimeout(() => $('h1')?.focus({ preventScroll: true }), 80)
void PIECES
