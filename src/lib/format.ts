const nbsp = ' '
const nnbsp = ' '
// Intl fr-FR produit déjà l'espace fine insécable des milliers et l'espace insécable avant « € ».
export const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
export const pct = (n: number) => `${Math.round(n)}${nnbsp}%`
export const taille = (octets: number) =>
  octets >= 1024 * 1024 ? `${(octets / 1024 / 1024).toFixed(1).replace('.', ',')}${nbsp}Mo` : `${Math.max(1, Math.round(octets / 1024))}${nbsp}Ko`
