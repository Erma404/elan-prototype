import { REFERENTIEL } from '../../domain/eligibility'

export const SOURCE = REFERENTIEL
export type Reponse = { texte: string; incertain?: boolean }

/** Réponses scriptées. L'assistant explique une pièce et dit où la trouver ; il ne se prononce jamais sur l'éligibilité. */
export const REPONSES: Record<string, Reponse> = {
  'kbis-ou': { texte: 'Le Kbis se télécharge gratuitement sur infogreffe.fr avec votre numéro SIREN. Votre expert-comptable peut aussi l’éditer en quelques minutes.' },
  'kbis-valide': { texte: 'Un Kbis est accepté s’il date de moins de 3 mois au jour de l’envoi. S’il est plus ancien, retéléchargez-le : c’est gratuit.' },
  'id-photo': { texte: 'Oui, une photo suffit si le texte est net, sans reflet, et si le recto et le verso sont fournis dans un même fichier.' },
  'rib-perso': { texte: 'Le référentiel demande le compte de l’entreprise. Si vous n’en avez pas encore, dites-le à un conseiller avant l’envoi.', incertain: true },
  'statuts-pourquoi': { texte: 'Les statuts précisent qui décide et qui détient l’entreprise. La pièce est recommandée : sans elle, vous pouvez envoyer, mais l’instruction peut demander un échange de plus.' },
  'bilan-valide': { texte: 'Il faut les bilans des deux derniers exercices clos, complets : toutes les pages, y compris l’annexe. Un bilan en cours d’année ne convient pas.' },
  'bilan-encours': { texte: 'Fournissez les deux derniers exercices clos. Pour l’exercice en cours, une situation intermédiaire de votre expert-comptable peut accompagner le dossier, sans remplacer un bilan.', incertain: true },
  'liasse-quoi': { texte: 'C’est l’ensemble des formulaires de chiffres déclarés chaque année à l’administration fiscale. Votre expert-comptable la dépose, vous la retrouvez dans votre espace professionnel.' },
  'attest-delai': { texte: 'Si l’attestation est refusée, une dette fiscale ou sociale est probablement en cours. Je ne peux pas en dire plus : un conseiller peut regarder votre situation avec vous.', incertain: true },
  'devis-ht': { texte: 'Le référentiel demande le prix hors taxes, avec le nom du fournisseur et la date. Un devis TTC reste lisible, mais le HT doit apparaître.' },
  'plan-modele': { texte: 'Un tableau simple suffit : les besoins d’un côté (four, installation), les ressources de l’autre (apport, prêt). Votre expert-comptable peut le préparer à partir du devis.' },
  eligible: { texte: 'Je ne peux pas me prononcer sur votre éligibilité. Votre pré-éligibilité est un résultat indicatif : c’est votre chargé d’affaires qui décide. Un conseiller peut vous répondre.', incertain: true },
  confidentialite: { texte: 'Vos documents sont hébergés en France et chiffrés. Ils sont vus par votre chargé d’affaires, et par la personne que vous invitez pour les pièces seulement. Ils ne servent jamais à entraîner une IA.' },
}
export const GENERALES = [{ id: 'eligible', question: 'Suis-je éligible ?' }, { id: 'confidentialite', question: 'Qui voit mes documents ?' }]
