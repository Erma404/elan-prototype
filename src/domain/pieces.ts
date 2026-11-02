import type { PieceStatus } from '../components/ui'

export type GroupeId = 'entreprise' | 'situation' | 'projet'
export type PieceDef = {
  id: string
  groupe: GroupeId
  nom: string
  obligatoire: boolean
  pourquoi: string
  ouTrouver: [string, string]
  exemple: { titre: string; lignes: string[] }
  suggestions: { id: string; question: string }[]
}

export const GROUPES: { id: GroupeId; titre: string; description: string }[] = [
  { id: 'entreprise', titre: 'Votre entreprise', description: 'Pour vérifier qui vous êtes.' },
  { id: 'situation', titre: 'Votre situation financière', description: 'Pour comprendre la santé de l’activité.' },
  { id: 'projet', titre: 'Votre projet', description: 'Pour chiffrer ce que vous financez.' },
]

export const PIECES: PieceDef[] = [
  { id: 'kbis', groupe: 'entreprise', nom: 'Kbis de moins de 3 mois', obligatoire: true,
    pourquoi: 'Nous vérifions que l’entreprise existe et que son dirigeant est bien celui de la demande.',
    ouTrouver: ['Gratuitement sur infogreffe.fr, avec votre numéro SIREN.', 'Auprès de votre expert-comptable, qui peut l’éditer en quelques minutes.'],
    exemple: { titre: 'Extrait Kbis', lignes: ['Atelier Argile & Feu SAS', 'SIREN', 'Date d’immatriculation', 'Dirigeant·e'] },
    suggestions: [{ id: 'kbis-ou', question: 'Où trouver mon Kbis ?' }, { id: 'kbis-valide', question: 'Mon Kbis est-il encore valable ?' }] },
  { id: 'identite', groupe: 'entreprise', nom: 'Pièce d’identité du dirigeant', obligatoire: true,
    pourquoi: 'Nous rapprochons votre identité de celle du Kbis, pour sécuriser votre dossier.',
    ouTrouver: ['Votre carte d’identité ou votre passeport, recto et verso, en cours de validité.', 'Une photo prise avec votre téléphone suffit si le texte reste lisible.'],
    exemple: { titre: 'Carte nationale d’identité', lignes: ['Nom, prénom', 'Date de naissance', 'Date de validité'] },
    suggestions: [{ id: 'id-photo', question: 'Une photo de ma carte suffit-elle ?' }] },
  { id: 'rib', groupe: 'entreprise', nom: 'RIB de l’entreprise', obligatoire: true,
    pourquoi: 'Il indique le compte sur lequel le financement serait versé.',
    ouTrouver: ['Dans l’espace de votre banque, rubrique « Mes comptes », « RIB ».', 'Sur un relevé de compte professionnel récent.'],
    exemple: { titre: 'Relevé d’identité bancaire', lignes: ['Titulaire : Atelier Argile & Feu', 'IBAN FR76 0000 0000 0000', 'BIC XXXXFRPP'] },
    suggestions: [{ id: 'rib-perso', question: 'Puis-je fournir un compte personnel ?' }] },
  { id: 'statuts', groupe: 'entreprise', nom: 'Statuts de l’entreprise à jour', obligatoire: false,
    pourquoi: 'Ils nous aident à comprendre qui décide et qui détient l’entreprise. Utile, pas bloquant.',
    ouTrouver: ['Dans vos documents de création, ou auprès de votre expert-comptable.', 'Sur infogreffe.fr, rubrique « Actes et statuts », pour quelques euros.'],
    exemple: { titre: 'Statuts', lignes: ['Article 1 : forme', 'Article 2 : objet', 'Article 8 : capital'] },
    suggestions: [{ id: 'statuts-pourquoi', question: 'Pourquoi est-ce recommandé ?' }] },
  { id: 'bilans', groupe: 'situation', nom: 'Bilans des deux derniers exercices', obligatoire: true,
    pourquoi: 'Ils montrent la santé de l’activité sur deux ans, pas seulement aujourd’hui.',
    ouTrouver: ['Auprès de votre expert-comptable, qui les a produits.', 'Dans votre logiciel de comptabilité, rubrique « Bilans et liasses ».'],
    exemple: { titre: 'Bilan 2024', lignes: ['Actif : XXX XXX €', 'Passif : XXX XXX €', 'Résultat de l’exercice : XX XXX €', 'Page 1'] },
    suggestions: [{ id: 'bilan-valide', question: 'Mon bilan est-il valable ?' }, { id: 'bilan-encours', question: 'Mon exercice 2025 n’est pas clos, que faire ?' }] },
  { id: 'liasse', groupe: 'situation', nom: 'Liasse fiscale', obligatoire: true,
    pourquoi: 'Elle détaille les chiffres déclarés à l’administration, que nous rapprochons du bilan.',
    ouTrouver: ['Dans votre espace professionnel sur impots.gouv.fr.', 'Auprès de votre expert-comptable, qui la dépose chaque année.'],
    exemple: { titre: 'Liasse fiscale 2024', lignes: ['Formulaire 2050', 'Formulaire 2051', 'Formulaire 2052'] },
    suggestions: [{ id: 'liasse-quoi', question: 'C’est quoi, une liasse fiscale ?' }] },
  { id: 'attestation', groupe: 'situation', nom: 'Attestation de régularité fiscale et sociale', obligatoire: true,
    pourquoi: 'Elle prouve que vos impôts et cotisations sont à jour.',
    ouTrouver: ['Sur impots.gouv.fr (régularité fiscale) et urssaf.fr (régularité sociale).', 'Auprès de votre expert-comptable, qui sait les télécharger.'],
    exemple: { titre: 'Attestation de régularité', lignes: ['Délivrée par l’administration', 'À jour de ses obligations', 'Date de délivrance'] },
    suggestions: [{ id: 'attest-delai', question: 'Elle est refusée, que faire ?' }] },
  { id: 'devis', groupe: 'projet', nom: 'Devis du four', obligatoire: true,
    pourquoi: 'Il fixe le prix exact de l’équipement que nous finançons.',
    ouTrouver: ['Auprès du fournisseur du four, avec son nom, sa date et le prix hors taxes.', 'Deux devis valent mieux qu’un si vous hésitez entre deux modèles.'],
    exemple: { titre: 'Devis n° 2026-0418', lignes: ['Four, modèle indiqué', 'Prix HT : XX XXX €', 'TVA : X XXX €', 'Date et durée de validité'] },
    suggestions: [{ id: 'devis-ht', question: 'Prix HT ou TTC ?' }] },
  { id: 'plan', groupe: 'projet', nom: 'Plan de financement', obligatoire: false,
    pourquoi: 'Il montre d’où vient chaque euro du projet. Recommandé, il accélère l’instruction.',
    ouTrouver: ['Votre expert-comptable peut le préparer à partir du devis.', 'Un tableau simple suffit : besoins d’un côté, ressources de l’autre.'],
    exemple: { titre: 'Plan de financement', lignes: ['Besoins : four, installation', 'Ressources : apport, prêt', 'Total : XX XXX €'] },
    suggestions: [{ id: 'plan-modele', question: 'Avez-vous un modèle ?' }] },
]

export const pieceById = (id: string) => PIECES.find((p) => p.id === id)!

export type PieceState = {
  statut: PieceStatus
  fichier?: { nom: string; taille: number }
  progress?: number
  message?: string          // motif de correction ou d'alerte
  raison?: string           // raison de « non applicable »
  reporte?: boolean         // « Je ne l'ai pas encore »
  verifie?: string          // résultat de la vérification automatique
  alerteBilanDonnee?: boolean
}

export const complete = (s: PieceStatus) => s === 'recue' || s === 'verifiee' || s === 'non-applicable'

export const ETAT_INITIAL: Record<string, PieceState> = Object.fromEntries(PIECES.map((p) => [p.id, { statut: 'a-fournir' as PieceStatus }]))

export function compter(etat: Record<string, PieceState>) {
  const faites = PIECES.filter((p) => complete(etat[p.id].statut)).length
  const bloquantes = PIECES.filter((p) => p.obligatoire && !complete(etat[p.id].statut))
  const recommandees = PIECES.filter((p) => !p.obligatoire && !complete(etat[p.id].statut))
  return { faites, total: PIECES.length, bloquantes, recommandees }
}
