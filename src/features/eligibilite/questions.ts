import type { Answers } from '../../domain/types'

export type Choice<V> = { value: V; label: string; description?: string; icon?: string }
export type ChoiceQuestion<K extends keyof Answers> = { key: K; kind: 'choice'; titre: string; aide: string; options: Choice<Answers[K]>[] }
export type SliderQuestion = { key: 'montant'; kind: 'slider'; titre: string; aide: string; min: number; max: number; step: number; presets: number[] }

export const QUESTIONS = [
  { key: 'projet', kind: 'choice', titre: 'Quel est votre projet ?', aide: 'Choisissez ce qui s’en rapproche le plus.', options: [
    { value: 'equipement', label: 'Acheter un équipement', description: 'Machine, four, véhicule, outillage', icon: 'flame' },
    { value: 'recrutement', label: 'Recruter', description: 'Un premier salarié ou un renfort', icon: 'briefcase' },
    { value: 'innovation', label: 'Innover', description: 'Un nouveau produit, service ou procédé', icon: 'innovation' },
    { value: 'export', label: 'Exporter', description: 'Prospecter ou livrer à l’étranger', icon: 'route' },
    { value: 'reprise', label: 'Reprendre une entreprise', description: 'Racheter une activité existante', icon: 'signature' },
  ] } satisfies ChoiceQuestion<'projet'>,
  { key: 'effectif', kind: 'choice', titre: 'Combien de personnes travaillent dans votre entreprise ?', aide: 'Vous comprise, salariés en CDI ou CDD.', options: [
    { value: 0, label: 'Moi seul·e' }, { value: 3, label: '2 à 5 personnes' }, { value: 8, label: '6 à 9 personnes' }, { value: 20, label: '10 à 49 personnes' }, { value: 60, label: '50 personnes ou plus' },
  ] } satisfies ChoiceQuestion<'effectif'>,
  { key: 'anciennete', kind: 'choice', titre: 'Depuis combien de temps existe-t-elle ?', aide: 'Depuis la date d’immatriculation.', options: [
    { value: 0.5, label: 'Moins d’un an' }, { value: 1.5, label: '1 à 2 ans' }, { value: 4, label: '2 à 5 ans' }, { value: 8, label: 'Plus de 5 ans' },
  ] } satisfies ChoiceQuestion<'anciennete'>,
  { key: 'montant', kind: 'slider', titre: 'Quel montant cherchez-vous ?', aide: 'Une estimation suffit, vous pourrez l’ajuster.', min: 5000, max: 250000, step: 5000, presets: [20000, 50000, 80000, 150000] } satisfies SliderQuestion,
  { key: 'secteur', kind: 'choice', titre: 'Dans quel secteur travaillez-vous ?', aide: 'Choisissez l’activité principale.', options: [
    { value: 'artisanat', label: 'Artisanat', description: 'Céramique, bois, métal, bâtiment, alimentaire' },
    { value: 'commerce', label: 'Commerce', description: 'Boutique, vente en ligne, distribution' },
    { value: 'services', label: 'Services', description: 'Conseil, numérique, santé, formation' },
    { value: 'industrie', label: 'Industrie', description: 'Fabrication, transformation, production' },
  ] } satisfies ChoiceQuestion<'secteur'>,
] as const
