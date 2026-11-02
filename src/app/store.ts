import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Answers } from '../domain/types'

/** Persona Fabienne : uniquement les faits du brief (atelier de céramique, 3 salariés, 4 ans, un four). Aucun montant. */
export const FABIENNE: Partial<Answers> = { projet: 'equipement', effectif: 3, anciennete: 4, secteur: 'artisanat' }

type Demande = {
  answers: Partial<Answers>
  step: number
  financementId: string | null
  setAnswer: <K extends keyof Answers>(k: K, v: Answers[K]) => void
  setStep: (n: number) => void
  choisir: (id: string) => void
  reset: () => void
}

export const useDemande = create<Demande>()(
  persist(
    (set) => ({
      answers: { ...FABIENNE },
      step: 0,
      financementId: null,
      setAnswer: (k, v) => set((s) => ({ answers: { ...s.answers, [k]: v } })),
      setStep: (step) => set({ step }),
      choisir: (financementId) => set({ financementId }),
      reset: () => set({ answers: { ...FABIENNE }, step: 0, financementId: null }),
    }),
    { name: 'elan:demande:v2' },
  ),
)

/** Réglages du panneau de démonstration. */
type Ui = { bandeauMasque: boolean; persona: 'fabienne' | 'experte' | 'nicolas'; set: (p: Partial<Pick<Ui, 'bandeauMasque' | 'persona'>>) => void }
export const useUi = create<Ui>()(persist((set) => ({ bandeauMasque: false, persona: 'fabienne', set: (p) => set(p) }), { name: 'elan:ui' }))

/** Montant souhaité : uniquement ce que l'utilisateur a saisi. Jamais de valeur de repli. */
export const useMontant = () => useDemande((s) => s.answers.montant)
