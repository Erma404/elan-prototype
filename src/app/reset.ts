import { useDemande, useUi } from './store'
import { usePieces } from './pieces-store'
import { useEvents } from '../lib/events'

/** Remet le prototype dans son état initial : Fabienne, sans montant, aucune pièce déposée, journal vide. */
export function reinitialiser() {
  useDemande.getState().reset()
  usePieces.getState().reset()
  useEvents.getState().clear()
  useUi.getState().set({ persona: 'fabienne' })
  try { sessionStorage.removeItem('elan:demarre') } catch { /* stockage indisponible */ }
}
