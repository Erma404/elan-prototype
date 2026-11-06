const QUESTIONS = [
  { key: "projet", kind: "choice", titre: "Quel est votre projet ?", aide: "Choisissez ce qui s\u2019en rapproche le plus.", options: [
    { value: "equipement", label: "Acheter un \xE9quipement", description: "Machine, four, v\xE9hicule, outillage", icon: "flame" },
    { value: "recrutement", label: "Recruter", description: "Un premier salari\xE9 ou un renfort", icon: "briefcase" },
    { value: "innovation", label: "Innover", description: "Un nouveau produit, service ou proc\xE9d\xE9", icon: "innovation" },
    { value: "export", label: "Exporter", description: "Prospecter ou livrer \xE0 l\u2019\xE9tranger", icon: "route" },
    { value: "reprise", label: "Reprendre une entreprise", description: "Racheter une activit\xE9 existante", icon: "signature" }
  ] },
  { key: "effectif", kind: "choice", titre: "Combien de personnes travaillent dans votre entreprise ?", aide: "Vous comprise, salari\xE9s en CDI ou CDD.", options: [
    { value: 0, label: "Moi seul\xB7e", icon: "l:user" },
    { value: 3, label: "2 \xE0 5 personnes", icon: "l:users" },
    { value: 8, label: "6 \xE0 9 personnes", icon: "l:users-round" },
    { value: 20, label: "10 \xE0 49 personnes", icon: "l:building-2" },
    { value: 60, label: "50 personnes ou plus", icon: "l:factory" }
  ] },
  { key: "anciennete", kind: "choice", titre: "Depuis combien de temps existe-t-elle ?", aide: "Depuis la date d\u2019immatriculation.", options: [
    { value: 0.5, label: "Moins d\u2019un an", icon: "l:sprout" },
    { value: 1.5, label: "1 \xE0 2 ans", icon: "l:calendar" },
    { value: 4, label: "2 \xE0 5 ans", icon: "l:calendar-check" },
    { value: 8, label: "Plus de 5 ans", icon: "l:award" }
  ] },
  { key: "montant", kind: "slider", titre: "Quel montant cherchez-vous ?", aide: "Une estimation suffit, vous pourrez l\u2019ajuster.", min: 5e3, max: 25e4, step: 5e3, presets: [2e4, 5e4, 8e4, 15e4] },
  { key: "secteur", kind: "choice", titre: "Dans quel secteur travaillez-vous ?", aide: "Choisissez l\u2019activit\xE9 principale.", options: [
    { value: "artisanat", label: "Artisanat", description: "C\xE9ramique, bois, m\xE9tal, b\xE2timent, alimentaire", icon: "l:hammer" },
    { value: "commerce", label: "Commerce", description: "Boutique, vente en ligne, distribution", icon: "l:store" },
    { value: "services", label: "Services", description: "Conseil, num\xE9rique, sant\xE9, formation", icon: "l:laptop" },
    { value: "industrie", label: "Industrie", description: "Fabrication, transformation, production", icon: "l:factory" }
  ] }
];
export {
  QUESTIONS
};
