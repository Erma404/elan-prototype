// Confirmation : succès sobre, suivi, copie du récapitulatif, droit de modifier ses pièces.
import { $, esc, btn } from './core.js'
import { icon } from './icons.js'
import { monterCoque, logo } from './shell.js'
import { demande, pieces, eur } from './state.js'
import { PIECES, compter } from './pieces.js'
import { financements } from './engine.js'
import { chronologie } from './composants.js'

const main = monterCoque({ step: 3, titre: 'Demande envoyée' })
const st = pieces.get(), a = demande.get().answers, c = compter(st.etat)
const f = financements.find((x) => x.id === (demande.get().financementId ?? 'pret-equipement-artisans'))
const date = new Date(st.envoyeLe ?? Date.now())
main.innerHTML = `<div class="mx-auto grid h-full min-h-0 max-w-5xl content-center gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
  <section aria-labelledby="titre" class="flex flex-col justify-center">${logo('wordmark', 'h-9')}<p class="eyebrow mt-8">Demande envoyée</p><h1 id="titre" tabindex="-1" class="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.05] tracking-tighter outline-none">Votre demande est envoyée.</h1>
    <p class="mt-4 max-w-md text-lg text-muted">Un chargé d’affaires l’instruit. Vous pouvez encore modifier une pièce : il est prévenu de chaque changement.</p>
    <dl class="mt-6 grid grid-cols-[9rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-base"><dt class="text-muted">Numéro de dossier</dt><dd class="ident font-medium">${esc(st.numero ?? '—')}</dd><dt class="text-muted">Financement</dt><dd class="font-medium">${esc(f.nom)}</dd><dt class="text-muted">Montant souhaité</dt><dd class="tabular font-medium">${a.montant !== undefined ? eur(a.montant) : 'À préciser'}</dd><dt class="text-muted">Pièces</dt><dd class="tabular font-medium">${c.faites} sur ${c.total}</dd></dl>
    <div class="mt-7 flex flex-wrap gap-3"><button type="button" id="telecharger" class="${btn('secondary')}">${icon('download')}Télécharger le récapitulatif</button><a href="/demande/pieces" class="${btn('secondary')}">Modifier mes pièces</a><button type="button" id="suivi-lien" class="${btn('ghost')}">Suivre ma demande</button></div></section>
  <div id="suivi" class="self-center rounded-card border border-border bg-surface p-6 shadow-md"><h2 class="eyebrow">Suivi de votre demande</h2><div class="mt-5">${chronologie([{ titre: 'Réception', detail: 'Votre demande est bien arrivée.', time: date.toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }), etat: 'done' }, { titre: 'Instruction par un chargé d’affaires', detail: 'Il vérifie vos pièces et vos critères.', etat: 'current' }, { titre: 'Réponse', detail: 'Délai estimé : sous 10 jours ouvrés', etat: 'todo' }])}</div><p class="mt-3 text-xs text-subtle">Délai et numéro de dossier : exemples fictifs de démonstration.</p><a href="/pro/dossiers/argile" class="${btn('ghost', 'sm', 'mt-3')}">${icon('external-link')}Voir côté chargé d’affaires (démo)</a></div></div>`
$('#suivi-lien').onclick = () => $('#suivi').scrollIntoView({ behavior: 'smooth', block: 'center' })
$('#telecharger').onclick = () => {
  const l = ['Récapitulatif de votre demande', `Numéro : ${st.numero ?? '—'}`, `Financement : ${f.nom}`, `Objet : ${st.objet}`, `Montant souhaité : ${a.montant !== undefined ? eur(a.montant) : 'à préciser'}`, '', 'Pièces :', ...PIECES.map((p) => `- ${p.nom} : ${st.etat[p.id].statut}`), '', 'Prototype, données fictives.']
  const lien = document.createElement('a'); lien.href = URL.createObjectURL(new Blob([l.join('\n')], { type: 'text/plain;charset=utf-8' })); lien.download = `recapitulatif-${st.numero ?? 'demande'}.txt`; lien.click(); URL.revokeObjectURL(lien.href)
}
