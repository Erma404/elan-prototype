export type Statut = 'pret' | 'corriger' | 'incomplet'
export type DossierAutre = { id: string; entreprise: string; dirigeant: string; financement: string; envoi: string; faites: number; total: number; statut: Statut; corrections: number }

/** Dossiers fictifs de la file de travail (vague 2, affichés en démonstration). Noms inventés. */
export const AUTRES: DossierAutre[] = [
  { id: 'menuiserie', entreprise: 'Menuiserie Verdier', dirigeant: 'Paul V.', financement: 'Garantie Croissance TPE', envoi: '2026-10-29', faites: 9, total: 9, statut: 'pret', corrections: 0 },
  { id: 'boulangerie', entreprise: 'Boulangerie des Halles', dirigeant: 'Inès B.', financement: 'Prêt Équipement Artisans', envoi: '2026-10-30', faites: 7, total: 9, statut: 'corriger', corrections: 2 },
  { id: 'studio', entreprise: 'Studio Lumen', dirigeant: 'Karim D.', financement: 'Avance Innovation', envoi: '2026-11-01', faites: 5, total: 9, statut: 'incomplet', corrections: 0 },
]
