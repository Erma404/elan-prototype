import { useCallback } from 'react'
import { pieceById } from '../../domain/pieces'
import { usePieces } from '../../app/pieces-store'
import { ErreurReseau, televerser, verifierDocument } from '../../mocks/api'
import { track } from '../../lib/events'
import { say } from '../../lib/annonce'

const jetons = new Map<string, number>()
/** Annule un envoi en cours : ses résultats tardifs sont ignorés. */
export const annulerDepot = (id: string) => jetons.set(id, (jetons.get(id) ?? 0) + 1)

/** Parcours d'un dépôt : envoi simulé, puis vérification automatique (vague 2). L'IA alerte, elle ne bloque jamais. */
export function useDepot() {
  const patch = usePieces((s) => s.patch)
  return useCallback(async (id: string, nom: string, taille: number, file?: File) => {
    const { erreur, hors_ligne, etat } = usePieces.getState()
    const piece = pieceById(id)
    annulerDepot(id)
    const mien = jetons.get(id)!
    const valide = () => jetons.get(id) === mien
    patch(id, { fichier: { nom, taille }, message: undefined, verifie: undefined })
    if (hors_ligne) {
      patch(id, { statut: 'envoi', progress: 0, message: 'Enregistré sur cet appareil, envoi dès le retour du réseau.' })
      say(`${piece.nom} : enregistré sur cet appareil, envoi dès le retour du réseau.`)
      return
    }
    patch(id, { statut: 'envoi', progress: 0 })
    say(`${piece.nom} : envoi en cours.`)
    try {
      await televerser(file ?? new File([], nom), (progress) => { if (valide()) patch(id, { progress }) }, erreur)
    } catch (e) {
      if (!valide()) return
      const m = e instanceof ErreurReseau ? e.message : 'L’envoi a échoué.'
      patch(id, { statut: 'a-fournir', progress: undefined, message: `${m} Votre fichier est gardé, vous pouvez réessayer.` })
      say(`${piece.nom} : l’envoi a échoué. Vous pouvez réessayer.`)
      return
    }
    if (!valide()) return
    patch(id, { statut: 'recue', progress: undefined })
    track('piece_deposee', id)
    say(`${piece.nom} : reçue. Vérification en cours.`)
    const v = await verifierDocument(piece, taille, !!etat[id].alerteBilanDonnee)
    if (!valide()) return
    if (v.ok) {
      patch(id, { statut: 'verifiee', verifie: v.detail })
      say(`${piece.nom} : ${v.detail}.`)
    } else {
      patch(id, { statut: 'a-corriger', message: v.detail, alerteBilanDonnee: true })
      track('piece_a_corriger', id)
      say(`${piece.nom} : à corriger. ${v.detail}`)
    }
  }, [patch])
}
