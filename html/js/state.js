// Stores partagés entre les pages. Persistés : un rechargement ou un changement de page garde tout.
import { creerStore, annoncer } from './core.js'
import { ETAT_INITIAL, PIECES, pieceById } from './pieces.js'
import { televerser, verifierDocument, ErreurReseau, envoyerDemande } from './api.js'

// ---------- Réponses d'éligibilité (Fabienne : uniquement les faits du brief, aucun montant) ----------
export const FABIENNE = { projet: 'equipement', effectif: 3, anciennete: 4, secteur: 'artisanat' }
export const demande = creerStore('elan:demande:html', () => ({ answers: { ...FABIENNE }, step: 0, financementId: null }))
export const setReponse = (k, v) => demande.set((s) => ({ answers: { ...s.answers, [k]: v } }))

// ---------- Interface et démonstration ----------
export const ui = creerStore('elan:ui:html', () => ({ bandeauMasque: false, persona: 'fabienne' }))

// ---------- Journal des événements (panneau Mesure) ----------
export const evenements = creerStore('elan:events:html', () => ({ items: [] }), { session: true })
export function suivre(name, detail) { evenements.set((s) => ({ items: [{ id: Date.now() + Math.random(), name, at: Date.now(), detail }, ...s.items].slice(0, 200) })) }

// ---------- Relances et actions de Nicolas ----------
export const relances = creerStore('elan:relances:html', () => ({ items: [] }))
export const ajouterRelance = (type, texte, dossier = 'argile') => relances.set((s) => ({ items: [{ id: Date.now(), date: new Date().toISOString(), type, texte, dossier }, ...s.items] }))

// ---------- Pièces ----------
const hhmm = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
const initialPieces = () => ({ etat: structuredClone(ETAT_INITIAL), savedAt: hhmm(), invitation: null, consentement: false, numero: null, envoyeLe: null, hors_ligne: false, session_expiree: false, erreur: null, objet: 'Achat d’un four' })
export const pieces = creerStore('elan:pieces:html', initialPieces)

export const patch = (id, p) => pieces.set((s) => ({ etat: { ...s.etat, [id]: { ...s.etat[id], ...p } }, savedAt: s.hors_ligne ? s.savedAt : hhmm() }))

const faite = (nom, taille, verifie) => ({ statut: 'verifiee', fichier: { nom, taille }, verifie: verifie ?? 'Document lisible, 2 pages' })
function preset(id) {
  const base = structuredClone(ETAT_INITIAL)
  if (id === 'premier') return base
  const six = { ...base, kbis: faite('Kbis-atelier-argile-et-feu.pdf', 412000), identite: faite('CNI-fabienne.jpg', 1100000), rib: faite('RIB-atelier.pdf', 96000, 'Document lisible, 1 page'), liasse: faite('Liasse-fiscale-2024.pdf', 1800000, 'Document lisible, 8 pages'), devis: faite('Devis-four-2026-0418.pdf', 640000, 'Document lisible, 2 pages'), attestation: { statut: 'recue', fichier: { nom: 'Attestation-regularite.pdf', taille: 220000 } } }
  if (id === 'cours' || id === 'offline') return { ...six, bilans: { statut: 'a-fournir' } }
  if (id === 'corriger') return { ...six, bilans: { statut: 'a-corriger', fichier: { nom: 'Bilan-2024.pdf', taille: 2300000 }, message: 'La page 2 du bilan est manquante.', alerteBilanDonnee: true } }
  return { ...six, bilans: faite('Bilan-2024.pdf', 2900000, 'Document lisible, 3 pages'), statuts: faite('Statuts.pdf', 380000), plan: { statut: 'non-applicable', raison: 'Je finance sur fonds propres, sans prêt à détailler.' } }
}
export const chargerScenario = (id) => pieces.set({ etat: preset(id), savedAt: hhmm(), invitation: null, consentement: false, numero: id === 'apres' ? 'ELAN-2026-04817' : null, envoyeLe: id === 'apres' ? new Date().toISOString() : null, hors_ligne: id === 'offline', session_expiree: false, erreur: null })
export const inviter = (inv) => pieces.set((s) => { const etat = { ...s.etat }; for (const id of inv.pieces) if (etat[id].statut === 'a-fournir') etat[id] = { ...etat[id], statut: 'attente-experte' }; return { invitation: inv, etat, savedAt: hhmm() } })
export const revoquer = () => pieces.set((s) => { const etat = { ...s.etat }; for (const p of PIECES) if (etat[p.id].statut === 'attente-experte') etat[p.id] = { statut: 'a-fournir' }; return { invitation: s.invitation ? { ...s.invitation, revoquee: true } : null, etat, savedAt: hhmm() } })

/** Remet le prototype dans son état initial : Fabienne, sans montant, aucune pièce, journal vide. */
export function reinitialiser() {
  demande.reset(); pieces.reset(); evenements.reset(); relances.reset(); ui.set({ persona: 'fabienne' })
  try { sessionStorage.removeItem('elan:demarre') } catch { /* */ }
}

// ---------- Dépôt de fichier : annulable, vérification automatique (vague 2). L'IA alerte, elle ne bloque jamais. ----------
const jetons = new Map()
export const annulerDepot = (id) => jetons.set(id, (jetons.get(id) ?? 0) + 1)
export async function deposer(id, nom, taille, file) {
  const { erreur, hors_ligne, etat } = pieces.get()
  const piece = pieceById(id)
  annulerDepot(id)
  const mien = jetons.get(id), valide = () => jetons.get(id) === mien
  patch(id, { fichier: { nom, taille }, message: undefined, verifie: undefined })
  if (hors_ligne) { patch(id, { statut: 'envoi', progress: 0, message: 'Enregistré sur cet appareil, envoi dès le retour du réseau.' }); annoncer(`${piece.nom} : enregistré sur cet appareil, envoi dès le retour du réseau.`); return }
  patch(id, { statut: 'envoi', progress: 0 }); annoncer(`${piece.nom} : envoi en cours.`)
  try { await televerser(file ?? new File([], nom), (p) => { if (valide()) patch(id, { progress: p }) }, erreur) }
  catch (e) {
    if (!valide()) return
    patch(id, { statut: 'a-fournir', progress: undefined, message: `${e instanceof ErreurReseau ? e.message : 'L’envoi a échoué.'} Votre fichier est gardé, vous pouvez réessayer.` })
    annoncer(`${piece.nom} : l’envoi a échoué. Vous pouvez réessayer.`); return
  }
  if (!valide()) return
  patch(id, { statut: 'recue', progress: undefined }); suivre('piece_deposee', id); annoncer(`${piece.nom} : reçue. Vérification en cours.`)
  const v = await verifierDocument(piece, taille, !!etat[id].alerteBilanDonnee)
  if (!valide()) return
  if (v.ok) { patch(id, { statut: 'verifiee', verifie: v.detail }); annoncer(`${piece.nom} : ${v.detail}.`) }
  else { patch(id, { statut: 'a-corriger', message: v.detail, alerteBilanDonnee: true }); suivre('piece_a_corriger', id); annoncer(`${piece.nom} : à corriger. ${v.detail}`) }
}
export { envoyerDemande }

// ---------- Formatage ----------
export const eur = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
export const tailleFichier = (o) => (o >= 1048576 ? `${(o / 1048576).toFixed(1).replace('.', ',')} Mo` : `${Math.max(1, Math.round(o / 1024))} Ko`)
