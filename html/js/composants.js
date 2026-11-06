// Composants partagés par plusieurs pages : exemple de document, ligne de fichier, zone de dépôt.
import { esc, btn, $ } from './core.js'
import { icon } from './icons.js'
import { badgeStatut, progression } from './core.js'
import { tailleFichier } from './state.js'

export const documentExemple = (p) => `<figure class="w-full max-w-[13.5rem] justify-self-end" aria-label="Exemple : ${esc(p.exemple.titre)}"><div class="rounded-md border border-border bg-surface p-3"><p class="truncate text-xs font-semibold">${esc(p.exemple.titre)}</p><div aria-hidden="true" class="mt-2 space-y-1"><div class="h-1 w-2/3 rounded-full bg-border"></div><div class="h-1 w-1/2 rounded-full bg-border"></div></div><ul class="tabular mt-3 space-y-0.5 text-[0.6875rem] leading-snug text-muted">${p.exemple.lignes.slice(0, 3).map((l) => `<li class="truncate">${esc(l)}</li>`).join('')}</ul><div aria-hidden="true" class="mt-3 space-y-1"><div class="h-1 w-full rounded-full bg-bg-soft"></div><div class="h-1 w-4/5 rounded-full bg-bg-soft"></div></div></div><figcaption class="mt-1.5 text-center text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-subtle">Exemple de document</figcaption></figure>`

export const ligneFichier = ({ nom, taille, statut, progress, message, actions = '' }) => `<div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 rounded-md border border-border bg-surface p-3"><span class="grid size-10 shrink-0 place-items-center rounded-sm bg-bg-soft">${icon('file-text', 'size-5 text-muted')}</span><div class="min-w-0"><p class="truncate font-medium" title="${esc(nom)}">${esc(nom)}</p><p class="tabular text-sm leading-snug text-muted">${taille ? tailleFichier(taille) : ''}${message ? `${taille ? ' · ' : ''}${esc(message)}` : ''}</p></div>${badgeStatut(statut)}${statut === 'envoi' && typeof progress === 'number' ? `<div id="progression-fichier" class="col-span-3">${progression(progress, `Envoi de ${nom}`)}</div>` : ''}${actions ? `<div class="col-span-3 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-2.5">${actions}</div>` : ''}</div>`

const FORMATS = ['application/pdf', 'image/jpeg', 'image/png']
export function valider(f, forceLourd) {
  if (forceLourd) return `Fichier trop lourd : ${tailleFichier(forceLourd)} pour 10 Mo au plus. Rien n’est perdu, choisissez une version plus légère.`
  if (!FORMATS.includes(f.type)) return 'Format refusé. Déposez un PDF, un JPG ou un PNG de 10 Mo au plus.'
  if (f.size > 10 * 1024 * 1024) return `Fichier trop lourd : ${tailleFichier(f.size)} pour 10 Mo au plus. Rien n’est perdu, choisissez une version plus légère.`
  return null
}
/** Zone de dépôt compacte : glisser-déposer, clic, clavier et photo (mobile). */
export const zoneDepot = (label) => `<div data-depot><div data-zone class="tr flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-dashed border-border-strong bg-surface px-4 py-2.5">${icon('upload', 'size-5 shrink-0 text-muted')}<p class="min-w-[11rem] flex-1 text-sm text-muted"><span class="font-medium text-text">Glissez le fichier ici</span> ou choisissez-le. PDF, JPG, PNG, 10 Mo.</p><div class="flex flex-wrap justify-center gap-2"><button type="button" data-choisir class="${btn('secondary', 'sm')}">Choisir un fichier<span class="sr-only"> pour ${esc(label)}</span></button><button type="button" data-photo class="${btn('ghost', 'sm')}">${icon('camera')}Photo<span class="sr-only"> pour ${esc(label)}</span></button></div><input type="file" data-fichier accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" class="sr-only" tabindex="-1" aria-hidden="true"><input type="file" data-camera accept="image/*" capture="environment" class="sr-only" tabindex="-1" aria-hidden="true"></div><p data-erreur-depot role="alert" class="mt-2 text-sm font-medium text-danger" hidden></p></div>`
export function brancherDepot(racine, { onFile, onMulti, forceLourd = () => 0 }) {
  $$z(racine).forEach((d) => {
    const zone = d.querySelector('[data-zone]'), err = d.querySelector('[data-erreur-depot]')
    const prendre = (f) => { if (!f) return; const pb = valider(f, forceLourd()); if (pb) { err.innerHTML = `${esc(pb)} <a href="https://www.ilovepdf.com/fr/jpg_en_pdf" target="_blank" rel="noreferrer" class="underline underline-offset-2">Convertir mon fichier</a>`; err.hidden = false; return } err.hidden = true; onFile(f) }
    d.querySelector('[data-choisir]').onclick = () => d.querySelector('[data-fichier]').click()
    d.querySelector('[data-photo]').onclick = () => d.querySelector('[data-camera]').click()
    for (const s of ['[data-fichier]', '[data-camera]']) d.querySelector(s).onchange = (e) => { prendre(e.target.files[0]); e.target.value = '' }
    zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('border-accent', 'bg-accent-soft') }
    zone.ondragleave = () => zone.classList.remove('border-accent', 'bg-accent-soft')
    zone.ondrop = (e) => { e.preventDefault(); zone.classList.remove('border-accent', 'bg-accent-soft'); if (e.dataTransfer.files.length > 1 && onMulti) return onMulti([...e.dataTransfer.files]); prendre(e.dataTransfer.files[0]) }
  })
}
const $$z = (r) => [...r.querySelectorAll('[data-depot]')]

/** Chronologie : étapes faites, en cours, à venir. */
export const chronologie = (items) => `<ol class="flex flex-col">${items.map((it, i) => `<li class="relative flex gap-4 pb-6 last:pb-0" ${it.etat === 'current' ? 'aria-current="step"' : ''}>${i < items.length - 1 ? '<span aria-hidden="true" class="absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px bg-border"></span>' : ''}<span aria-hidden="true" class="relative mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-accent-fg ${it.etat === 'done' ? 'border-success bg-success' : it.etat === 'current' ? 'border-accent bg-surface' : 'border-border-strong bg-surface'}">${it.etat === 'done' ? icon('check', 'size-3.5') : it.etat === 'current' ? '<span class="size-2 rounded-full bg-accent"></span>' : ''}</span><div class="min-w-0 flex-1"><p class="font-medium">${esc(it.titre)}${it.etat === 'done' ? '<span class="sr-only"> (terminé)</span>' : it.etat === 'current' ? '<span class="sr-only"> (en cours)</span>' : ''}</p>${it.detail ? `<p class="mt-0.5 text-sm text-muted">${esc(it.detail)}</p>` : ''}${it.time ? `<p class="tabular mt-0.5 text-xs text-subtle">${esc(it.time)}</p>` : ''}</div></li>`).join('')}</ol>`
