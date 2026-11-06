const GROUPES = [
  { id: "entreprise", titre: "Votre entreprise", description: "Pour v\xE9rifier qui vous \xEAtes." },
  { id: "situation", titre: "Votre situation financi\xE8re", description: "Pour comprendre la sant\xE9 de l\u2019activit\xE9." },
  { id: "projet", titre: "Votre projet", description: "Pour chiffrer ce que vous financez." }
];
const PIECES = [
  {
    id: "kbis",
    groupe: "entreprise",
    nom: "Kbis de moins de 3 mois",
    obligatoire: true,
    pourquoi: "Nous v\xE9rifions que l\u2019entreprise existe et que son dirigeant est bien celui de la demande.",
    ouTrouver: ["Gratuitement sur infogreffe.fr, avec votre num\xE9ro SIREN.", "Aupr\xE8s de votre expert-comptable, qui peut l\u2019\xE9diter en quelques minutes."],
    exemple: { titre: "Extrait Kbis", lignes: ["Atelier Argile & Feu SAS", "SIREN", "Date d\u2019immatriculation", "Dirigeant\xB7e"] },
    suggestions: [{ id: "kbis-ou", question: "O\xF9 trouver mon Kbis ?" }, { id: "kbis-valide", question: "Mon Kbis est-il encore valable ?" }]
  },
  {
    id: "identite",
    groupe: "entreprise",
    nom: "Pi\xE8ce d\u2019identit\xE9 du dirigeant",
    obligatoire: true,
    pourquoi: "Nous rapprochons votre identit\xE9 de celle du Kbis, pour s\xE9curiser votre dossier.",
    ouTrouver: ["Votre carte d\u2019identit\xE9 ou votre passeport, recto et verso, en cours de validit\xE9.", "Une photo prise avec votre t\xE9l\xE9phone suffit si le texte reste lisible."],
    exemple: { titre: "Carte nationale d\u2019identit\xE9", lignes: ["Nom, pr\xE9nom", "Date de naissance", "Date de validit\xE9"] },
    suggestions: [{ id: "id-photo", question: "Une photo de ma carte suffit-elle ?" }]
  },
  {
    id: "rib",
    groupe: "entreprise",
    nom: "RIB de l\u2019entreprise",
    obligatoire: true,
    pourquoi: "Il indique le compte sur lequel le financement serait vers\xE9.",
    ouTrouver: ["Dans l\u2019espace de votre banque, rubrique \xAB Mes comptes \xBB, \xAB RIB \xBB.", "Sur un relev\xE9 de compte professionnel r\xE9cent."],
    exemple: { titre: "Relev\xE9 d\u2019identit\xE9 bancaire", lignes: ["Titulaire : Atelier Argile & Feu", "IBAN FR76 0000 0000 0000", "BIC XXXXFRPP"] },
    suggestions: [{ id: "rib-perso", question: "Puis-je fournir un compte personnel ?" }]
  },
  {
    id: "statuts",
    groupe: "entreprise",
    nom: "Statuts de l\u2019entreprise \xE0 jour",
    obligatoire: false,
    pourquoi: "Ils nous aident \xE0 comprendre qui d\xE9cide et qui d\xE9tient l\u2019entreprise. Utile, pas bloquant.",
    ouTrouver: ["Dans vos documents de cr\xE9ation, ou aupr\xE8s de votre expert-comptable.", "Sur infogreffe.fr, rubrique \xAB Actes et statuts \xBB, pour quelques euros."],
    exemple: { titre: "Statuts", lignes: ["Article 1 : forme", "Article 2 : objet", "Article 8 : capital"] },
    suggestions: [{ id: "statuts-pourquoi", question: "Pourquoi est-ce recommand\xE9 ?" }]
  },
  {
    id: "bilans",
    groupe: "situation",
    nom: "Bilans des deux derniers exercices",
    obligatoire: true,
    pourquoi: "Ils montrent la sant\xE9 de l\u2019activit\xE9 sur deux ans, pas seulement aujourd\u2019hui.",
    ouTrouver: ["Aupr\xE8s de votre expert-comptable, qui les a produits.", "Dans votre logiciel de comptabilit\xE9, rubrique \xAB Bilans et liasses \xBB."],
    exemple: { titre: "Bilan 2024", lignes: ["Actif : XXX XXX \u20AC", "Passif : XXX XXX \u20AC", "R\xE9sultat de l\u2019exercice : XX XXX \u20AC", "Page 1"] },
    suggestions: [{ id: "bilan-valide", question: "Mon bilan est-il valable ?" }, { id: "bilan-encours", question: "Mon exercice 2025 n\u2019est pas clos, que faire ?" }]
  },
  {
    id: "liasse",
    groupe: "situation",
    nom: "Liasse fiscale",
    obligatoire: true,
    pourquoi: "Elle d\xE9taille les chiffres d\xE9clar\xE9s \xE0 l\u2019administration, que nous rapprochons du bilan.",
    ouTrouver: ["Dans votre espace professionnel sur impots.gouv.fr.", "Aupr\xE8s de votre expert-comptable, qui la d\xE9pose chaque ann\xE9e."],
    exemple: { titre: "Liasse fiscale 2024", lignes: ["Formulaire 2050", "Formulaire 2051", "Formulaire 2052"] },
    suggestions: [{ id: "liasse-quoi", question: "C\u2019est quoi, une liasse fiscale ?" }]
  },
  {
    id: "attestation",
    groupe: "situation",
    nom: "Attestation de r\xE9gularit\xE9 fiscale et sociale",
    obligatoire: true,
    pourquoi: "Elle prouve que vos imp\xF4ts et cotisations sont \xE0 jour.",
    ouTrouver: ["Sur impots.gouv.fr (r\xE9gularit\xE9 fiscale) et urssaf.fr (r\xE9gularit\xE9 sociale).", "Aupr\xE8s de votre expert-comptable, qui sait les t\xE9l\xE9charger."],
    exemple: { titre: "Attestation de r\xE9gularit\xE9", lignes: ["D\xE9livr\xE9e par l\u2019administration", "\xC0 jour de ses obligations", "Date de d\xE9livrance"] },
    suggestions: [{ id: "attest-delai", question: "Elle est refus\xE9e, que faire ?" }]
  },
  {
    id: "devis",
    groupe: "projet",
    nom: "Devis ou facture proforma",
    obligatoire: true,
    pourquoi: "Il fixe le prix exact de l\u2019\xE9quipement que nous finan\xE7ons.",
    ouTrouver: ["Aupr\xE8s de votre fournisseur, avec son nom, sa date et le prix hors taxes.", "Deux devis valent mieux qu\u2019un si vous h\xE9sitez entre deux offres."],
    exemple: { titre: "Devis n\xB0 2026-0418", lignes: ["Four, mod\xE8le indiqu\xE9", "Prix HT : XX XXX \u20AC", "TVA : X XXX \u20AC", "Date et dur\xE9e de validit\xE9"] },
    suggestions: [{ id: "devis-ht", question: "Prix HT ou TTC ?" }]
  },
  {
    id: "plan",
    groupe: "projet",
    nom: "Plan de financement",
    obligatoire: false,
    pourquoi: "Il montre d\u2019o\xF9 vient chaque euro du projet. Recommand\xE9, il acc\xE9l\xE8re l\u2019instruction.",
    ouTrouver: ["Votre expert-comptable peut le pr\xE9parer \xE0 partir du devis.", "Un tableau simple suffit : besoins d\u2019un c\xF4t\xE9, ressources de l\u2019autre."],
    exemple: { titre: "Plan de financement", lignes: ["Besoins : \xE9quipement, installation", "Ressources : apport, pr\xEAt", "Total : XX XXX \u20AC"] },
    suggestions: [{ id: "plan-modele", question: "Avez-vous un mod\xE8le ?" }]
  }
];
const pieceById = (id) => PIECES.find((p) => p.id === id);
const complete = (s) => s === "recue" || s === "verifiee" || s === "non-applicable";
const ETAT_INITIAL = Object.fromEntries(PIECES.map((p) => [p.id, { statut: "a-fournir" }]));
function compter(etat) {
  const faites = PIECES.filter((p) => complete(etat[p.id].statut)).length;
  const bloquantes = PIECES.filter((p) => p.obligatoire && !complete(etat[p.id].statut));
  const recommandees = PIECES.filter((p) => !p.obligatoire && !complete(etat[p.id].statut));
  const aCorriger = PIECES.filter((p) => etat[p.id].statut === "a-corriger");
  const manquantes = bloquantes.filter((p) => etat[p.id].statut !== "a-corriger");
  return { faites, total: PIECES.length, bloquantes, recommandees, aCorriger, manquantes };
}
export {
  ETAT_INITIAL,
  GROUPES,
  PIECES,
  complete,
  compter,
  pieceById
};
