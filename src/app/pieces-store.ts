import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ETAT_INITIAL, PIECES } from '../domain/pieces'
import type { PieceState } from '../domain/pieces'
import type { ErreurInjectee } from '../mocks/api'

export type Invitation = { email: string; date: string; pieces: string[]; revoquee: boolean }
export type PresetId = 'premier' | 'cours' | 'corriger' | 'offline' | 'pret' | 'apres'

type S = {
  etat: Record<string, PieceState>
  savedAt: string
  invitation: Invitation | null
  consentement: boolean
  numero: string | null
  envoyeLe: string | null
  hors_ligne: boolean
  session_expiree: boolean
  erreur: ErreurInjectee
  objet: string
  patch: (id: string, p: Partial<PieceState>) => void
  inviter: (i: Invitation) => void
  revoquer: () => void
  set: (p: Partial<Pick<S, 'consentement' | 'numero' | 'envoyeLe' | 'hors_ligne' | 'session_expiree' | 'erreur' | 'objet'>>) => void
  charger: (p: PresetId) => void
  reset: () => void
}

const hhmm = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
const fichier = (nom: string, taille: number) => ({ nom, taille })
const faite = (nom: string, taille: number, verifie?: string): PieceState => ({ statut: 'verifiee', fichier: fichier(nom, taille), verifie: verifie ?? 'Document lisible, 2 pages' })

function preset(id: PresetId): Record<string, PieceState> {
  const base = structuredClone(ETAT_INITIAL)
  if (id === 'premier') return base
  const six = { ...base,
    kbis: faite('Kbis-atelier-argile-et-feu.pdf', 412_000), identite: faite('CNI-fabienne.jpg', 1_100_000), rib: faite('RIB-atelier.pdf', 96_000, 'Document lisible, 1 page'),
    liasse: faite('Liasse-fiscale-2024.pdf', 1_800_000, 'Document lisible, 8 pages'), devis: faite('Devis-four-2026-0418.pdf', 640_000, 'Document lisible, 2 pages'),
    attestation: { statut: 'recue' as const, fichier: fichier('Attestation-regularite.pdf', 220_000) } }
  if (id === 'cours') return { ...six, bilans: { statut: 'a-fournir' as const } }
  if (id === 'corriger') return { ...six, bilans: { statut: 'a-corriger' as const, fichier: fichier('Bilan-2024.pdf', 2_300_000), message: 'La page 2 du bilan est manquante.', alerteBilanDonnee: true } }
  if (id === 'offline') return { ...six, bilans: { statut: 'a-fournir' as const } }
  // pret, apres : toutes les obligatoires faites, une recommandée restante
  return { ...six, bilans: faite('Bilan-2024.pdf', 2_900_000, 'Document lisible, 3 pages'), statuts: faite('Statuts.pdf', 380_000), plan: { statut: 'non-applicable', raison: 'Je finance sur fonds propres, sans prêt à détailler.' } }
}

export const usePieces = create<S>()(
  persist(
    (set) => ({
      etat: structuredClone(ETAT_INITIAL), savedAt: hhmm(), invitation: null, consentement: false, numero: null, envoyeLe: null,
      hors_ligne: false, session_expiree: false, erreur: null, objet: 'Achat d’un four',
      patch: (id, p) => set((s) => ({ etat: { ...s.etat, [id]: { ...s.etat[id], ...p } }, savedAt: s.hors_ligne ? s.savedAt : hhmm() })),
      inviter: (invitation) => set((s) => {
        const etat = { ...s.etat }
        for (const id of invitation.pieces) if (etat[id].statut === 'a-fournir') etat[id] = { ...etat[id], statut: 'attente-experte' }
        return { invitation, etat, savedAt: hhmm() }
      }),
      revoquer: () => set((s) => {
        const etat = { ...s.etat }
        for (const p of PIECES) if (etat[p.id].statut === 'attente-experte') etat[p.id] = { statut: 'a-fournir' }
        return { invitation: s.invitation ? { ...s.invitation, revoquee: true } : null, etat, savedAt: hhmm() }
      }),
      set: (p) => set(p),
      charger: (id) => set({ etat: preset(id), savedAt: hhmm(), invitation: null, consentement: false, numero: id === 'apres' ? 'ELAN-2026-04817' : null, envoyeLe: id === 'apres' ? new Date().toISOString() : null, hors_ligne: id === 'offline', session_expiree: false, erreur: null }),
      reset: () => set({ etat: structuredClone(ETAT_INITIAL), savedAt: hhmm(), invitation: null, consentement: false, numero: null, envoyeLe: null, hors_ligne: false, session_expiree: false, erreur: null }),
    }),
    { name: 'elan:pieces:v2' },
  ),
)
