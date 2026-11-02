import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { ChevronLeft, ChevronRight, FlaskConical, Pause, Play, X } from 'lucide-react'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui'
import { useUi } from '../../app/store'
import { usePieces } from '../../app/pieces-store'
import type { PresetId } from '../../app/pieces-store'
import { reinitialiser } from '../../app/reset'
import { useEvents } from '../../lib/events'
import { ETAPES, useTour } from './tour'
import { useDemoUi } from './ui'
import type { ErreurInjectee } from '../../mocks/api'

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'premier', label: 'Premier accès' }, { id: 'cours', label: 'En cours (6 sur 9)' }, { id: 'corriger', label: 'Une pièce à corriger' },
  { id: 'offline', label: 'Connexion perdue' }, { id: 'pret', label: 'Prêt à envoyer' }, { id: 'apres', label: 'Après envoi' },
]
const ERREURS: { id: ErreurInjectee; label: string }[] = [{ id: null, label: 'Aucune' }, { id: 'reseau', label: 'Réseau' }, { id: 'fichier-lourd', label: 'Fichier trop lourd' }, { id: 'ia', label: 'Assistant IA indisponible' }]

function Segment<T extends string | null>({ label, valeur, options, onChange }: { label: string; valeur: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset className="flex flex-col gap-1.5"><legend className="eyebrow before:!hidden mb-1">{label}</legend>
      <div className="flex flex-wrap gap-1.5">{options.map((o) => <button key={String(o.id)} type="button" aria-pressed={valeur === o.id} onClick={() => onChange(o.id)} className="tr min-h-9 cursor-pointer rounded-full border border-border-strong px-3 text-sm font-medium hover:bg-bg-soft aria-pressed:border-text aria-pressed:bg-text aria-pressed:text-bg">{o.label}</button>)}</div>
    </fieldset>
  )
}

const INDICATEURS = [
  { nom: 'Abandon à l’étape des pièces', aujourdhui: '35 % des entrepreneurs qui démarrent', cible: '20 %', evts: ['pieces_ecran_vu', 'piece_deposee', 'envoi_clique'] },
  { nom: 'Demandes envoyées complètes', aujourdhui: '60 %', cible: '80 %', evts: ['piece_a_corriger', 'envoi_reussi'] },
  { nom: 'Refus faute de financement correspondant', aujourdhui: '33 %, connu après 3 semaines', cible: 'moins de 15 %, connu avant l’envoi', evts: ['eligibilite_demarree', 'eligibilite_resultat'] },
]

/** Bouton « Démo » des en-têtes : ouvre le panneau (raccourci Maj + D). */
export function DemoTrigger() {
  const { open, setOpen } = useDemoUi()
  return <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="tr inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-sm px-2.5 text-sm font-medium text-muted hover:bg-bg-soft hover:text-text"><FlaskConical className="size-4" aria-hidden />Démo</button>
}

export function DemoPanel() {
  const { open: ouvert, setOpen: setOuvert } = useDemoUi()
  const { pathname } = useLocation()
  const go = useNavigate()
  const { persona, bandeauMasque, set: setUi } = useUi()
  const pieces = usePieces()
  const events = useEvents((s) => s.events)
  const tour = useTour()

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey && !/input|textarea|select/i.test((e.target as HTMLElement).tagName)) { e.preventDefault(); useDemoUi.getState().setOpen(!useDemoUi.getState().open) }
    }
    window.addEventListener('keydown', on); return () => window.removeEventListener('keydown', on)
  }, [])

  // Visite guidée : on applique l'état de chaque étape, on change de page, et on avance seul sauf en pause.
  useEffect(() => {
    if (!tour.actif) return
    const e = ETAPES[tour.i]
    if (e.etat) pieces.charger(e.etat === 'apres' ? 'apres' : e.etat)
    go(e.route)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.actif, tour.i])
  useEffect(() => {
    if (!tour.actif || tour.pause) return
    const t = window.setTimeout(() => (tour.i < ETAPES.length - 1 ? tour.set({ i: tour.i + 1 }) : tour.set({ actif: false })), 22000)
    return () => window.clearTimeout(t)
  }, [tour.actif, tour.pause, tour.i, tour])

  const charger = (id: PresetId) => { pieces.charger(id); go(id === 'apres' ? '/demande/envoyee' : '/demande/pieces'); setOuvert(false) }
  const compte = (n: string) => events.filter((e) => e.name === n).length

  return (
    <>
      <DialogPrimitive.Root open={ouvert} onOpenChange={setOuvert} modal={false}>
        {pathname === '/' && <button type="button" onClick={() => setOuvert(!ouvert)} className="tr fixed bottom-3 left-3 z-[var(--z-demo)] inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-text px-4 text-sm font-semibold text-bg shadow-lg hover:scale-[1.02] active:scale-[0.98]"><FlaskConical className="size-4" aria-hidden />Démo</button>}
        <DialogPrimitive.Portal>
          <DialogPrimitive.Content aria-describedby={undefined} onInteractOutside={(e) => e.preventDefault()} className="anim-fade fixed right-3 top-20 z-[var(--z-demo)] flex max-h-[calc(100dvh-6rem)] w-[min(26rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-card border border-border bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-5 py-3"><DialogPrimitive.Title className="font-semibold tracking-tight">Panneau de démonstration</DialogPrimitive.Title><DialogPrimitive.Close aria-label="Fermer" className="tr grid size-9 cursor-pointer place-items-center rounded-sm text-muted hover:bg-bg-soft"><X className="size-4" /></DialogPrimitive.Close></div>
            <Tabs defaultValue="scenarios" className="flex min-h-0 flex-1 flex-col">
              <div className="px-5"><TabsList label="Panneau"><TabsTrigger value="scenarios">Scénarios</TabsTrigger><TabsTrigger value="mesure">Mesure</TabsTrigger></TabsList></div>
              <TabsContent value="scenarios" className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
                <Segment label="Persona" valeur={persona} options={[{ id: 'fabienne', label: 'Fabienne' }, { id: 'experte', label: 'Experte-comptable' }, { id: 'nicolas', label: 'Nicolas' }]}
                  onChange={(p) => { setUi({ persona: p }); go(p === 'fabienne' ? '/eligibilite' : p === 'experte' ? '/expert/demo' : '/pro/dossiers/argile') }} />
                <fieldset className="flex flex-col gap-1.5"><legend className="eyebrow before:!hidden mb-1">État de l’écran Pièces</legend><div className="flex flex-wrap gap-1.5">{PRESETS.map((p) => <button key={p.id} type="button" onClick={() => charger(p.id)} className="tr min-h-9 cursor-pointer rounded-full border border-border-strong px-3 text-sm font-medium hover:bg-bg-soft">{p.label}</button>)}</div></fieldset>
                <Segment label="Injecter une erreur" valeur={pieces.erreur} options={ERREURS} onChange={(e) => pieces.set({ erreur: e })} />
                <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => { pieces.set({ session_expiree: true }); go('/demande/pieces'); setOuvert(false) }}>Session expirée</Button><Button size="sm" variant="secondary" onClick={() => pieces.set({ hors_ligne: !pieces.hors_ligne })}>{pieces.hors_ligne ? 'Rétablir la connexion' : 'Couper la connexion'}</Button></div>
                <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-medium">Masquer le bandeau « données fictives »
                  <SwitchPrimitive.Root checked={bandeauMasque} onCheckedChange={(v) => setUi({ bandeauMasque: v })} className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-border-strong data-[state=checked]:bg-text"><SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-bg transition-transform data-[state=checked]:translate-x-[22px]" /></SwitchPrimitive.Root></label>
                <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => { tour.set({ actif: true, i: 0, pause: false }); setOuvert(false) }}>Lancer la visite guidée (3 min)</Button><Button size="sm" variant="secondary" onClick={() => { reinitialiser(); go('/eligibilite'); setOuvert(false) }}>Réinitialiser</Button><Button size="sm" variant="ghost" onClick={() => { go('/styleguide'); setOuvert(false) }}>Système de design</Button></div>
              </TabsContent>
              <TabsContent value="mesure" className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
                <ul className="flex flex-col gap-2.5">{INDICATEURS.map((i) => (
                  <li key={i.nom} className="rounded-md bg-bg-soft p-3 text-sm"><p className="font-semibold">{i.nom}</p><p className="text-muted">Aujourd’hui : {i.aujourdhui}. Cible à 3 mois : {i.cible}.</p><p className="tabular mt-1.5 text-xs text-subtle">Lié à : {i.evts.map((e) => `${e} (${compte(e)})`).join(', ')}</p></li>))}</ul>
                <p className="text-xs text-subtle">Ordres de grandeur à calibrer. Contrôle : temps de relance de 45 min à environ 25 min.</p>
                <div><h3 className="eyebrow before:!hidden">Journal des événements</h3>
                  {events.length === 0 ? <p className="mt-2 text-sm text-muted">Aucun événement pour l’instant. Jouez le parcours.</p> : <ul className="mt-2 flex max-h-44 flex-col overflow-y-auto text-sm">{events.slice(0, 30).map((e) => <li key={e.id} className="flex justify-between gap-3 border-b border-border py-1.5"><span className="ident text-xs">{e.name}{e.detail ? ` · ${e.detail}` : ''}</span><span className="tabular text-xs text-subtle">{new Date(e.at).toLocaleTimeString('fr-FR')}</span></li>)}</ul>}
                </div>
              </TabsContent>
            </Tabs>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {tour.actif && (
        <div role="region" aria-label="Visite guidée" className="anim-toast fixed bottom-3 left-1/2 z-[var(--z-demo)] w-[min(34rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-card bg-text p-5 text-bg shadow-lg">
          <p className="tabular text-xs opacity-70">Étape {tour.i + 1} sur {ETAPES.length}</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">{ETAPES[tour.i].titre}</p>
          <p className="mt-1.5 text-sm leading-relaxed opacity-90" aria-live="polite">{ETAPES[tour.i].texte}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="inverse" disabled={tour.i === 0} onClick={() => tour.set({ i: tour.i - 1 })}><ChevronLeft className="size-4" aria-hidden />Retour</Button>
            <Button size="sm" variant="inverse" onClick={() => (tour.i < ETAPES.length - 1 ? tour.set({ i: tour.i + 1 }) : tour.set({ actif: false }))}>{tour.i < ETAPES.length - 1 ? 'Suivant' : 'Terminer'}<ChevronRight className="size-4" aria-hidden /></Button>
            <Button size="sm" variant="inverse" onClick={() => tour.set({ pause: !tour.pause })}>{tour.pause ? <><Play className="size-4" aria-hidden />Reprendre</> : <><Pause className="size-4" aria-hidden />Pause</>}</Button>
            <button type="button" onClick={() => tour.set({ actif: false })} className="tr ml-auto min-h-9 cursor-pointer rounded-sm px-2 text-sm underline underline-offset-4 opacity-80 hover:opacity-100">Quitter</button>
          </div>
        </div>
      )}
    </>
  )
}
