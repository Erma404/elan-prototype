import data from './financements.json'
import type { Answers, Critere, Evaluation, Financement } from './types'

export const REFERENTIEL = data.version
export const financements = data.financements as Financement[]
export const alternatives = data.alternatives

export const LIBELLES_PROJET: Record<Answers['projet'], string> = {
  equipement: 'acheter un équipement', recrutement: 'recruter', innovation: 'innover', export: 'exporter', reprise: 'reprendre une entreprise',
}
export const LIBELLES_SECTEUR: Record<Answers['secteur'], string> = { artisanat: 'l’artisanat', commerce: 'le commerce', services: 'les services', industrie: 'l’industrie' }

export const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

/** Évalue un financement sur les réponses connues. Fonction pure : aucune réponse manquante n'est jamais supposée. */
export function evaluer(f: Financement, a: Partial<Answers>): Evaluation {
  const c: Critere[] = []
  const add = (id: Critere['id'], label: string, ok: boolean | null, raison: string) => c.push({ id, label, ok, raison })

  add('projet', 'Votre projet est couvert', a.projet == null ? null : f.projets.includes(a.projet), a.projet == null ? '' : `Ce financement ne couvre pas « ${LIBELLES_PROJET[a.projet]} ».`)
  add('effectif', 'Votre effectif entre dans le cadre', a.effectif == null ? null : a.effectif <= f.effectifMax, 'Votre entreprise dépasse l’effectif prévu pour ce financement.')
  add('anciennete', 'Votre ancienneté est suffisante', a.anciennete == null ? null : a.anciennete >= f.ancienneteMin, 'Votre entreprise est trop récente pour ce financement.')
  add('montant', 'Votre montant entre dans la fourchette', a.montant == null ? null : a.montant >= f.montantMin && a.montant <= f.montantMax, a.montant != null && a.montant > f.montantMax ? 'Le montant demandé dépasse ce que finance ce dispositif.' : 'Le montant demandé est inférieur à ce que finance ce dispositif.')
  add('secteur', 'Votre secteur est éligible', a.secteur == null ? null : f.secteurs.includes(a.secteur), a.secteur == null ? '' : `Il ne couvre pas encore ${LIBELLES_SECTEUR[a.secteur]}.`)

  const echec = c.find((x) => x.ok === false)
  const score = c.filter((x) => x.ok === true).length
  const statut = echec ? 'ecarte' : c.every((x) => x.ok === true) ? 'possible' : 'en-attente'
  return { financement: f, criteres: c, statut, score, pourquoiPas: echec?.raison }
}

export function evaluerTous(a: Partial<Answers>): Evaluation[] {
  return financements.map((f) => evaluer(f, a))
}

/** Financements encore possibles ou en attente de réponses, du plus pertinent au moins pertinent, limités à 3. */
export function retenus(a: Partial<Answers>): Evaluation[] {
  return evaluerTous(a)
    .filter((e) => e.statut !== 'ecarte')
    .sort((x, y) => y.score - x.score || x.financement.montantMax - y.financement.montantMax)
    .slice(0, 3)
}

export const ecartes = (a: Partial<Answers>) => evaluerTous(a).filter((e) => e.statut === 'ecarte')

/** Quand rien ne correspond : le financement le plus proche et ce qui manque pour y accéder. */
export function leCritereManquant(a: Partial<Answers>): { financement: Financement; manque: Critere[] } | null {
  const tous = evaluerTous(a)
  if (!tous.length) return null
  const proche = [...tous].sort((x, y) => x.criteres.filter((c) => c.ok === false).length - y.criteres.filter((c) => c.ok === false).length)[0]
  return { financement: proche.financement, manque: proche.criteres.filter((c) => c.ok === false) }
}

export const trancheAnciennete = (n: number) => (n < 1 ? 'moins d’un an' : n < 2 ? '1 à 2 ans' : n < 5 ? '2 à 5 ans' : 'plus de 5 ans')
export const trancheEffectif = (n: number) => (n === 0 ? 'vous travaillez seul·e' : n <= 5 ? 'vous êtes entre 2 et 5 personnes' : n <= 9 ? 'vous êtes entre 6 et 9 personnes' : n <= 49 ? 'vous êtes entre 10 et 49 personnes' : 'vous êtes 50 personnes ou plus')

/** Reformule les réponses sans jamais inventer de précision : on reprend les tranches choisies, pas les valeurs internes. */
export function resumeReponses(a: Answers): string {
  return `Vous cherchez ${eur(a.montant)} pour ${LIBELLES_PROJET[a.projet]}. Votre entreprise existe depuis ${trancheAnciennete(a.anciennete)}, dans ${LIBELLES_SECTEUR[a.secteur]}, et ${trancheEffectif(a.effectif)}.`
}

/**
 * Explication du résultat : pourquoi le premier arrive en tête, ce qu'il reste à vérifier.
 * Elle ne cite aucune valeur que l'utilisateur ou le référentiel ne lui a pas donnée.
 */
export function explicationTete(a: Answers): string {
  const tous = evaluerTous(a)
  const ok = tous.filter((e) => e.statut === 'possible').sort((x, y) => y.score - x.score || x.financement.montantMax - y.financement.montantMax)
  if (ok.length > 0) {
    const [tete, ...autres] = ok
    const complement = autres.length > 0 ? ` ${autres[0].financement.nom} reste possible, en complément.` : ''
    return `${tete.financement.nom} arrive en tête : il couvre ${LIBELLES_PROJET[a.projet]} et tous ses critères sont remplis d’après vos réponses.${complement} À vérifier : vos réponses sont déclaratives. Les pièces de la demande confirmeront l’ancienneté, le secteur et le montant, et c’est votre chargé d’affaires qui décide.`
  }
  const proche = leCritereManquant(a)
  const n = proche?.manque.length ?? 0
  return `Aucun financement ne remplit tous ses critères d’après vos réponses.${proche ? ` ${proche.financement.nom} est le plus proche : ${n > 1 ? 'plusieurs critères ne sont pas remplis' : 'un critère n’est pas rempli'}.` : ''} Je ne décide pas à votre place : un conseiller peut regarder votre situation avec vous.`
}

export const libelleEffectif = (n: number) => (n === 0 ? 'Seul·e' : n <= 5 ? '2 à 5 personnes' : n <= 9 ? '6 à 9 personnes' : n <= 49 ? '10 à 49 personnes' : '50 personnes ou plus')
export const libelleAnciennete = (n: number) => trancheAnciennete(n).replace(/^./, (c) => c.toUpperCase())
