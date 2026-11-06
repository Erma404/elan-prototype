// Écran 1 : pré-éligibilité. Une question à la fois, pas à pas (aucune avance automatique).
import { $, $$, esc, btn, modale, toast, pictogramme } from './core.js'
import { icon } from './icons.js'
import { monterCoque } from './shell.js'
import { demande, setReponse, suivre, eur } from './state.js'
import { QUESTIONS } from './questions.js'
import { retenus, ecartes, leCritereManquant, explicationTete, alternatives, REFERENTIEL } from './engine.js'

const TOTAL = QUESTIONS.length
// « Recommencer » depuis l’écran Bonjour : réponses effacées, retour à la question 1.
if (new URLSearchParams(location.search).has('recommencer')) { demande.set({ answers: {}, step: 0, financementId: null }); history.replaceState(null, '', '/eligibilite') }
const main = monterCoque({ step: 0, titre: 'Éligibilité' })
const S = () => demande.get()
const complet = () => QUESTIONS.every((q) => S().answers[q.key] !== undefined)
const demarre = () => { try { if (!sessionStorage.getItem('elan:demarre')) { suivre('eligibilite_demarree'); sessionStorage.setItem('elan:demarre', '1') } } catch { /* */ } }
const vue = () => (S().step >= TOTAL && complet() ? 'resultat' : 'question')

// ---------- Panneau « Financements possibles » (mis à jour sans recharger la colonne de gauche) ----------
function panneau() {
  const a = S().answers, n = Object.keys(a).length, liste = retenus(a), sorties = ecartes(a).length
  const pourquoi = n > 0 && liste.length === 0 ? leCritereManquant(a) : null
  const texte = n === 0 ? 'à confirmer avec vos réponses' : liste.length > 1 ? 'financements correspondent pour l’instant' : liste.length === 1 ? 'financement correspond pour l’instant' : 'financement ne correspond pour l’instant'
  return `<div class="flex max-h-full flex-col overflow-y-auto rounded-card bg-bg-soft p-5 sm:p-6"><p class="eyebrow">Financements possibles</p>
    <div class="mt-5 flex items-end gap-3" aria-live="polite"><span class="tabular text-6xl font-bold leading-none tracking-tighter">${liste.length}</span><p class="pb-1.5 text-lg leading-tight text-muted">${texte}</p></div>
    <ul class="mt-5 flex flex-col gap-2.5">${liste.map((e) => `<li class="anim-fade rounded-md border border-border bg-surface p-3.5"><div class="flex items-start justify-between gap-3"><p class="font-semibold tracking-tight">${esc(e.financement.nom)}</p>${e.statut === 'possible' ? `<span class="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-success">${icon('circle-check')}Correspond</span>` : `<span class="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted">${icon('circle-question-mark')}À confirmer</span>`}</div><p class="mt-1 text-sm text-muted">${esc(e.financement.resume)}</p><p class="tabular mt-3 text-sm text-muted">${esc(e.financement.montantIndicatif)}</p></li>`).join('')}</ul>
    ${pourquoi ? `<div class="mt-5 rounded-md bg-surface p-4 text-sm" role="status"><p class="font-semibold">Pourquoi aucun résultat ?</p><p class="mt-1 text-muted">Le plus proche de votre situation est ${esc(pourquoi.financement.nom)}.</p><ul class="mt-2 flex flex-col gap-1">${pourquoi.manque.map((m) => `<li class="text-muted">${esc(m.raison)}</li>`).join('')}</ul><p class="mt-2 font-medium">Ajustez votre réponse : ce panneau se met à jour.</p></div>` : sorties > 0 ? `<p class="mt-4 text-sm text-muted">${sorties} ${sorties > 1 ? 'financements écartés' : 'financement écarté'} d’après vos réponses.</p>` : ''}</div>`
}
const majPanneau = () => { const p = $('#panneau'); if (p) p.innerHTML = panneau() }
demande.sub(() => { majPanneau() })

// ---------- Question ----------
const carte = (o, i, sel) => `<button type="button" role="radio" aria-checked="${sel}" data-choix="${i}" class="tr flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-md border px-4 py-2.5 text-left active:scale-[0.99] ${sel ? 'border-accent bg-accent-soft shadow-sm outline outline-1 outline-accent' : 'border-border bg-surface hover:border-border-strong hover:bg-bg-soft'}">
  ${o.icon ? `<span class="grid size-10 shrink-0 place-items-center rounded-sm bg-bg-soft text-text">${pictogramme(o.icon, 'size-5')}</span>` : ''}
  <span class="flex-1"><span class="block font-semibold tracking-tight">${esc(o.label)}</span>${o.description ? `<span class="mt-0.5 block text-sm leading-snug text-muted">${esc(o.description)}</span>` : ''}</span>
  <kbd aria-hidden="true" class="tabular hidden size-7 place-items-center rounded-sm border border-border-strong text-sm text-muted sm:grid">${i + 1}</kbd>
  <span aria-hidden="true" class="tr grid size-6 shrink-0 place-items-center rounded-full border ${sel ? 'border-accent bg-accent text-accent-fg' : 'border-border-strong'}">${sel ? icon('check', 'size-4') : ''}</span></button>`

function question() {
  const { step, answers } = S(), q = QUESTIONS[Math.min(step, TOTAL - 1)]
  const barre = QUESTIONS.map((x, i) => `<span class="h-1 flex-1 rounded-full tr ${i <= step ? 'bg-text' : 'bg-border'}"></span>`).join('')
  let corps
  if (q.kind === 'choice') {
    corps = `<div role="radiogroup" aria-labelledby="question" class="mt-4 flex flex-col gap-2">${q.options.map((o, i) => carte(o, i, answers[q.key] === o.value)).join('')}</div>
      <div class="mt-4 flex flex-wrap items-center gap-4"><button type="button" id="continuer" data-continuer class="${btn('primary', 'md')}" ${answers[q.key] === undefined ? 'aria-disabled="true" title="Choisissez une réponse pour continuer."' : ''}>Continuer</button><p class="hidden text-sm text-subtle sm:block">Entrée pour valider, touches 1 à ${q.options.length} pour choisir.</p></div>`
  } else {
    const m = answers.montant
    corps = `<div class="mt-4"><p class="tabular text-[clamp(2.5rem,5vw,3.75rem)] font-bold leading-none tracking-tighter"><output id="montant-sortie" aria-live="polite">${m === undefined ? '<span class="text-subtle">— €</span>' : eur(m)}</output></p>
      <div class="mt-3"><label for="jauge" class="sr-only">Montant recherché</label><input id="jauge" type="range" min="${q.min}" max="${q.max}" step="${q.step}" value="${m ?? q.min}" class="jauge-plage ${m === undefined ? 'neutre' : ''}" style="--p:${(((m ?? q.min) - q.min) / (q.max - q.min)) * 100}%" aria-valuetext="${m === undefined ? 'Aucun montant choisi' : eur(m)}" /></div>
      <div class="mt-1 flex flex-wrap items-center gap-2" role="group" aria-label="Montants courants">${q.presets.map((v) => `<button type="button" data-preset="${v}" aria-pressed="${m === v}" class="tr inline-flex min-h-9 cursor-pointer items-center rounded-full border px-3.5 text-sm font-medium hover:bg-bg-soft aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:text-accent-text border-border-strong bg-surface">${eur(v)}</button>`).join('')}</div>
      <div class="mt-3 max-w-xs"><label for="saisie" class="text-sm font-medium">Ou saisissez le montant exact</label><div class="relative mt-1.5"><input id="saisie" inputmode="numeric" autocomplete="off" placeholder="Montant en euros" value="${m ?? ''}" class="tr tabular h-11 w-full rounded-sm border border-border-strong bg-surface px-3.5 pr-9 text-base text-text placeholder:text-subtle hover:border-text"><span aria-hidden="true" class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">€</span></div></div>
      <div class="mt-4"><button type="button" id="continuer" data-continuer class="${btn('primary', 'lg')}" ${m === undefined ? 'aria-disabled="true"' : ''}>Continuer</button><p id="raison-montant" class="mt-2 text-sm text-muted" ${m === undefined ? '' : 'hidden'}>Choisissez ou saisissez un montant pour continuer.</p></div></div>`
  }
  return `<div class="grid h-full min-h-0 gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
    <section aria-labelledby="question" class="flex min-h-0 min-w-0 max-w-2xl flex-col"><div class="flex items-center justify-between gap-4"><p class="eyebrow" aria-live="polite"><span class="tabular">${step + 1} sur ${TOTAL}</span></p>${step > 0 ? `<button type="button" data-retour class="${btn('ghost', 'sm')}">${icon('arrow-left')}Retour</button>` : ''}</div>
      <div role="progressbar" aria-label="Progression du test" aria-valuemin="1" aria-valuemax="${TOTAL}" aria-valuenow="${step + 1}" class="mt-3 flex gap-1.5">${barre}</div>
      <h1 id="question" tabindex="-1" class="mt-5 text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold leading-[1.08] tracking-tighter outline-none">${esc(q.titre)}</h1><p class="mt-1.5 text-base text-muted">${esc(q.aide)}</p>${corps}</section>
    <aside id="panneau" aria-label="Financements possibles" class="min-h-0 lg:h-full">${panneau()}</aside></div>`
}

// ---------- Résultat ----------
function resultat() {
  const a = S().answers, liste = retenus(a).filter((e) => e.statut === 'possible'), out = ecartes(a), proche = liste.length === 0 ? leCritereManquant(a) : null
  const vedette = (e) => `<article class="rise relative overflow-hidden rounded-card border border-border bg-surface p-6 shadow-md sm:p-8" style="--i:0">
      <div class="flex items-center gap-4"><span aria-hidden="true" class="pop-check grid size-14 shrink-0 place-items-center rounded-full bg-accent text-accent-fg"><svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path class="trace" pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><p class="text-sm font-semibold text-accent-text">Le plus adapté à votre projet</p></div>
      <h2 class="mt-5 text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.05] tracking-tighter">${esc(e.financement.nom)}</h2><p class="mt-2 max-w-lg text-base text-muted">${esc(e.financement.resume)}</p>
      <dl class="mt-6 grid grid-cols-1 gap-4 border-y border-border py-5 sm:grid-cols-2 sm:gap-8"><div><dt class="text-sm text-muted">Montant indicatif</dt><dd class="tabular mt-1 text-xl font-semibold leading-snug tracking-tight">${esc(e.financement.montantIndicatif)}</dd></div><div><dt class="text-sm text-muted">Délai</dt><dd class="tabular mt-1 text-xl font-semibold leading-snug tracking-tight">${esc(e.financement.delai)}</dd></div></dl>
      <h3 class="mt-5 text-sm font-semibold">Pourquoi il vous correspond</h3><ul class="mt-3 flex flex-wrap gap-2">${e.criteres.map((c, k) => `<li class="rise inline-flex items-center gap-1.5 rounded-full bg-bg-soft px-3 py-1.5 text-sm" style="--i:${k + 2}"><span aria-hidden="true" class="grid size-4 place-items-center rounded-full bg-text text-bg">${icon('check', 'size-2.5')}</span>${esc(c.label)}<span class="sr-only"> (rempli)</span></li>`).join('')}</ul>
      <button type="button" data-commencer="${esc(e.financement.id)}" class="${btn('primary', 'lg', 'mt-7 w-full sm:w-auto')}">Commencer ma demande${icon('arrow-right', 'size-5')}</button></article>`
  const secondaire = (e, i) => `<article class="rise flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-card border border-border bg-surface p-5" style="--i:${i + 1}"><div class="min-w-0"><h2 class="text-lg font-semibold tracking-tight">${esc(e.financement.nom)}</h2><p class="mt-0.5 text-sm text-muted">${esc(e.financement.montantIndicatif)} · ${esc(e.financement.delai)}</p></div><button type="button" data-commencer="${esc(e.financement.id)}" class="${btn('secondary')}">Commencer ma demande${icon('arrow-right', 'size-5')}</button></article>`
  const cartes = liste.map((e, i) => `<li>${i === 0 ? vedette(e) : secondaire(e, i)}</li>`).join('')
  const vide = `<div class="rounded-card border border-border bg-surface p-5 sm:p-6"><h2 class="text-lg font-semibold tracking-tight">Ce qu’il faudrait pour devenir éligible</h2>${proche ? `<p class="mt-1 text-sm text-muted">Le plus proche de votre situation : <span class="font-medium text-text">${esc(proche.financement.nom)}</span>.</p><ul class="mt-3 flex flex-col gap-2">${proche.manque.map((m) => `<li class="rounded-md bg-bg-soft px-4 py-3"><p class="text-sm font-medium">${esc(m.label)}</p><p class="text-sm text-muted">${esc(m.raison)}</p></li>`).join('')}</ul>` : ''}<div class="mt-4"><button type="button" data-modifier class="${btn('secondary', 'sm')}">Modifier mes réponses</button></div></div>
    <div class="rounded-card border border-border bg-surface p-5 sm:p-6"><h2 class="text-lg font-semibold tracking-tight">D’autres pistes</h2><ul class="mt-3 flex flex-col gap-3">${alternatives.map((x) => `<li><p class="text-sm font-medium">${esc(x.nom)}</p><p class="text-sm text-muted">${esc(x.texte)}</p></li>`).join('')}</ul><div class="mt-4"><button type="button" data-conseiller class="${btn('primary', 'sm')}">${icon('phone')}Parler à un conseiller</button></div></div>`
  return `<div class="grid h-full min-h-0 gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
    <section class="flex min-h-0 flex-col gap-5 max-lg:contents lg:overflow-y-auto" aria-labelledby="resultat">
      <h1 id="resultat" tabindex="-1" class="max-lg:order-1 text-[clamp(1.875rem,3.2vw,2.875rem)] font-bold leading-[1.06] tracking-tighter outline-none">${liste.length > 0 ? `${liste.length === 1 ? '1 financement correspond' : `${liste.length} financements correspondent`} à votre projet.` : 'Aucun financement ne correspond pour l’instant.'}</h1>
      <div class="bg-ai rounded-md p-4 max-lg:order-3 text-[var(--color-ai-text)]"><p class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ai-accent)]"><span aria-hidden="true" class="ai-line h-0.5 w-4 rounded-full"></span>Assistant Élan, généré par IA</p><p class="text-base leading-relaxed">${esc(explicationTete(a))}</p><p class="mt-3 border-t border-[var(--color-ai-border)] pt-2 text-xs text-[var(--color-ai-muted)]">Source : ${esc(REFERENTIEL)}</p></div>
      ${out.length ? `<details class="accordeon max-lg:order-3 rounded-card border border-border bg-surface"><summary class="tr flex min-h-14 items-center justify-between gap-3 rounded-card px-5 py-3 hover:bg-bg-soft"><span class="font-semibold">Pourquoi pas les autres ? <span class="font-normal text-muted">(${out.length})</span></span><span class="chevron tr">${icon('chevron-down', 'size-5 text-muted')}</span></summary><ul class="flex flex-col gap-3 px-5 pb-5">${out.map((e) => `<li><p class="font-medium">${esc(e.financement.nom)}</p><p class="text-sm text-muted">${esc(e.pourquoiPas)}</p></li>`).join('')}</ul></details>` : ''}
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm max-lg:order-3"><button type="button" data-modifier class="tr min-h-11 cursor-pointer font-medium underline underline-offset-4 hover:text-accent-text">Modifier mes réponses</button><button type="button" data-conseiller class="tr min-h-11 cursor-pointer font-medium underline underline-offset-4 hover:text-accent-text">Parler à un conseiller</button></div>
    </section>
    <section class="flex min-h-0 flex-col gap-4 max-lg:order-2 lg:overflow-y-auto" aria-label="${liste.length ? 'Financements possibles' : 'Pistes'}">${liste.length ? `<ul class="flex flex-col gap-4">${cartes}</ul>` : vide}</section></div>`
}

function conseiller() {
  const d = modale({ titre: 'Parler à un conseiller', description: 'Laissez votre numéro, un conseiller vous rappelle sous un jour ouvré.', corps: `<label for="tel" class="text-sm font-medium">Numéro de téléphone</label><input id="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" class="mt-1.5 h-11 w-full rounded-sm border border-border-strong bg-surface px-3.5 text-base"><p class="mt-1.5 text-sm text-muted">Il n’est utilisé que pour ce rappel.</p>`, pied: `<button type="button" data-fermer class="${btn('ghost')}">Annuler</button><button type="button" id="rappel" class="${btn('primary')}">Être rappelé·e</button>` }).ouvrir()
  d.querySelector('#rappel').onclick = () => { d.close(); toast({ title: 'Demande de rappel enregistrée', description: 'Un conseiller vous appelle sous un jour ouvré.' }) }
}

// ---------- Rendu et événements ----------
function rendre({ focus } = {}) {
  main.innerHTML = vue() === 'resultat' ? resultat() : question()
  if (focus === 'titre') { const h = $('h1', main); h?.focus({ preventScroll: true }); scrollTo(0, 0) }
  else if (focus) $(focus, main)?.focus({ preventScroll: true })
}
const avancer = () => { const s = S().step + 1; demande.set({ step: s }); if (s >= TOTAL) suivre('eligibilite_resultat'); rendre({ focus: 'titre' }) }
const peutContinuer = () => { const { step, answers } = S(); const q = QUESTIONS[Math.min(step, TOTAL - 1)]; return answers[q.key] !== undefined }
const fixerMontant = (n) => {
  const q = QUESTIONS[3]; if (n !== undefined) { setReponse('montant', n); demarre() } else demande.set((s) => { const { montant, ...reste } = s.answers; return { answers: reste } })
  const j = $('#jauge'); if (j && n !== undefined) { j.value = Math.min(q.max, Math.max(q.min, n)); j.classList.remove('neutre'); j.style.setProperty('--p', `${((j.value - q.min) / (q.max - q.min)) * 100}%`); j.setAttribute('aria-valuetext', eur(n)) }
  const o = $('#montant-sortie'); if (o) o.innerHTML = n === undefined ? '<span class="text-subtle">— €</span>' : eur(n)
  $$('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.preset) === n)))
  $('#continuer')?.setAttribute('aria-disabled', String(n === undefined)); $('#raison-montant') && ($('#raison-montant').hidden = n !== undefined)
}

main.addEventListener('click', (e) => {
  const t = e.target
  const choix = t.closest('[data-choix]'); if (choix) { const { step } = S(), q = QUESTIONS[step]; demarre(); setReponse(q.key, q.options[Number(choix.dataset.choix)].value); rendre({ focus: `[data-choix="${choix.dataset.choix}"]` }); return }
  if (t.closest('[data-continuer]')) { if (peutContinuer()) avancer(); return }
  if (t.closest('[data-retour]')) { demande.set((s) => ({ step: s.step - 1 })); rendre({ focus: 'titre' }); return }
  if (t.closest('[data-modifier]')) { demande.set({ step: 0 }); rendre({ focus: 'titre' }); return }
  if (t.closest('[data-conseiller]')) return conseiller()
  const pre = t.closest('[data-preset]'); if (pre) { const v = Number(pre.dataset.preset); fixerMontant(v); $('#saisie').value = v; return }
  const cm = t.closest('[data-commencer]'); if (cm) { demande.set({ financementId: cm.dataset.commencer }); location.href = '/demande/pieces' }
})
main.addEventListener('input', (e) => {
  if (e.target.id === 'jauge') { const v = Number(e.target.value); fixerMontant(v); $('#saisie').value = v }
  if (e.target.id === 'saisie') { const d = e.target.value.replace(/\D/g, '').slice(0, 8); e.target.value = d; fixerMontant(d ? Number(d) : undefined) }
})
// Clavier : 1 à 5 choisissent, Entrée valide la réponse présélectionnée, flèches dans le groupe de réponses.
addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector('dialog[open]')) return
  const { step } = S(), q = QUESTIONS[Math.min(step, TOTAL - 1)], tag = e.target.tagName
  if (vue() !== 'question') return
  if (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'A' && tag !== 'SELECT' && tag !== 'TEXTAREA') { if (peutContinuer()) { e.preventDefault(); avancer() } return }
  if (/INPUT|TEXTAREA|SELECT/.test(tag)) return
  if (q.kind === 'choice') {
    const i = Number(e.key) - 1
    if (i >= 0 && i < q.options.length) { e.preventDefault(); demarre(); setReponse(q.key, q.options[i].value); rendre({ focus: `[data-choix="${i}"]` }) }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { const bs = $$('[data-choix]'), k = bs.indexOf(document.activeElement); if (k >= 0) { e.preventDefault(); bs[(k + (e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length].focus() } }
  }
})
demande.sub(() => { document.querySelectorAll('[data-montant]').forEach(() => {}) })
rendre({ focus: 'titre' })
