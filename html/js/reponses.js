import { REFERENTIEL } from "./engine.js";
const SOURCE = REFERENTIEL;
const REPONSES = {
  "kbis-ou": { texte: "Le Kbis se t\xE9l\xE9charge gratuitement sur infogreffe.fr avec votre num\xE9ro SIREN. Votre expert-comptable peut aussi l\u2019\xE9diter en quelques minutes." },
  "kbis-valide": { texte: "Un Kbis est accept\xE9 s\u2019il date de moins de 3 mois au jour de l\u2019envoi. S\u2019il est plus ancien, ret\xE9l\xE9chargez-le : c\u2019est gratuit." },
  "id-photo": { texte: "Oui, une photo suffit si le texte est net, sans reflet, et si le recto et le verso sont fournis dans un m\xEAme fichier." },
  "rib-perso": { texte: "Le r\xE9f\xE9rentiel demande le compte de l\u2019entreprise. Si vous n\u2019en avez pas encore, dites-le \xE0 un conseiller avant l\u2019envoi.", incertain: true },
  "statuts-pourquoi": { texte: "Les statuts pr\xE9cisent qui d\xE9cide et qui d\xE9tient l\u2019entreprise. La pi\xE8ce est recommand\xE9e : sans elle, vous pouvez envoyer, mais l\u2019instruction peut demander un \xE9change de plus." },
  "bilan-valide": { texte: "Il faut les bilans des deux derniers exercices clos, complets : toutes les pages, y compris l\u2019annexe. Un bilan en cours d\u2019ann\xE9e ne convient pas." },
  "bilan-encours": { texte: "Fournissez les deux derniers exercices clos. Pour l\u2019exercice en cours, une situation interm\xE9diaire de votre expert-comptable peut accompagner le dossier, sans remplacer un bilan.", incertain: true },
  "liasse-quoi": { texte: "C\u2019est l\u2019ensemble des formulaires de chiffres d\xE9clar\xE9s chaque ann\xE9e \xE0 l\u2019administration fiscale. Votre expert-comptable la d\xE9pose, vous la retrouvez dans votre espace professionnel." },
  "attest-delai": { texte: "Si l\u2019attestation est refus\xE9e, une dette fiscale ou sociale est probablement en cours. Je ne peux pas en dire plus : un conseiller peut regarder votre situation avec vous.", incertain: true },
  "devis-ht": { texte: "Le r\xE9f\xE9rentiel demande le prix hors taxes, avec le nom du fournisseur et la date. Un devis TTC reste lisible, mais le HT doit appara\xEEtre." },
  "plan-modele": { texte: "Un tableau simple suffit : les besoins d\u2019un c\xF4t\xE9 (four, installation), les ressources de l\u2019autre (apport, pr\xEAt). Votre expert-comptable peut le pr\xE9parer \xE0 partir du devis." },
  eligible: { texte: "Je ne peux pas me prononcer sur votre \xE9ligibilit\xE9. Votre pr\xE9-\xE9ligibilit\xE9 est un r\xE9sultat indicatif : c\u2019est votre charg\xE9 d\u2019affaires qui d\xE9cide. Un conseiller peut vous r\xE9pondre.", incertain: true },
  confidentialite: { texte: "Vos documents sont h\xE9berg\xE9s en France et chiffr\xE9s. Ils sont vus par votre charg\xE9 d\u2019affaires, et par la personne que vous invitez pour les pi\xE8ces seulement. Ils ne servent jamais \xE0 entra\xEEner une IA." }
};
const GENERALES = [{ id: "eligible", question: "Suis-je \xE9ligible ?" }, { id: "confidentialite", question: "Qui voit mes documents ?" }];
export {
  GENERALES,
  REPONSES,
  SOURCE
};
