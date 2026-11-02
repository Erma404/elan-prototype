const attente = (min = 300, max = 900) => new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
class ErreurReseau extends Error {
}
async function televerser(file, onProgress, erreur) {
  const etapes = 8;
  for (let i = 1; i <= etapes; i++) {
    await attente(60, 140);
    if (erreur === "reseau" && i === 4) throw new ErreurReseau("La connexion a \xE9t\xE9 interrompue pendant l\u2019envoi.");
    onProgress(Math.round(i / etapes * 100));
  }
  void file;
}
async function verifierDocument(piece, taille, deja) {
  await attente(1e3, 2e3);
  if (piece.id === "bilans" && !deja) return { ok: false, detail: "La page 2 du bilan est manquante." };
  const pages = Math.max(1, Math.min(4, Math.round(taille / 4e5) + 1));
  return { ok: true, detail: `Document lisible, ${pages} page${pages > 1 ? "s" : ""}` };
}
async function envoyerDemande(erreur) {
  await attente(700, 1400);
  if (erreur === "reseau") throw new ErreurReseau("L\u2019envoi n\u2019a pas abouti. Rien n\u2019est perdu.");
  return { numero: "ELAN-2026-04817" };
}
export {
  ErreurReseau,
  attente,
  envoyerDemande,
  televerser,
  verifierDocument
};
