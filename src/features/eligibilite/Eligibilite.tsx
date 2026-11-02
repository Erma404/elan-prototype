import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '../shell/AppShell'
import { Button, ChoiceCard, Chip, Icon, Input, Slider } from '../../components/ui'
import { QUESTIONS } from './questions'
import Panneau from './Panneau'
import Resultat from './Resultat'
import { useDemande } from '../../app/store'
import type { Answers } from '../../domain/types'
import { track } from '../../lib/events'
import { eur } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'

const TOTAL = QUESTIONS.length

export default function Eligibilite() {
  const { answers, step, setAnswer, setStep } = useDemande()
  const reduce = useReducedMotion()
  const [montant, setMontant] = useState<number | undefined>(answers.montant)
  const [saisie, setSaisie] = useState(answers.montant ? String(answers.montant) : '')
  const zone = useRef<HTMLElement>(null)
  const complet = QUESTIONS.every((x) => answers[x.key] !== undefined)
  const fini = step >= TOTAL && complet
  usePageTitle(fini ? 'Votre résultat' : `Question ${Math.min(step, TOTAL - 1) + 1} sur ${TOTAL}`)

  // Une réponse manque : on ne montre jamais un résultat incomplet.
  useEffect(() => { if (step >= TOTAL && !complet) setStep(QUESTIONS.findIndex((x) => answers[x.key] === undefined)) }, [step, complet, answers, setStep])

  const q = QUESTIONS[Math.min(step, TOTAL - 1)]

  // Chaque nouvelle question : retour en haut et focus sur le titre.
  useEffect(() => {
    zone.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
    document.getElementById('question')?.focus({ preventScroll: true })
  }, [step])

  const avancer = () => {
    const next = step + 1
    setStep(next)
    if (next >= TOTAL) track('eligibilite_resultat')
  }
  const demarre = () => { if (!useDemande.getState().answers.montant && !sessionStorage.getItem('elan:demarre')) { track('eligibilite_demarree'); sessionStorage.setItem('elan:demarre', '1') } }
  // Choisir une réponse ne fait pas avancer : la personne avance quand elle le décide, avec « Continuer ».
  const choisir = (v: Answers[typeof q.key]) => { demarre(); setAnswer(q.key as never, v as never) }

  const fixer = (n: number | undefined) => {
    setMontant(n)
    if (n !== undefined) { setAnswer('montant', n); demarre() }
  }

  // Raccourcis clavier 1 à 5 sur les questions à choix
  useEffect(() => {
    if (fini || q.kind !== 'choice') return
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (/input|textarea|select/i.test((e.target as HTMLElement).tagName)) return
      const i = Number(e.key) - 1
      if (i >= 0 && i < q.options.length) choisir(q.options[i].value as never)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  })

  if (fini) return <AppShell step={0} wide fit><Resultat answers={answers as Answers} onModifier={() => setStep(0)} /></AppShell>

  return (
    <AppShell step={0} wide fit>
      <div className="grid h-full min-h-0 gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <section ref={zone} aria-labelledby="question" className="flex min-h-0 min-w-0 max-w-2xl flex-col lg:overflow-y-auto">
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow" aria-live="polite"><span className="tabular">{step + 1} sur {TOTAL}</span></p>
            {step > 0 && <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}><ArrowLeft className="size-4" aria-hidden />Retour</Button>}
          </div>
          <div role="progressbar" aria-label="Progression du test" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step + 1} className="mt-4 flex gap-1.5">
            {QUESTIONS.map((x, i) => <span key={x.key} className={`h-1 flex-1 rounded-full tr ${i <= step ? 'bg-text' : 'bg-border'}`} />)}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={reduce ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: -16 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
              <h1 id="question" tabIndex={-1} className="mt-6 text-[clamp(1.75rem,3.1vw,2.75rem)] font-bold leading-[1.06] tracking-tighter outline-none">{q.titre}</h1>
              <p className="mt-2 text-base text-muted">{q.aide}</p>
              {q.kind === 'choice' ? (
                <div role="radiogroup" aria-labelledby="question" className="mt-5 flex flex-col gap-2.5">
                  {q.options.map((o, i) => (
                    <ChoiceCard key={String(o.value)} selected={answers[q.key] === o.value} onSelect={() => choisir(o.value as never)} title={o.label} description={'description' in o ? o.description : undefined} shortcut={String(i + 1)} icon={'icon' in o && o.icon ? <Icon name={o.icon} className="size-5" /> : undefined} />
                  ))}
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <Button disabled={answers[q.key] === undefined} disabledReason="Choisissez une réponse pour continuer." onClick={avancer}>Continuer</Button>
                    <p className="hidden text-sm text-subtle sm:block">Astuce : touches 1 à {q.options.length} pour choisir.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <p className="tabular text-[clamp(2.75rem,6vw,4.25rem)] font-bold leading-none tracking-tighter"><output aria-live="polite">{montant === undefined ? <span className="text-subtle">— €</span> : eur(montant)}</output></p>
                  <div className="mt-5"><Slider neutral={montant === undefined} value={montant ?? q.min} onValueChange={(v) => { fixer(v); setSaisie(String(v)) }} min={q.min} max={q.max} step={q.step} label="Montant recherché" format={eur} /></div>
                  <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="Montants courants">
                    {q.presets.map((v) => <Chip key={v} selected={montant === v} onClick={() => { fixer(v); setSaisie(String(v)) }}>{eur(v)}</Chip>)}
                    
                  </div>
                  <div className="mt-4 max-w-xs">
                    <label htmlFor="montant-saisie" className="text-sm font-medium">Ou saisissez le montant exact</label>
                    <div className="relative mt-1.5"><Input id="montant-saisie" inputMode="numeric" autoComplete="off" placeholder="Montant en euros" value={saisie} className="tabular pr-9" onChange={(e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 8); setSaisie(d); fixer(d ? Number(d) : undefined) }} /><span aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">€</span></div>
                  </div>
                  <div className="mt-5"><Button size="lg" disabled={montant === undefined} disabledReason="Choisissez ou saisissez un montant pour continuer." onClick={avancer}>Continuer</Button></div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
        <Panneau answers={answers} />
      </div>
    </AppShell>
  )
}
