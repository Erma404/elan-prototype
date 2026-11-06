// Récapitulatif avant envoi : un seul écran, consentement clair, envoi bloqué avec la liste cliquable.
import { $, esc, btn, modale, banniere, badgeStatut } from './core.js'
import { icon } from './icons.js'
import { monterCoque } from './shell.js'
import { demande, pieces, setReponse, suivre, envoyerDemande, eur, objetProjet } from './state.js'
import { PIECES, compter } from './pieces.js'
import { financements } from './engine.js'
import { chronologie } from './composants.js'

const main = monterCoque({ step: 2, titre: 'Récapitulatif avant envoi' })
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1)
let envoi = false, echec = null
function vue() {
  const st = pieces.get(), a = demande.get().answers, c = compter(st.etat), bloque = c.manquantes.length > 0, corr = c.aCorriger.length > 0
  const f = financements.find((x) => x.id === (demande.get().financementId ?? 'pret-equipement-artisans'))
  const raison = bloque ? `Il manque ${c.manquantes.length} pièce${c.manquantes.length > 1 ? 's' : ''} obligatoire${c.manquantes.length > 1 ? 's' : ''}.` : !st.consentement ? 'Cochez la case de consentement pour envoyer.' : ''
  const off = bloque || !st.consentement
  main.innerHTML = `<div class="grid h-full min-h-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
    <section aria-labelledby="titre" class="flex min-h-0 min-w-0 flex-col gap-4 lg:overflow-y-auto"><a href="/demande/pieces" class="${btn('ghost', 'sm', '-ml-3 w-fit')}">${icon('arrow-left')}Retour aux pièces</a><div><h1 id="titre" tabindex="-1" class=" text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-tighter outline-none">Vérifiez, puis envoyez votre demande.</h1></div>
      <div class="rounded-card border border-border bg-surface p-5 shadow-sm"><div class="flex items-start justify-between gap-4"><h2 class="flex items-center gap-2.5 text-lg font-semibold tracking-tight"><span aria-hidden="true" class="grid size-9 place-items-center rounded-full bg-bg-soft">${icon('file-text', 'size-4')}</span>Résumé de la demande</h2><button type="button" data-modifier class="${btn('ghost', 'sm')}">${icon('pencil')}Modifier</button></div><dl class="mt-3 grid grid-cols-[8rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-base"><dt class="text-muted">Financement</dt><dd class="font-medium">${esc(f.nom)}</dd><dt class="text-muted">Objet</dt><dd class="font-medium">${esc(objetProjet(a))}</dd><dt class="text-muted">Montant souhaité</dt><dd class="tabular font-medium">${a.montant !== undefined ? eur(a.montant) : `<button type="button" data-modifier class="tr cursor-pointer font-medium text-accent-text underline underline-offset-4">Préciser le montant</button>`}</dd></dl></div>
      <div class="rounded-card border border-border bg-surface p-5 shadow-sm"><div class="flex items-start justify-between gap-4"><h2 class="flex items-center gap-2.5 text-lg font-semibold tracking-tight"><span aria-hidden="true" class="grid size-9 place-items-center rounded-full bg-bg-soft">${icon('list-checks', 'size-4')}</span>Vos pièces</h2><p class="tabular text-sm text-muted">${c.faites} sur ${c.total}${corr ? `, ${c.aCorriger.length} à corriger` : ''}</p></div><ul class="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">${PIECES.map((p) => `<li class="flex min-w-0 items-center justify-between gap-3 text-sm"><span class="min-w-0 truncate">${esc(p.nom)}</span>${badgeStatut(st.etat[p.id].statut)}</li>`).join('')}</ul></div></section>
    <aside aria-label="Envoi" class="flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto pb-2"><div class="rounded-card border border-border bg-surface p-5 shadow-md"><h2 class="flex items-center gap-2.5 text-lg font-semibold tracking-tight"><span aria-hidden="true" class="grid size-9 place-items-center rounded-full bg-bg-soft">${icon('shield-check', 'size-4')}</span>Votre consentement</h2>
      <label class="mt-3 flex cursor-pointer items-start gap-3 text-sm leading-relaxed"><input type="checkbox" id="consent" ${st.consentement ? 'checked' : ''} class="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]"><span>J’accepte que mes documents soient traités pour instruire ma demande. Ils sont hébergés en France, conservés <span class="tabular">5 ans</span>, et ne servent jamais à entraîner une IA.</span></label>
      ${bloque ? `<div class="mt-4">${banniere({ ton: 'warning', titre: 'Envoi bloqué', corps: `<ul class="mt-1 flex flex-col">${c.manquantes.map((p) => `<li><a href="/demande/pieces" data-vers="${p.id}" class="tr inline-flex min-h-9 items-center font-medium underline underline-offset-4">${esc(p.nom)}</a></li>`).join('')}</ul>` })}</div>` : ''}
      ${corr ? `<div class="mt-4">${banniere({ ton: 'warning', titre: corr && c.aCorriger.length > 1 ? 'Des pièces restent à corriger' : 'Une pièce reste à corriger', corps: `<ul class="mt-1 flex flex-col gap-1">${c.aCorriger.map((p) => `<li><a href="/demande/pieces" data-vers="${p.id}" class="tr inline-flex min-h-9 items-center font-medium underline underline-offset-4">${esc(p.nom)}</a> : ${esc(minus(st.etat[p.id].message ?? 'à remplacer'))}</li>`).join('')}</ul><p class="mt-2">Vous pouvez envoyer quand même. Le chargé d’affaires vous demandera sans doute de la remplacer, ce qui peut allonger l’instruction.</p>` })}</div>` : ''}
      ${echec ? `<div class="mt-4">${banniere({ ton: 'danger', titre: 'Envoi impossible', corps: esc(echec) })}</div>` : ''}
      <button type="button" id="envoyer" ${off ? `aria-disabled="true" title="${esc(raison)}"` : ''} ${envoi ? 'aria-busy="true"' : ''} class="${btn('primary', 'lg', 'mt-5 w-full')}">${envoi ? icon('loader-circle', 'size-4 animate-[spin_0.8s_linear_infinite]') : ''}${corr && !bloque ? 'Envoyer quand même' : 'Envoyer ma demande'}${icon('arrow-right', 'size-5')}</button>${raison ? `<p class="mt-2 text-xs text-muted">${esc(raison)}</p>` : ''}
</div>
      <div class="rounded-card bg-bg-soft p-5"><h2 class="text-lg font-semibold tracking-tight">Et ensuite</h2><div class="mt-3">${chronologie([{ titre: 'Réception', detail: 'Vous recevez la confirmation.', etat: 'current' }, { titre: 'Instruction par un chargé d’affaires', etat: 'todo' }, { titre: 'Réponse', detail: 'Délai estimé : sous 10 jours ouvrés', etat: 'todo' }])}</div></div></aside></div>`
}
main.addEventListener('change', (e) => { if (e.target.id === 'consent') { pieces.set({ consentement: e.target.checked }); vue(); $('#consent')?.focus() } })
main.addEventListener('click', async (e) => {
  const t = e.target
  if (t.closest('[data-vers]')) { sessionStorage.setItem('elan:piece', t.closest('[data-vers]').dataset.vers); return }
  if (t.closest('[data-modifier]')) {
    const d = modale({ titre: 'Modifier le montant souhaité', description: 'Il met à jour votre demande et le résumé.', corps: `<label for="m" class="text-sm font-medium">Montant souhaité, en euros</label><input id="m" inputmode="numeric" autocomplete="off" value="${demande.get().answers.montant ?? ''}" class="tabular mt-1.5 h-11 w-full rounded-sm border border-border-strong bg-surface px-3.5 text-base">`, pied: `<button type="button" data-fermer class="${btn('ghost')}">Annuler</button><button type="button" id="ok" class="${btn('primary')}">Enregistrer</button>` }).ouvrir()
    d.querySelector('#m').oninput = (ev) => { ev.target.value = ev.target.value.replace(/\D/g, '').slice(0, 8) }
    d.querySelector('#ok').onclick = () => { const n = Number(d.querySelector('#m').value); if (n > 0) setReponse('montant', n); d.close(); vue() }
    return
  }
  if (t.closest('#envoyer')) {
    const st = pieces.get(), c = compter(st.etat); if (c.manquantes.length > 0 || !st.consentement || envoi) return
    suivre('envoi_clique'); envoi = true; echec = null; vue()
    try { const r = await envoyerDemande(st.erreur); pieces.set({ numero: r.numero, envoyeLe: new Date().toISOString() }); suivre('envoi_reussi'); location.href = '/demande/envoyee' }
    catch (err) { echec = err.message || 'L’envoi n’a pas abouti.'; envoi = false; vue(); $('#envoyer')?.focus() }
  }
})
vue()
