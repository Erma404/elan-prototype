// Socle partagé : sélecteurs, échappement, stores persistés, thème, annonces, toasts, dialogues natifs.
import { icon } from './icons.js'

export const $ = (s, r = document) => r.querySelector(s)
export const $$ = (s, r = document) => [...r.querySelectorAll(s)]
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
export const cn = (...p) => p.filter(Boolean).join(' ')
export const attend = (ms) => new Promise((r) => setTimeout(r, ms))

/** Store minimal persisté (localStorage ou sessionStorage), partagé entre les pages. */
export function creerStore(cle, initial, { session = false } = {}) {
  const zone = session ? sessionStorage : localStorage
  const lire = () => { try { return { ...initial(), ...JSON.parse(zone.getItem(cle) || '{}') } } catch { return initial() } }
  let etat = lire()
  const abonnes = new Set()
  const api = {
    get: () => etat,
    set(p) {
      etat = { ...etat, ...(typeof p === 'function' ? p(etat) : p) }
      try { zone.setItem(cle, JSON.stringify(etat)) } catch { /* stockage indisponible */ }
      abonnes.forEach((f) => f(etat))
    },
    reset() { api.set(initial()) },
    sub(f) { abonnes.add(f); return () => abonnes.delete(f) },
  }
  window.addEventListener('storage', (e) => { if (e.key === cle) { etat = lire(); abonnes.forEach((f) => f(etat)) } })
  return api
}

// ---------- Thème ----------
export function appliquerTheme() {
  let choix = 'system'
  try { choix = localStorage.getItem('elan:theme') || 'system' } catch { /* */ }
  const sombre = choix === 'dark' || (choix === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = sombre ? 'dark' : 'light'
}
export function reglerTheme(choix) { try { choix === 'system' ? localStorage.removeItem('elan:theme') : localStorage.setItem('elan:theme', choix) } catch { /* */ } appliquerTheme() }
appliquerTheme()
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', appliquerTheme)

// ---------- Annonces pour lecteurs d'écran ----------
export function annoncer(msg) {
  let r = $('#annonces')
  if (!r) { r = document.createElement('div'); r.id = 'annonces'; r.className = 'sr-only'; r.setAttribute('aria-live', 'polite'); document.body.append(r) }
  r.textContent = ''; setTimeout(() => { r.textContent = msg }, 30)
}

// ---------- Toasts discrets ----------
export function toast({ title, description }) {
  let z = $('.toasts')
  if (!z) { z = document.createElement('div'); z.className = 'toasts'; z.setAttribute('role', 'region'); z.setAttribute('aria-label', 'Notifications'); document.body.append(z) }
  const t = document.createElement('div')
  t.className = 'anim-toast flex items-start gap-3 rounded-md border border-border bg-surface p-4 shadow-lg'
  t.setAttribute('role', 'status')
  t.innerHTML = `${icon('clock', 'mt-0.5 size-4 shrink-0 text-muted')}<div class="flex-1"><p class="text-sm font-semibold">${esc(title)}</p>${description ? `<p class="mt-0.5 text-sm text-muted">${esc(description)}</p>` : ''}</div><button type="button" aria-label="Fermer" class="tr -m-2 grid size-11 cursor-pointer place-items-center rounded-sm text-muted hover:bg-bg-soft">${icon('x')}</button>`
  t.querySelector('button').onclick = () => t.remove()
  z.append(t); setTimeout(() => t.remove(), 4500)
}

// ---------- Dialogues et tiroirs natifs (<dialog> : piège de focus, Échap et retour du focus fournis par le navigateur) ----------
let compteur = 0
function creer(type, { titre, description, corps = '', pied = '', classe = '' }) {
  const id = `dlg-${++compteur}`
  const d = document.createElement('dialog')
  const entete = `<div class="flex items-start justify-between gap-4 p-6 pb-2"><div><h2 id="${id}-t" class="text-2xl font-semibold tracking-tight">${esc(titre)}</h2>${description ? `<p id="${id}-d" class="mt-1.5 text-muted">${esc(description)}</p>` : ''}</div><button type="button" data-fermer aria-label="Fermer" class="tr -m-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-sm text-muted hover:bg-bg-soft">${icon('x', 'size-5')}</button></div>`
  if (type === 'modale') {
    d.className = 'modale'
    d.innerHTML = `<div class="modale-corps">${entete}<div class="overflow-y-auto px-6 py-4">${corps}</div>${pied ? `<div class="flex flex-wrap justify-end gap-2 p-6 pt-2">${pied}</div>` : ''}</div>`
  } else {
    d.className = `tiroir ${classe}`
    const ia = classe.includes('ia')
    d.innerHTML = `<div class="tiroir-corps">${ia ? '<div class="ai-line h-0.5 shrink-0" aria-hidden="true"></div>' : ''}<div class="flex items-start justify-between gap-4 p-5 pb-3"><div><h2 id="${id}-t" class="text-xl font-semibold tracking-tight">${esc(titre)}</h2>${description ? `<p id="${id}-d" class="mt-1 text-sm ${ia ? 'text-[var(--color-ai-muted)]' : 'text-muted'}">${esc(description)}</p>` : ''}</div><button type="button" data-fermer aria-label="Fermer" class="tr -m-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-sm ${ia ? 'text-[var(--color-ai-muted)] hover:bg-white/10' : 'text-muted hover:bg-bg-soft'}">${icon('x', 'size-5')}</button></div><div class="flex min-h-0 flex-1 flex-col" data-corps>${corps}</div></div>`
  }
  d.setAttribute('aria-labelledby', `${id}-t`)
  if (description) d.setAttribute('aria-describedby', `${id}-d`)
  document.body.append(d)
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-fermer]')) d.close() })
  d.addEventListener('close', () => d.remove())
  d.ouvrir = () => { d.showModal(); return d }
  return d
}
export const modale = (o) => creer('modale', o)
export const tiroir = (o) => creer('tiroir', o)

// ---------- Boutons ----------
const VAR = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover', inverse: 'bg-bg text-text hover:bg-bg-soft',
  secondary: 'bg-surface text-text border border-border-strong hover:bg-bg-soft active:bg-border', ghost: 'bg-transparent text-text hover:bg-bg-soft active:bg-border',
  destructive: 'bg-danger text-accent-fg hover:opacity-90',
}
const TAILLE = { sm: 'h-10 px-4 text-sm', md: 'h-12 px-6 text-base', lg: 'h-14 px-8 text-lg' }
/** Classes d'un bouton (le HTML porte l'attribut `disabled` natif ou aria-disabled selon le besoin). */
export const btn = (v = 'primary', t = 'md', plus = '') => cn(`tr ${plus.split(' ').includes('hidden') ? '' : 'inline-flex'} cursor-pointer select-none items-center justify-center gap-2 rounded-md font-semibold tracking-tight [touch-action:manipulation] active:scale-[0.98] aria-disabled:cursor-not-allowed aria-disabled:opacity-45`, VAR[v], TAILLE[t], plus)

// Un bouton aria-disabled reste focalisable (la raison reste lisible) mais n'agit pas.
document.addEventListener('click', (e) => { const b = e.target.closest('[aria-disabled="true"]'); if (b) { e.preventDefault(); e.stopImmediatePropagation() } }, true)

// ---------- Badges de statut : icône et texte, jamais la couleur seule ----------
export const STATUTS = {
  'a-fournir': { label: 'À fournir', ic: 'circle-dashed', cls: 'bg-bg-soft text-muted' },
  envoi: { label: 'Envoi en cours', ic: 'loader-circle', cls: 'bg-accent-soft text-accent-text', spin: true },
  recue: { label: 'Reçue', ic: 'file-check', cls: 'bg-success-soft text-success' },
  'a-corriger': { label: 'À corriger', ic: 'triangle-alert', cls: 'bg-warning-soft text-warning' },
  verifiee: { label: 'Vérifiée', ic: 'shield-check', cls: 'bg-success-soft text-success' },
  'non-applicable': { label: 'Non applicable', ic: 'circle-minus', cls: 'bg-bg-soft text-muted' },
  'attente-experte': { label: 'En attente de l’experte-comptable', ic: 'user-round', cls: 'bg-accent-soft text-accent-text' },
}
export const badgeStatut = (s, label) => { const m = STATUTS[s]; return `<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium ${m.cls}">${icon(m.ic, `size-4${m.spin ? ' animate-[spin_0.8s_linear_infinite]' : ''}`)}${esc(label ?? m.label)}</span>` }
export const badge = (txt, ton = 'neutral') => `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${({ neutral: 'bg-bg-soft text-muted', accent: 'bg-accent-soft text-accent-text', success: 'bg-success-soft text-success', warning: 'bg-warning-soft text-warning', danger: 'bg-danger-soft text-danger', outline: 'border border-border-strong text-text' })[ton]}">${esc(txt)}</span>`
export const banniere = ({ ton = 'info', titre, corps = '', action = '' }) => {
  const m = { info: ['bg-accent-soft', 'info', 'text-accent-text'], success: ['bg-success-soft', 'circle-check', 'text-success'], warning: ['bg-warning-soft', 'triangle-alert', 'text-warning'], danger: ['bg-danger-soft', 'circle-x', 'text-danger'] }[ton]
  return `<div role="${ton === 'danger' || ton === 'warning' ? 'alert' : 'status'}" class="flex items-start gap-3 rounded-md p-4 text-sm ${m[0]}">${icon(m[1], `mt-0.5 size-5 shrink-0 ${m[2]}`)}<div class="flex-1">${titre ? `<p class="font-semibold">${esc(titre)}</p>` : ''}${corps ? `<div class="${titre ? 'mt-0.5 text-muted' : ''}">${corps}</div>` : ''}${action ? `<div class="mt-2">${action}</div>` : ''}</div></div>`
}
export const progression = (v, label, cls = '') => `<div role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(v)}" class="relative h-2 w-full overflow-hidden rounded-full bg-border ${cls}"><div class="h-full w-full origin-left rounded-full bg-accent transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)]" style="transform:scaleX(${Math.min(100, Math.max(0, v)) / 100})"></div></div>`
export const anneau = (v, taille, label, centre) => { const r = (taille - 10) / 2, c = 2 * Math.PI * r; return `<div role="progressbar" aria-label="${esc(label)}" aria-valuenow="${Math.round(v)}" aria-valuemin="0" aria-valuemax="100" class="relative grid shrink-0 place-items-center" style="width:${taille}px;height:${taille}px"><svg width="${taille}" height="${taille}" class="-rotate-90" aria-hidden="true"><circle cx="${taille / 2}" cy="${taille / 2}" r="${r}" fill="none" stroke="var(--color-border)" stroke-width="6"/><circle cx="${taille / 2}" cy="${taille / 2}" r="${r}" fill="none" stroke="var(--color-accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v / 100)}" class="transition-[stroke-dashoffset] duration-[var(--duration-slow)] ease-[var(--ease-out)]"/></svg><div class="tabular absolute text-center text-sm font-semibold">${centre}</div></div>` }

/** Pictogramme du jeu fourni (trait épais) coloré par le texte courant grâce à un masque. */
export const pictogramme = (nom, classe = 'size-5') => `<span aria-hidden="true" class="inline-block shrink-0 bg-current ${classe}" style="-webkit-mask:url(/icons/${nom}.svg) center/contain no-repeat;mask:url(/icons/${nom}.svg) center/contain no-repeat"></span>`
