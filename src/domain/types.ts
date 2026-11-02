export type Projet = 'equipement' | 'recrutement' | 'innovation' | 'export' | 'reprise'
export type Secteur = 'artisanat' | 'commerce' | 'services' | 'industrie'

export type Answers = {
  projet: Projet
  effectif: number
  anciennete: number
  montant: number
  secteur: Secteur
}

export type Financement = {
  id: string
  nom: string
  resume: string
  projets: Projet[]
  secteurs: Secteur[]
  effectifMax: number
  ancienneteMin: number
  montantMin: number
  montantMax: number
  montantIndicatif: string
  delai: string
}

export type CritereId = keyof Answers
export type Critere = { id: CritereId; label: string; ok: boolean | null; raison: string }
export type Evaluation = {
  financement: Financement
  criteres: Critere[]
  /** possible : tous les critères répondus sont remplis ; ecarte : au moins un échoue ; en-attente : rien d'échoué mais des réponses manquent */
  statut: 'possible' | 'ecarte' | 'en-attente'
  score: number
  pourquoiPas?: string
}
