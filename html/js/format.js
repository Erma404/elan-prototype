const nbsp = "\xA0";
const nnbsp = "\u202F";
const eur = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const pct = (n) => `${Math.round(n)}${nnbsp}%`;
const taille = (octets) => octets >= 1024 * 1024 ? `${(octets / 1024 / 1024).toFixed(1).replace(".", ",")}${nbsp}Mo` : `${Math.max(1, Math.round(octets / 1024))}${nbsp}Ko`;
export {
  eur,
  pct,
  taille
};
