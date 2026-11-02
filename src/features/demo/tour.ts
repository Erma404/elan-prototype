import { create } from 'zustand'

export type Etape = { route: string; titre: string; texte: string; etat?: 'cours' | 'pret' | 'apres' }
/** Visite guidée de 3 minutes, alignée sur docs/demo-script.md. */
export const ETAPES: Etape[] = [
  { route: '/', titre: '0:00, la promesse', texte: 'Pas d’assistant en vitrine : une promesse concrète. On ne se perd pas sur la page d’accueil, on se perd au moment du doute.' },
  { route: '/eligibilite', titre: '0:25, avoir une chance', texte: 'Cinq questions. Choisissez un montant avec la jauge : il reste affiché à chaque étape. Le panneau de droite se met à jour à chaque réponse.' },
  { route: '/demande/pieces', titre: '0:55, l’écran abouti', texte: 'Chaque pièce dit pourquoi on la demande, où la trouver, et montre un exemple. Le bouton « Pièce suivante » guide la suite, et rien ne fait défiler la page.', etat: 'cours' },
  { route: '/demande/pieces', titre: '1:30, L’IA prépare, vous validez', texte: 'Déposez le bilan : l’IA alerte (« la page 2 est manquante ») mais ne bloque jamais. L’assistant cite sa source et ne se prononce jamais sur l’éligibilité.', etat: 'cours' },
  { route: '/demande/recapitulatif', titre: '2:05, droit à l’erreur', texte: 'Tout reste modifiable, avant comme après l’envoi. L’envoi est bloqué tant qu’une pièce obligatoire manque, avec la liste cliquable.', etat: 'pret' },
  { route: '/pro/dossiers/argile', titre: '2:35, côté Nicolas', texte: 'Il reçoit un dossier complet : complétude, critères vérifiés par pièce, journal, relance en un clic. C’est ce qui fait passer le temps de relance de 45 à environ 25 minutes.', etat: 'apres' },
]
export const useTour = create<{ actif: boolean; i: number; pause: boolean; set: (p: Partial<{ actif: boolean; i: number; pause: boolean }>) => void }>((set) => ({ actif: false, i: 0, pause: false, set: (p) => set(p) }))
