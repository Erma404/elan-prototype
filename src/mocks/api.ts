import type { PieceDef } from '../domain/pieces'

export type ErreurInjectee = null | 'reseau' | 'fichier-lourd' | 'ia'
export const attente = (min = 300, max = 900) => new Promise<void>((r) => setTimeout(r, min + Math.random() * (max - min)))

export class ErreurReseau extends Error {}

/** Simule le téléversement : latence réaliste, progression, erreur réseau injectable. */
export async function televerser(file: File, onProgress: (p: number) => void, erreur: ErreurInjectee): Promise<void> {
  const etapes = 8
  for (let i = 1; i <= etapes; i++) {
    await attente(60, 140)
    if (erreur === 'reseau' && i === 4) throw new ErreurReseau('La connexion a été interrompue pendant l’envoi.')
    onProgress(Math.round((i / etapes) * 100))
  }
  void file
}

export type Verification = { ok: true; detail: string } | { ok: false; detail: string }
/** Vérification automatique (vague 2) : 1 à 2 s. L'IA alerte, elle ne bloque jamais. */
export async function verifierDocument(piece: PieceDef, taille: number, deja: boolean): Promise<Verification> {
  await attente(1000, 2000)
  if (piece.id === 'bilans' && !deja) return { ok: false, detail: 'La page 2 du bilan est manquante.' }
  const pages = Math.max(1, Math.min(4, Math.round(taille / 400_000) + 1))
  return { ok: true, detail: `Document lisible, ${pages} page${pages > 1 ? 's' : ''}` }
}

export async function envoyerDemande(erreur: ErreurInjectee): Promise<{ numero: string }> {
  await attente(700, 1400)
  if (erreur === 'reseau') throw new ErreurReseau('L’envoi n’a pas abouti. Rien n’est perdu.')
  return { numero: 'ELAN-2026-04817' }
}
