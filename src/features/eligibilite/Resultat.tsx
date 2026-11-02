import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Phone } from 'lucide-react'
import { AiMessage, Accordion, AccordionItem, Button, Card, Dialog, Field, Input, Eyebrow, useToast } from '../../components/ui'
import { alternatives, ecartes, explicationTete, leCritereManquant, REFERENTIEL, retenus } from '../../domain/eligibility'
import type { Answers } from '../../domain/types'
import { useDemande } from '../../app/store'

/** Résultat en une fenêtre : le message à gauche, les financements (ou les pistes) à droite. */
export default function Resultat({ answers, onModifier }: { answers: Answers; onModifier: () => void }) {
  const go = useNavigate()
  const choisir = useDemande((s) => s.choisir)
  const toast = useToast()
  const [conseiller, setConseiller] = useState(false)
  const liste = retenus(answers).filter((e) => e.statut === 'possible')
  const out = ecartes(answers)
  const proche = liste.length === 0 ? leCritereManquant(answers) : null
  const commencer = (id: string) => { choisir(id); go('/demande/pieces') }

  return (
    <div className="grid h-full min-h-0 gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
      <section className="flex min-h-0 flex-col gap-5 lg:overflow-y-auto" aria-labelledby="resultat">
        <Eyebrow>Votre résultat</Eyebrow>
        <h1 id="resultat" className="text-[clamp(1.875rem,3.2vw,2.875rem)] font-bold leading-[1.06] tracking-tighter">
          {liste.length > 0 ? `${liste.length === 1 ? '1 financement correspond' : `${liste.length} financements correspondent`} à votre projet.` : 'Aucun financement ne correspond pour l’instant.'}
        </h1>
        <AiMessage animate={false} text={explicationTete(answers)} source={REFERENTIEL} />
        {out.length > 0 && (
          <Accordion type="single" collapsible>
            <AccordionItem value="pourquoi-pas" header={<span className="font-semibold">Pourquoi pas les autres ? <span className="font-normal text-muted">({out.length})</span></span>}>
              <ul className="flex flex-col gap-3">{out.map((e) => <li key={e.financement.id}><p className="font-medium">{e.financement.nom}</p><p className="text-sm text-muted">{e.pourquoiPas}</p></li>)}</ul>
            </AccordionItem>
          </Accordion>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <button type="button" onClick={onModifier} className="tr min-h-11 cursor-pointer font-medium underline underline-offset-4 hover:text-accent-text">Modifier mes réponses</button>
          <button type="button" onClick={() => setConseiller(true)} className="tr min-h-11 cursor-pointer font-medium underline underline-offset-4 hover:text-accent-text">Parler à un conseiller</button>
        </div>
      </section>

      <section className="flex min-h-0 flex-col gap-4 lg:overflow-y-auto" aria-label={liste.length > 0 ? 'Financements possibles' : 'Pistes'}>
        {liste.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {liste.map((e, i) => (
              <li key={e.financement.id}>
                <Card as="article" className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                    <div>
                      {i === 0 && <p className="eyebrow mb-2">Le plus adapté</p>}
                      <h2 className="text-xl font-semibold tracking-tight">{e.financement.nom}</h2>
                      <p className="mt-1 max-w-md text-sm text-muted">{e.financement.resume}</p>
                    </div>
                    <dl className="grid w-full max-w-[22rem] grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1.5 rounded-md bg-bg-soft px-4 py-3 text-sm">
                      <dt className="text-muted">Montant</dt><dd className="tabular font-medium leading-snug">{e.financement.montantIndicatif}</dd>
                      <dt className="text-muted">Délai</dt><dd className="tabular font-medium leading-snug">{e.financement.delai}</dd>
                                    </dl>
                  </div>
                  <div className="mt-4 border-t border-border pt-3">
                    <h3 className="eyebrow">Pourquoi il vous correspond</h3>
                    <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                      {e.criteres.map((c) => <li key={c.id} className="flex items-start gap-2.5 text-sm"><span aria-hidden className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-text text-bg"><Check className="size-2.5" strokeWidth={3.5} /></span>{c.label}<span className="sr-only"> (rempli)</span></li>)}
                    </ul>
                  </div>
                  <div className="mt-4"><Button variant={i === 0 ? 'primary' : 'secondary'} onClick={() => commencer(e.financement.id)}>Commencer ma demande <ArrowRight className="size-5" aria-hidden /></Button></div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <Card className="p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight">Ce qu’il faudrait pour devenir éligible</h2>
              {proche && <>
                <p className="mt-1 text-sm text-muted">Le plus proche de votre situation : <span className="font-medium text-text">{proche.financement.nom}</span>.</p>
                <ul className="mt-3 flex flex-col gap-2">{proche.manque.map((m) => <li key={m.id} className="rounded-md bg-bg-soft px-4 py-3"><p className="text-sm font-medium">{m.label}</p><p className="text-sm text-muted">{m.raison}</p></li>)}</ul>
              </>}
              <div className="mt-4"><Button variant="secondary" size="sm" onClick={onModifier}>Modifier mes réponses</Button></div>
            </Card>
            <Card className="p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight">D’autres pistes</h2>
              <ul className="mt-3 flex flex-col gap-3">{alternatives.map((a) => <li key={a.nom}><p className="text-sm font-medium">{a.nom}</p><p className="text-sm text-muted">{a.texte}</p></li>)}</ul>
              <div className="mt-4"><Button size="sm" onClick={() => setConseiller(true)}><Phone className="size-4" aria-hidden />Parler à un conseiller</Button></div>
            </Card>
          </>
        )}
      </section>

      <Dialog open={conseiller} onOpenChange={setConseiller} title="Parler à un conseiller" description="Laissez votre numéro, un conseiller vous rappelle sous un jour ouvré."
        footer={<><Button variant="ghost" onClick={() => setConseiller(false)}>Annuler</Button><Button onClick={() => { setConseiller(false); toast({ title: 'Demande de rappel enregistrée', description: 'Un conseiller vous appelle sous un jour ouvré (démonstration).' }) }}>Être rappelé·e</Button></>}>
        <Field label="Numéro de téléphone" hint="Il n’est utilisé que pour ce rappel.">{(p) => <Input {...p} type="tel" autoComplete="tel" inputMode="tel" placeholder="06 12 34 56 78" />}</Field>
      </Dialog>
    </div>
  )
}
