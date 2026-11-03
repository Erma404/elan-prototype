// Coque commune : en-tête, progression, montant souhaité, aide, bandeau « données fictives », panneau de démo.
import { $, esc, modale, btn } from './core.js'
import { icon } from './icons.js'
import { LOGO } from './logo-data.js'
import { demande, ui, reinitialiser, eur } from './state.js'
import { monterDemo, boutonDemo, boutonProfil } from './demo.js'

export const logo = (type = 'wordmark', classe = 'h-7') => { const l = LOGO[type]; return `<svg viewBox="${l.vb}" role="img" aria-label="Élan" class="w-auto ${classe}" fill="none">${l.inner.replaceAll('{INK}', 'currentColor').replaceAll('{ACC}', 'var(--color-accent)')}</svg>` }

const ETAPES = ['Éligibilité', 'Pièces', 'Envoi']
function stepper(courant) {
  return `<ol class="flex items-center gap-2 text-sm">${ETAPES.map((s, i) => {
    const etat = i < courant ? 'done' : i === courant ? 'current' : 'todo'
    const rond = etat === 'done' ? 'bg-success text-accent-fg' : etat === 'current' ? 'bg-text text-bg' : 'border border-border-strong text-muted'
    return `<li ${etat === 'current' ? 'aria-current="step"' : ''} class="flex items-center gap-2"><span class="tabular grid size-6 place-items-center rounded-full text-xs font-semibold ${rond}">${etat === 'done' ? icon('check', 'size-3.5') : i + 1}</span><span class="hidden sm:inline ${etat === 'current' ? 'font-semibold' : 'text-muted'}">${s}</span><span class="sr-only sm:hidden">${s}${etat === 'done' ? ' (terminé)' : etat === 'current' ? ' (en cours)' : ''}</span>${i < ETAPES.length - 1 ? '<span aria-hidden="true" class="h-px w-4 bg-border-strong sm:w-8"></span>' : ''}</li>`
  }).join('')}</ol>`
}
const montantHtml = () => { const m = demande.get().answers.montant; return m !== undefined ? eur(m) : '<span class="whitespace-nowrap text-base font-normal text-subtle">à préciser</span>' }

/** Monte la coque et renvoie l'élément <main> à remplir. `fit` verrouille la page à la hauteur de la fenêtre (≥ 1024 px). */
export function monterCoque({ step, fit = true, wide = true, titre }) {
  ui.set({ persona: 'fabienne' })
  if (titre) document.title = `${titre} · Élan`
  const racine = $('#racine')
  racine.className = `relative bg-bg text-text ${fit ? 'min-h-dvh lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden' : 'min-h-dvh'}`
  racine.innerHTML = `
    <a href="#contenu" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>
    <header class="sticky top-0 z-[var(--z-header)] border-b border-border bg-bg/90 backdrop-blur-sm">
      <p id="bandeau" class="tabular bg-text px-4 py-1.5 text-center text-xs text-bg">Prototype, données fictives</p>
      <div class="mx-auto grid h-16 max-w-[88rem] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-8">
        <a href="/" aria-label="Élan, accueil">${logo('wordmark', 'h-7')}</a>
        <nav aria-label="Progression de la demande" class="hidden justify-center sm:flex">${stepper(step)}</nav><span class="sm:hidden"></span>
        <div class="flex items-center gap-3">
          <p id="montant-entete" class="hidden items-center gap-3 rounded-md border border-border bg-surface px-4 py-1.5 md:flex" aria-label="Montant souhaité"><span class="eyebrow !tracking-[0.1em] before:!hidden">Montant souhaité</span><span class="tabular text-2xl font-bold leading-none tracking-tighter" data-montant>${montantHtml()}</span></p>
          ${boutonDemo()}
          <button type="button" id="reinit" class="${btn('ghost', 'sm', 'hidden sm:inline-flex')}">Réinitialiser</button>
          <button type="button" id="aide" class="${btn('ghost', 'sm')}" aria-label="Aide">${icon('life-buoy')}<span class="hidden sm:inline">Aide</span></button>
          ${boutonProfil()}
        </div>
      </div>
      <div id="montant-mobile" class="flex items-center justify-between gap-3 border-t border-border bg-bg-soft px-4 py-2 md:hidden"><nav aria-label="Progression de la demande" class="sm:hidden">${stepper(step)}</nav><p class="ml-auto flex items-center gap-3" aria-label="Montant souhaité"><span class="eyebrow !tracking-[0.1em] before:!hidden">Montant souhaité</span><span class="tabular text-xl font-bold leading-none tracking-tighter" data-montant>${montantHtml()}</span></p></div>
    </header>
    <main id="contenu" class="mx-auto w-full px-4 sm:px-8 ${fit ? 'pb-20 pt-5 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:pb-4' : 'pb-24 pt-8 sm:pt-12'} ${wide ? 'max-w-[96rem]' : 'max-w-[80rem]'}"></main>
    <footer class="border-t border-border ${fit ? 'lg:hidden' : ''}"><p class="mx-auto flex max-w-[88rem] items-center gap-2 px-4 py-5 text-sm text-muted sm:px-8">${icon('shield-check', 'size-4 shrink-0')}Vos documents sont hébergés en France, chiffrés, et ne servent jamais à entraîner une IA.</p></footer>`
  const majMasque = () => { $('#bandeau').hidden = ui.get().bandeauMasque }
  majMasque(); ui.sub(majMasque)
  demande.sub(() => document.querySelectorAll('[data-montant]').forEach((e) => { e.innerHTML = montantHtml() }))
  $('#reinit').onclick = () => { reinitialiser(); location.href = '/bonjour' }
  $('#aide').onclick = () => modale({ titre: 'Besoin d’aide ?', description: 'Un conseiller Élan répond du lundi au vendredi, de 9 h à 18 h.', corps: `<ul class="flex flex-col gap-3"><li><span class="font-semibold">Une question sur une pièce ?</span> Ouvrez la pièce, l’assistant vous répond.</li><li><span class="font-semibold">Un doute sur votre éligibilité ?</span> Un conseiller regarde votre situation avec vous.</li><li class="tabular text-sm text-muted">01 80 00 00 00 · appel gratuit</li></ul>`, pied: `<button type="button" data-fermer class="${btn('secondary')}">Fermer</button>` }).ouvrir()
  monterDemo()
  const main = $('#contenu'); const h1 = () => $('h1', main)
  queueMicrotask(() => setTimeout(() => { const t = h1(); if (t) { t.tabIndex = -1; t.classList.add('outline-none'); t.focus({ preventScroll: true }) } }, 80))
  return main
}
