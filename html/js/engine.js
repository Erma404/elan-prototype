import data from "./financements.js";
const REFERENTIEL = data.version;
const financements = data.financements;
const alternatives = data.alternatives;
const LIBELLES_PROJET = {
  equipement: "acheter un \xE9quipement",
  recrutement: "recruter",
  innovation: "innover",
  export: "exporter",
  reprise: "reprendre une entreprise"
};
const LIBELLES_SECTEUR = { artisanat: "l\u2019artisanat", commerce: "le commerce", services: "les services", industrie: "l\u2019industrie" };
const eur = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
function evaluer(f, a) {
  const c = [];
  const add = (id, label, ok, raison) => c.push({ id, label, ok, raison });
  add("projet", "Votre projet est couvert", a.projet == null ? null : f.projets.includes(a.projet), a.projet == null ? "" : `Ce financement ne couvre pas \xAB ${LIBELLES_PROJET[a.projet]} \xBB.`);
  add("effectif", "Votre effectif entre dans le cadre", a.effectif == null ? null : a.effectif <= f.effectifMax, "Votre entreprise d\xE9passe l\u2019effectif pr\xE9vu pour ce financement.");
  add("anciennete", "Votre anciennet\xE9 est suffisante", a.anciennete == null ? null : a.anciennete >= f.ancienneteMin, "Votre entreprise est trop r\xE9cente pour ce financement.");
  add("montant", "Votre montant entre dans la fourchette", a.montant == null ? null : a.montant >= f.montantMin && a.montant <= f.montantMax, a.montant != null && a.montant > f.montantMax ? "Le montant demand\xE9 d\xE9passe ce que finance ce dispositif." : "Le montant demand\xE9 est inf\xE9rieur \xE0 ce que finance ce dispositif.");
  add("secteur", "Votre secteur est \xE9ligible", a.secteur == null ? null : f.secteurs.includes(a.secteur), a.secteur == null ? "" : `Il ne couvre pas encore ${LIBELLES_SECTEUR[a.secteur]}.`);
  const echec = c.find((x) => x.ok === false);
  const score = c.filter((x) => x.ok === true).length;
  const statut = echec ? "ecarte" : c.every((x) => x.ok === true) ? "possible" : "en-attente";
  return { financement: f, criteres: c, statut, score, pourquoiPas: echec?.raison };
}
function evaluerTous(a) {
  return financements.map((f) => evaluer(f, a));
}
function retenus(a) {
  return evaluerTous(a).filter((e) => e.statut !== "ecarte").sort((x, y) => y.score - x.score || x.financement.montantMax - y.financement.montantMax).slice(0, 3);
}
const ecartes = (a) => evaluerTous(a).filter((e) => e.statut === "ecarte");
function leCritereManquant(a) {
  const tous = evaluerTous(a);
  if (!tous.length) return null;
  const proche = [...tous].sort((x, y) => x.criteres.filter((c) => c.ok === false).length - y.criteres.filter((c) => c.ok === false).length)[0];
  return { financement: proche.financement, manque: proche.criteres.filter((c) => c.ok === false) };
}
const trancheAnciennete = (n) => n < 1 ? "moins d\u2019un an" : n < 2 ? "1 \xE0 2 ans" : n < 5 ? "2 \xE0 5 ans" : "plus de 5 ans";
const trancheEffectif = (n) => n === 0 ? "vous travaillez seul\xB7e" : n <= 5 ? "vous \xEAtes entre 2 et 5 personnes" : n <= 9 ? "vous \xEAtes entre 6 et 9 personnes" : n <= 49 ? "vous \xEAtes entre 10 et 49 personnes" : "vous \xEAtes 50 personnes ou plus";
function resumeReponses(a) {
  return `Vous cherchez ${eur(a.montant)} pour ${LIBELLES_PROJET[a.projet]}. Votre entreprise existe depuis ${trancheAnciennete(a.anciennete)}, dans ${LIBELLES_SECTEUR[a.secteur]}, et ${trancheEffectif(a.effectif)}.`;
}
function explicationTete(a) {
  const tous = evaluerTous(a);
  const ok = tous.filter((e) => e.statut === "possible").sort((x, y) => y.score - x.score || x.financement.montantMax - y.financement.montantMax);
  if (ok.length > 0) {
    const [tete, ...autres] = ok;
    const complement = autres.length > 0 ? ` ${autres[0].financement.nom} reste possible, en compl\xE9ment.` : "";
    return `${tete.financement.nom} arrive en t\xEAte : il couvre ${LIBELLES_PROJET[a.projet]} et tous ses crit\xE8res sont remplis d\u2019apr\xE8s vos r\xE9ponses.${complement} \xC0 v\xE9rifier : vos r\xE9ponses sont d\xE9claratives. Les pi\xE8ces de la demande confirmeront l\u2019anciennet\xE9, le secteur et le montant, et c\u2019est votre charg\xE9 d\u2019affaires qui d\xE9cide.`;
  }
  const proche = leCritereManquant(a);
  const n = proche?.manque.length ?? 0;
  return `Aucun financement ne remplit tous ses crit\xE8res d\u2019apr\xE8s vos r\xE9ponses.${proche ? ` ${proche.financement.nom} est le plus proche : ${n > 1 ? "plusieurs crit\xE8res ne sont pas remplis" : "un crit\xE8re n\u2019est pas rempli"}.` : ""} Je ne d\xE9cide pas \xE0 votre place : un conseiller peut regarder votre situation avec vous.`;
}
const libelleEffectif = (n) => n === 0 ? "Seul\xB7e" : n <= 5 ? "2 \xE0 5 personnes" : n <= 9 ? "6 \xE0 9 personnes" : n <= 49 ? "10 \xE0 49 personnes" : "50 personnes ou plus";
const libelleAnciennete = (n) => trancheAnciennete(n).replace(/^./, (c) => c.toUpperCase());
export {
  LIBELLES_PROJET,
  LIBELLES_SECTEUR,
  REFERENTIEL,
  alternatives,
  ecartes,
  eur,
  evaluer,
  evaluerTous,
  explicationTete,
  financements,
  leCritereManquant,
  libelleAnciennete,
  libelleEffectif,
  resumeReponses,
  retenus,
  trancheAnciennete,
  trancheEffectif
};
