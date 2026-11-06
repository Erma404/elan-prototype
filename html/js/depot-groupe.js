// Dépôt groupé : on dépose tous les documents d'un coup, l'assistant propose le classement, l'utilisateur valide.
// « L'IA prépare, vous validez » : rien n'est déposé avant le clic de validation, chaque proposition se change.
import { esc, btn, modale, toast } from './core.js'
import { icon } from './icons.js'
import { PIECES } from './pieces.js'
import { pieces, deposer, tailleFichier, suivre } from './state.js'
import { valider } from './composants.js'

const sans = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
// Mots du nom de fichier reconnus pour chaque pièce. L'ordre compte (liasse avant attestation fiscale).
const MOTS = [['kbis', /kbis|extrait.?k|immatriculation/], ['identite', /identite|cni|passeport|carte.?id|piece.?id/], ['rib', /\brib\b|iban|releve.?d.?identite/], ['statuts', /statut/], ['bilans', /bilan/], ['liasse', /liasse|2065|2050|2035/], ['attestation', /attestation|urssaf|regularite|vigilance/], ['devis', /devis|proforma/], ['plan', /plan.?de.?fin|previsionnel|financement/]]
export const reconnaitre = (nom) => MOTS.find(([, re]) => re.test(sans(nom)))?.[0] ?? null

export function ouvrirDepotGroupe(initiaux = [], { apres = () => {} } = {}) {
  let lignes = [], iaOk = pieces.get().erreur !== 'ia'
  const etat = pieces.get().etat
  const options = (sel) => `<option value="">Ne pas utiliser</option>${PIECES.map((p) => `<option value="${p.id}" ${sel === p.id ? 'selected' : ''}>${esc(p.nom)}${etat[p.id].fichier ? ' (remplace le fichier actuel)' : ''}</option>`).join('')}`
  const classer = (fichiers) => {
    for (const f of fichiers) {
      const pb = valider(f, pieces.get().erreur === 'fichier-lourd' ? f.size : 0)
      const id = iaOk && !pb ? reconnaitre(f.name) : null
      lignes.push({ f, pb, id, sure: !!id })
    }
    // Deux fichiers pour la même pièce : le premier est gardé, l'autre est à associer à la main.
    const vus = new Set(); for (const l of lignes) { if (l.id && vus.has(l.id)) { l.id = null; l.sure = false; l.doublon = true } else if (l.id) vus.add(l.id) }
  }
  const dlg = modale({ titre: 'Déposer plusieurs documents', description: iaOk ? 'Déposez tout d’un coup : l’assistant propose où chaque document va, vous validez.' : 'L’assistant est indisponible : associez chaque document à sa pièce.', corps: '<div id="groupe"></div>', pied: `<button type="button" data-fermer class="${btn('ghost')}">Annuler</button><button type="button" id="valider-groupe" aria-disabled="true" class="${btn('primary')}">Valider</button>` })
  const corps = () => dlg.querySelector('#groupe'), val = () => dlg.querySelector('#valider-groupe')
  const input = () => `<input id="multi" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" class="sr-only" tabindex="-1">`
  const rendre = () => {
    const retenus = lignes.filter((l) => l.id)
    corps().innerHTML = `${lignes.length ? `<ul class="flex flex-col divide-y divide-border">${lignes.map((l, i) => `<li class="grid grid-cols-[2.25rem_minmax(0,1fr)_2.5rem] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[2.25rem_minmax(0,1fr)_14rem_2.5rem] ${l.pb ? 'opacity-70' : ''}"><span class="grid size-9 shrink-0 place-items-center rounded-sm bg-bg-soft">${icon('file-text')}</span><div class="min-w-0"><p class="truncate font-medium" title="${esc(l.f.name)}">${esc(l.f.name)}</p><p class="tabular text-sm text-muted">${tailleFichier(l.f.size)}${l.pb ? ` · <span class="text-danger">${esc(l.pb)}</span>` : l.doublon ? ' · déjà un fichier pour cette pièce' : l.id && l.sure && iaOk ? ' · classement proposé' : !l.id ? ' · à associer' : ''}</p></div>${l.pb ? '' : `<div class="col-span-3 col-start-1 sm:col-span-1 sm:col-start-3 sm:row-start-1"><label class="sr-only" for="s-${i}">Pièce pour ${esc(l.f.name)}</label><select id="s-${i}" data-i="${i}" class="h-11 w-full min-w-0 rounded-sm border border-border-strong bg-surface px-3 text-sm">${options(l.id)}</select></div>`}<button type="button" data-retirer="${i}" class="${btn('ghost', 'sm')}" aria-label="Retirer ${esc(l.f.name)}">${icon('x')}</button></li>`).join('')}</ul><div class="mt-3"><button type="button" data-ajouter class="${btn('ghost', 'sm')}">${icon('plus')}Ajouter d’autres documents</button></div>`
      : `<div data-zone-multi class="tr flex flex-col items-center gap-4 rounded-card border border-dashed border-border-strong bg-bg-soft px-6 py-12 text-center"><span class="grid size-14 place-items-center rounded-full bg-surface">${icon('upload', 'size-6')}</span><div><p class="text-xl font-semibold tracking-tight">Glissez tous vos documents ici</p><p class="mt-1 text-muted">PDF, JPG ou PNG, 10 Mo au plus chacun.</p></div><button type="button" data-ajouter class="${btn('primary', 'md', '!rounded-full')}">Choisir des fichiers</button></div>`}${input()}${iaOk && lignes.length ? '<p class="mt-3 text-xs text-muted">Classement proposé par l’assistant, d’après le nom des fichiers. Vérifiez avant de valider : il peut se tromper.</p>' : ''}`
    const n = retenus.length; val().textContent = n ? `Valider ${n} document${n > 1 ? 's' : ''}` : 'Valider'; val().setAttribute('aria-disabled', String(n === 0)); val().title = n === 0 ? 'Associez au moins un document à une pièce.' : ''
  }
  const ajouter = (fs) => { classer([...fs]); rendre(); suivre('depot_groupe_fichiers', String(fs.length)) }
  dlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-ajouter]')) return dlg.querySelector('#multi').click()
    const r = e.target.closest('[data-retirer]'); if (r) { lignes.splice(Number(r.dataset.retirer), 1); rendre() }
    if (e.target.closest('#valider-groupe')) {
      const retenus = lignes.filter((l) => l.id); if (!retenus.length) return
      for (const l of retenus) { deposer(l.id, l.f.name, l.f.size, l.f) }
      suivre('depot_groupe_valide', String(retenus.length)); apres(retenus.map((l) => l.id)); dlg.close()
      toast({ title: `${retenus.length} document${retenus.length > 1 ? 's' : ''} ajouté${retenus.length > 1 ? 's' : ''}`, description: 'Chaque pièce est vérifiée dès son envoi. Vous pouvez la changer à tout moment.' })
    }
  })
  dlg.addEventListener('change', (e) => {
    if (e.target.id === 'multi') { ajouter(e.target.files); e.target.value = '' }
    const s = e.target.closest('[data-i]'); if (s) { const l = lignes[Number(s.dataset.i)]; l.id = s.value || null; l.sure = false; l.doublon = false; rendre() }
  })
  dlg.addEventListener('dragover', (e) => { e.preventDefault(); dlg.querySelector('[data-zone-multi]')?.classList.add('border-accent', 'bg-accent-soft') })
  dlg.addEventListener('drop', (e) => { e.preventDefault(); ajouter(e.dataTransfer.files) })
  dlg.querySelector('.modale-corps').style.width = 'min(44rem, calc(100vw - 2rem))'
  dlg.ouvrir(); if (initiaux.length) classer([...initiaux]); rendre()
  return dlg
}
