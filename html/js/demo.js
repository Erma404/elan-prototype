// Panneau de démonstration (Maj + D), scénarios, erreurs injectables, visite guidée, onglet Mesure.
import { $, $$, esc, btn, creerStore, modale } from './core.js'
import { icon } from './icons.js'
import { ui, pieces, chargerScenario, reinitialiser, evenements, demande } from './state.js'
import { reglerTheme } from './core.js'

const SCENARIOS = [['premier', 'Premier accès'], ['cours', 'En cours (6 sur 9)'], ['corriger', 'Une pièce à corriger'], ['offline', 'Connexion perdue'], ['pret', 'Prêt à envoyer'], ['apres', 'Après envoi']]
const ERREURS = [[null, 'Aucune'], ['reseau', 'Réseau'], ['fichier-lourd', 'Fichier trop lourd'], ['ia', 'Assistant IA indisponible']]
const INDICATEURS = [
  ['Abandon à l’étape des pièces', '35 % des entrepreneurs qui démarrent', '20 %', ['pieces_ecran_vu', 'piece_deposee', 'envoi_clique']],
  ['Demandes envoyées complètes', '60 %', '80 %', ['piece_a_corriger', 'envoi_reussi']],
  ['Refus faute de financement correspondant', '33 %, connu après 3 semaines', 'moins de 15 %, connu avant l’envoi', ['eligibilite_demarree', 'eligibilite_resultat']],
]
export const ETAPES = [
  { route: '/', titre: '0:00, la promesse', texte: 'Pas d’assistant en vitrine : une promesse concrète. On ne se perd pas sur la page d’accueil, on se perd au moment du doute.' },
  { route: '/bonjour', titre: '0:15, bonjour Fabienne', texte: 'Chaque profil a son écran d’accueil. On choisit qui on est, puis on démarre le parcours.' },
  { route: '/eligibilite', titre: '0:25, avoir une chance', texte: 'Une question par écran, cinq au total. Choisissez un montant avec la jauge : il reste affiché à chaque étape.' },
  { route: '/demande/pieces', titre: '0:55, l’écran abouti', texte: 'Chaque pièce dit pourquoi on la demande, où la trouver, et montre un exemple. « Pièce suivante » guide la suite, et rien ne fait défiler la page.', etat: 'cours' },
  { route: '/demande/pieces', titre: '1:30, L’IA prépare, vous validez', texte: 'Déposez le bilan : l’IA alerte (« la page 2 est manquante ») mais ne bloque jamais. L’assistant cite sa source et ne se prononce jamais sur l’éligibilité.', etat: 'cours' },
  { route: '/demande/recapitulatif', titre: '2:05, droit à l’erreur', texte: 'Tout reste modifiable, avant comme après l’envoi. L’envoi est bloqué tant qu’une pièce obligatoire manque, avec la liste cliquable.', etat: 'pret' },
  { route: '/pro/dossiers/argile', titre: '2:35, côté Nicolas', texte: 'Il reçoit un dossier complet : complétude, critères vérifiés par pièce, journal, relance en un clic. Le temps de relance passe de 45 à environ 25 minutes.', etat: 'apres' },
]
const tour = creerStore('elan:tour:html', () => ({ actif: false, i: 0, pause: false }), { session: true })
let minuterie

const PROFILS = [['fabienne', 'Fabienne M.', 'FM', 'Dirigeante, atelier de céramique'], ['experte', 'Cabinet Ledoux', 'CL', 'Experte-comptable, invitée par Fabienne pour déposer des pièces'], ['nicolas', 'Nicolas B.', 'NB', 'Chargé d’affaires, instruit les demandes']]
/** Avatar d'un profil : portrait pour Fabienne et Nicolas, logo du cabinet pour l'experte-comptable. Décoratif (le nom est écrit à côté). */
export const avatar = (id, taille = 'size-9') => id === 'experte'
  ? `<span aria-hidden="true" class="inline-grid ${taille} shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-white p-1.5"><img src="/brand/cabinet-ledoux-marque.svg" alt="" class="size-full"></span>`
  : `<img src="/photos/${id}.jpg" alt="" width="160" height="160" class="${taille} shrink-0 rounded-full border border-border object-cover">`
/** Bouton de profil, présent dans chaque en-tête : affiche qui on est et permet d'en changer. */
export const boutonProfil = () => { const [pid, nom] = PROFILS.find((x) => x[0] === ui.get().persona) ?? PROFILS[0]; return `<button type="button" data-profil aria-haspopup="dialog" aria-label="Changer de profil, connecté en tant que ${esc(nom)}" class="tr inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 hover:bg-bg-soft">${avatar(pid, 'size-9')}<span class="hidden whitespace-nowrap text-sm font-medium lg:inline">${esc(nom)}</span>${icon('chevron-down', 'size-4 text-muted')}</button>` }
export const PERSONAS = { fabienne: { nom: 'Fabienne', url: '/eligibilite' }, experte: { nom: '', url: '/expert/demo' }, nicolas: { nom: 'Nicolas', url: '/pro/dossiers/argile' } }
export function ouvrirProfils() {
  const courant = ui.get().persona
  const d = modale({ titre: 'Changer de profil', description: 'Le prototype se parcourt avec trois points de vue. Vos données sont conservées.', corps: `<ul class="flex flex-col gap-2">${PROFILS.map(([id, nom, , role]) => `<li><button type="button" data-profil-choix="${id}" aria-current="${courant === id}" class="tr flex min-h-16 w-full cursor-pointer items-center gap-4 rounded-md border px-4 py-3 text-left ${courant === id ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-bg-soft'}">${avatar(id, 'size-11')}<span class="flex-1"><span class="block font-semibold tracking-tight">${esc(nom)}</span><span class="block text-sm text-muted">${esc(role)}</span></span>${courant === id ? icon('check', 'size-5 text-accent-text') : ''}</button></li>`).join('')}</ul>`, pied: `<button type="button" data-fermer class="${btn('ghost')}">Fermer</button>` }).ouvrir()
  d.addEventListener('click', (e) => { const c = e.target.closest('[data-profil-choix]'); if (!c) return; ui.set({ persona: c.dataset.profilChoix }); location.href = '/bonjour' })
}
if (new URLSearchParams(location.search).has('demo')) ui.set({ demoVisible: true })
export const boutonDemo = () => (location.pathname === '/' || !ui.get().demoVisible ? '' : `<button type="button" data-demo-ouvrir aria-expanded="false" aria-controls="panneau-demo" aria-label="Démo, panneau de démonstration" class="${btn('ghost', 'sm', '!text-muted hover:!text-text')}">${icon('flask-conical')}<span class="hidden sm:inline">Démo</span></button>`)

const segment = (nom, courant, options, attr) => `<fieldset class="flex flex-col gap-1.5"><legend class="eyebrow before:!hidden mb-1">${nom}</legend><div class="flex flex-wrap gap-1.5">${options.map(([id, l]) => `<button type="button" data-${attr}="${esc(id ?? '')}" aria-pressed="${courant === id}" class="tr min-h-9 cursor-pointer rounded-full border border-border-strong px-3 text-sm font-medium hover:bg-bg-soft aria-pressed:border-text aria-pressed:bg-text aria-pressed:text-bg">${l}</button>`).join('')}</div></fieldset>`

function contenuPanneau() {
  const { persona, bandeauMasque } = ui.get(), p = pieces.get(), ev = evenements.get().items
  const compte = (n) => ev.filter((e) => e.name === n).length
  return `
  <div class="flex items-center justify-between border-b border-border px-5 py-3"><h2 class="font-semibold tracking-tight">Panneau de démonstration</h2><button type="button" data-demo-fermer aria-label="Fermer" class="tr grid size-9 cursor-pointer place-items-center rounded-sm text-muted hover:bg-bg-soft">${icon('x')}</button></div>
  <div role="tablist" aria-label="Panneau" class="flex gap-1 border-b border-border px-5">${[['scenarios', 'Scénarios'], ['mesure', 'Mesure']].map(([id, l], i) => `<button role="tab" type="button" id="onglet-${id}" aria-selected="${i === 0}" aria-controls="vue-${id}" tabindex="${i === 0 ? 0 : -1}" data-onglet="${id}" class="tr -mb-px min-h-11 cursor-pointer border-b-2 border-transparent px-4 text-base font-medium text-muted hover:text-text aria-selected:border-accent aria-selected:text-text">${l}</button>`).join('')}</div>
  <div id="vue-scenarios" role="tabpanel" aria-labelledby="onglet-scenarios" class="flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
    ${segment('Persona', persona, [['fabienne', 'Fabienne'], ['experte', 'Experte-comptable'], ['nicolas', 'Nicolas']], 'persona')}
    ${segment('État de l’écran Pièces', null, SCENARIOS, 'scenario')}
    ${segment('Injecter une erreur', p.erreur, ERREURS, 'erreur')}
    <div class="flex flex-wrap gap-2"><button type="button" data-action="session" class="${btn('secondary', 'sm')}">Session expirée</button><button type="button" data-action="connexion" class="${btn('secondary', 'sm')}">${p.hors_ligne ? 'Rétablir la connexion' : 'Couper la connexion'}</button></div>
    ${segment('Thème', document.documentElement.dataset.theme, [['light', 'Clair'], ['dark', 'Sombre'], ['system', 'Auto']], 'choix-theme')}
    <label class="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-medium">Masquer le bandeau « données fictives »<input type="checkbox" data-action="bandeau" ${bandeauMasque ? 'checked' : ''} class="size-5 accent-[var(--color-accent)]"></label>
    <div class="flex flex-wrap gap-2"><button type="button" data-action="visite" class="${btn('primary', 'sm')}">Lancer la visite guidée (3 min)</button><button type="button" data-action="reset" class="${btn('secondary', 'sm')}">Réinitialiser</button><a href="/styleguide" class="${btn('ghost', 'sm')}">Système de design</a></div>
  </div>
  <div id="vue-mesure" role="tabpanel" aria-labelledby="onglet-mesure" hidden class="flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
    <ul class="flex flex-col gap-2.5">${INDICATEURS.map(([nom, auj, cible, evts]) => `<li class="rounded-md bg-bg-soft p-3 text-sm"><p class="font-semibold">${nom}</p><p class="text-muted">Aujourd’hui : ${auj}. Cible à 3 mois : ${cible}.</p><p class="tabular mt-1.5 text-xs text-subtle">Lié à : ${evts.map((e) => `${e} (${compte(e)})`).join(', ')}</p></li>`).join('')}</ul>
    <p class="rounded-md border border-border p-3 text-xs text-muted"><span class="font-semibold text-text">Vague 2 (hors périmètre des 6 semaines)</span> : file de travail triée par complétude, relance en un clic, vérification automatique des documents par l’IA. Montrés ici pour illustrer la suite, ils ne font pas partie de la vague 1.</p>
    <p class="text-xs text-subtle">Ordres de grandeur à calibrer. Contrôle : temps de relance de 45 min à environ 25 min.</p>
    <div><h3 class="eyebrow before:!hidden">Journal des événements</h3>${ev.length === 0 ? '<p class="mt-2 text-sm text-muted">Aucun événement pour l’instant. Jouez le parcours.</p>' : `<ul class="mt-2 flex max-h-44 flex-col overflow-y-auto text-sm">${ev.slice(0, 30).map((e) => `<li class="flex justify-between gap-3 border-b border-border py-1.5"><span class="ident text-xs">${esc(e.name)}${e.detail ? ` · ${esc(e.detail)}` : ''}</span><span class="tabular text-xs text-subtle">${new Date(e.at).toLocaleTimeString('fr-FR')}</span></li>`).join('')}</ul>`}</div>
  </div>`
}

function majPanneau(panneau) { const onglet = $('[aria-selected="true"][data-onglet]', panneau)?.dataset.onglet ?? 'scenarios'; panneau.innerHTML = contenuPanneau(); selectOnglet(panneau, onglet) }
function selectOnglet(panneau, id) { $$('[data-onglet]', panneau).forEach((b) => { b.setAttribute('aria-selected', b.dataset.onglet === id); b.tabIndex = b.dataset.onglet === id ? 0 : -1 }); $$('[role=tabpanel]', panneau).forEach((v) => { v.hidden = v.id !== `vue-${id}` }) }

function allerA(route, etat) { if (etat) chargerScenario(etat); location.href = route }

function visite() {
  let b = $('#visite'); const t = tour.get()
  if (!t.actif) { b?.remove(); clearTimeout(minuterie); return }
  const e = ETAPES[t.i]
  if (!b) { b = document.createElement('div'); b.id = 'visite'; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Visite guidée'); b.className = 'anim-toast fixed bottom-3 left-1/2 z-[var(--z-demo)] w-[min(34rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-card bg-text p-5 text-bg shadow-lg'; document.body.append(b) }
  b.innerHTML = `<p class="tabular text-xs opacity-70">Étape ${t.i + 1} sur ${ETAPES.length}</p><p class="mt-1 text-lg font-semibold tracking-tight">${esc(e.titre)}</p><p class="mt-1.5 text-sm leading-relaxed opacity-90">${esc(e.texte)}</p>
    <div class="mt-4 flex flex-wrap items-center gap-2"><button type="button" data-v="prec" ${t.i === 0 ? 'aria-disabled="true"' : ''} class="${btn('inverse', 'sm')}">${icon('chevron-left')}Retour</button><button type="button" data-v="suiv" class="${btn('inverse', 'sm')}">${t.i < ETAPES.length - 1 ? 'Suivant' : 'Terminer'}${icon('chevron-right')}</button><button type="button" data-v="pause" class="${btn('inverse', 'sm')}">${t.pause ? icon('play') + 'Reprendre' : icon('pause') + 'Pause'}</button><button type="button" data-v="quitter" class="tr ml-auto min-h-9 cursor-pointer rounded-sm px-2 text-sm underline underline-offset-4 opacity-80 hover:opacity-100">Quitter</button></div>`
  b.onclick = (ev) => {
    const a = ev.target.closest('[data-v]')?.dataset.v; if (!a) return
    if (a === 'quitter') { tour.set({ actif: false }); visite() }
    if (a === 'pause') { tour.set({ pause: !t.pause }); visite() }
    if (a === 'prec' && t.i > 0) { tour.set({ i: t.i - 1 }); const p = ETAPES[t.i - 1]; allerA(p.route, p.etat) }
    if (a === 'suiv') { if (t.i < ETAPES.length - 1) { tour.set({ i: t.i + 1 }); const p = ETAPES[t.i + 1]; allerA(p.route, p.etat) } else { tour.set({ actif: false }); visite() } }
  }
  clearTimeout(minuterie)
  if (!t.pause) minuterie = setTimeout(() => $('[data-v="suiv"]', b)?.click(), 22000)
}

export function monterDemo() {
  let panneau = $('#panneau-demo')
  if (!panneau) {
    panneau = document.createElement('div'); panneau.id = 'panneau-demo'; panneau.hidden = true
    panneau.setAttribute('role', 'dialog'); panneau.setAttribute('aria-label', 'Panneau de démonstration'); panneau.tabIndex = -1
    panneau.className = 'anim-fade fixed right-3 top-20 z-[var(--z-demo)] flex max-h-[calc(100dvh-6rem)] w-[min(26rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-card border border-border bg-surface shadow-lg'
    document.body.append(panneau)
  }
  if (location.pathname === '/' && !$('#pilule-demo')) {
    const b = document.createElement('button'); b.type = 'button'; b.id = 'pilule-demo'; b.dataset.demoOuvrir = ''; b.setAttribute('aria-controls', 'panneau-demo'); b.setAttribute('aria-expanded', 'false')
    b.className = btn('primary', 'sm', 'fixed bottom-3 left-3 z-[var(--z-demo)] !h-11 shadow-lg'); b.innerHTML = `${icon('flask-conical')}Démo`; document.body.append(b)
  }
  let dernier
  const ouvrir = () => { dernier = document.activeElement; majPanneau(panneau); panneau.hidden = false; $$('[data-demo-ouvrir]').forEach((b) => b.setAttribute('aria-expanded', 'true')); panneau.focus() }
  const fermer = () => { panneau.hidden = true; $$('[data-demo-ouvrir]').forEach((b) => b.setAttribute('aria-expanded', 'false')); dernier?.focus?.() }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-profil]')) return ouvrirProfils()
    if (e.target.closest('[data-demo-ouvrir]')) { panneau.hidden ? ouvrir() : fermer(); return }
    if (e.target.closest('[data-demo-fermer]')) return fermer()
    if (!panneau.contains(e.target)) return
    const o = e.target.closest('[data-onglet]'); if (o) return selectOnglet(panneau, o.dataset.onglet)
    const per = e.target.closest('[data-persona]'); if (per) { ui.set({ persona: per.dataset.persona }); return allerA('/bonjour') }
    const sc = e.target.closest('[data-scenario]'); if (sc?.dataset.scenario === 'corriger') sessionStorage.setItem('elan:piece', 'bilans'); if (sc) return allerA(sc.dataset.scenario === 'apres' ? '/demande/envoyee' : '/demande/pieces', sc.dataset.scenario)
    const er = e.target.closest('[data-erreur]'); if (er) { pieces.set({ erreur: er.dataset.erreur || null }); return majPanneau(panneau) }
    const th = e.target.closest('[data-choix-theme]'); if (th) { reglerTheme(th.dataset.choixTheme); return majPanneau(panneau) }
    const a = e.target.closest('[data-action]')?.dataset.action
    if (a === 'session') { pieces.set({ session_expiree: true }); location.href = '/demande/pieces' }
    if (a === 'connexion') { pieces.set((s) => ({ hors_ligne: !s.hors_ligne })); majPanneau(panneau) }
    if (a === 'reset') { reinitialiser(); location.href = '/bonjour' }
    if (a === 'visite') { tour.set({ actif: true, i: 0, pause: false }); allerA(ETAPES[0].route) }
  })
  document.addEventListener('change', (e) => { if (e.target.matches('[data-action="bandeau"]')) ui.set({ bandeauMasque: e.target.checked }) })
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey && !/input|textarea|select/i.test(e.target.tagName)) { e.preventDefault(); panneau.hidden ? ouvrir() : fermer() }
    if (e.key === 'Escape' && !panneau.hidden) fermer()
  })
  visite()
}
