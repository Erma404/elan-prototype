import { describe, expect, it } from 'vitest'
import { ecartes, evaluer, explicationTete, financements, leCritereManquant, resumeReponses, retenus } from './eligibility'
import type { Answers } from './types'

const fabienne: Answers = { projet: 'equipement', effectif: 3, anciennete: 4, montant: 80000, secteur: 'artisanat' }
const pret = financements.find((f) => f.id === 'pret-equipement-artisans')!

describe('moteur d’éligibilité', () => {
  it('retient le prêt équipement et la garantie pour le cas de démonstration', () => {
    const ids = retenus(fabienne).map((e) => e.financement.id)
    expect(ids).toContain('pret-equipement-artisans')
    expect(ids).toContain('garantie-croissance-tpe')
    expect(ids).not.toContain('avance-innovation')
  })
  it('n’invente aucun critère : une réponse manquante donne « null », jamais « refusé »', () => {
    const e = evaluer(pret, { projet: 'equipement' })
    expect(e.statut).toBe('en-attente')
    expect(e.criteres.filter((c) => c.ok === null)).toHaveLength(4)
  })
  it('écarte avec une raison en une phrase', () => {
    const e = evaluer(pret, { ...fabienne, anciennete: 1 })
    expect(e.statut).toBe('ecarte')
    expect(e.pourquoiPas).toMatch(/trop récente/)
  })
  it('écarte les financements hors projet', () => {
    expect(ecartes(fabienne).map((e) => e.financement.id)).toEqual(expect.arrayContaining(['avance-innovation', 'aide-premiere-embauche']))
  })
  it('limite le résultat à 3 financements', () => {
    expect(retenus({}).length).toBeLessThanOrEqual(3)
  })
  it('ne laisse jamais une impasse : donne le financement le plus proche et ce qui manque', () => {
    const rien: Answers = { ...fabienne, effectif: 60, anciennete: 0.5 }
    expect(retenus(rien)).toHaveLength(0)
    const proche = leCritereManquant(rien)
    expect(proche?.manque.length).toBeGreaterThan(0)
  })
  it('reformule les réponses en langage clair', () => {
    expect(resumeReponses(fabienne)).toContain('80 000 €')
  })
  it('l’explication ne répète pas la saisie et ne cite aucun chiffre', () => {
    const t = explicationTete(fabienne)
    expect(t).toMatch(/arrive en tête/)
    expect(t).toMatch(/À vérifier/)
    expect(t).not.toMatch(/\d/)
  })
  it('l’explication reste honnête quand rien ne correspond', () => {
    const t = explicationTete({ ...fabienne, effectif: 60, anciennete: 0.5 })
    expect(t).toMatch(/Aucun financement/)
    expect(t).not.toMatch(/\d/)
  })
})
