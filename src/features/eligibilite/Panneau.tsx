import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, CircleHelp } from 'lucide-react'
import { retenus, ecartes, leCritereManquant } from '../../domain/eligibility'
import type { Answers } from '../../domain/types'

/** Panneau « Financements possibles » : se met à jour après chaque réponse. */
export default function Panneau({ answers }: { answers: Partial<Answers> }) {
  const n = Object.keys(answers).length
  const liste = retenus(answers)
  const out = ecartes(answers).length
  const pourquoi = n > 0 && liste.length === 0 ? leCritereManquant(answers) : null
  return (
    <aside aria-label="Financements possibles" className="min-h-0 lg:h-full">
      <div className="flex max-h-full flex-col overflow-y-auto rounded-card bg-bg-soft p-5 sm:p-6">
        <p className="eyebrow">Financements possibles</p>
        <div className="mt-5 flex items-end gap-3" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={liste.length} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className="tabular text-6xl font-bold leading-none tracking-tighter">{liste.length}</motion.span>
          </AnimatePresence>
          <p className="pb-1.5 text-lg leading-tight text-muted">{n === 0 ? 'à confirmer avec vos réponses' : liste.length > 1 ? 'financements correspondent pour l’instant' : liste.length === 1 ? 'financement correspond pour l’instant' : 'financement ne correspond pour l’instant'}</p>
        </div>
        <ul className="mt-5 flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {liste.map((e) => (
              <motion.li key={e.financement.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="rounded-md border border-border bg-surface p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold tracking-tight">{e.financement.nom}</p>
                  {e.statut === 'possible'
                    ? <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-success"><CircleCheck className="size-4" aria-hidden />Correspond</span>
                    : <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted"><CircleHelp className="size-4" aria-hidden />À confirmer</span>}
                </div>
                <p className="mt-1 text-sm text-muted">{e.financement.resume}</p>
                <p className="tabular mt-3 text-sm text-muted">{e.financement.montantIndicatif}</p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {pourquoi && (
          <div className="mt-5 rounded-md bg-surface p-4 text-sm" role="status">
            <p className="font-semibold">Pourquoi aucun résultat ?</p>
            <p className="mt-1 text-muted">Le plus proche de votre situation est {pourquoi.financement.nom}.</p>
            <ul className="mt-2 flex flex-col gap-1">{pourquoi.manque.map((m) => <li key={m.id} className="text-muted">{m.raison}</li>)}</ul>
            <p className="mt-2 font-medium">Ajustez votre réponse : ce panneau se met à jour.</p>
          </div>
        )}
        {out > 0 && !pourquoi && <p className="mt-4 text-sm text-muted">{out} {out > 1 ? 'financements écartés' : 'financement écarté'} d’après vos réponses.</p>}
      </div>
    </aside>
  )
}
