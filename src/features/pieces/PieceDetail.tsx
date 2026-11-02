import { useState } from 'react'
import { ArrowRight, Clock, MessageCircleQuestion, RotateCcw, Trash2, Undo2 } from 'lucide-react'
import { Badge, Banner, Button, Dialog, Dropzone, Field, FileRow, Select, StatusBadge } from '../../components/ui'
import { DocumentExemple } from './DocumentExemple'
import { complete } from '../../domain/pieces'
import type { PieceDef, PieceState } from '../../domain/pieces'
import { usePieces } from '../../app/pieces-store'
import { annulerDepot, useDepot } from './useDepot'
import { useRelances } from '../pro/relances'

const RAISONS = [
  { value: 'pas-concerne', label: 'Je ne suis pas concerné·e' },
  { value: 'fonds-propres', label: 'Je finance sur fonds propres' },
  { value: 'entreprise-recente', label: 'Mon entreprise est trop récente' },
  { value: 'autre', label: 'Autre raison' },
]

/** Détail de la pièce choisie : pourquoi, où la trouver, exemple, puis la zone d'action selon l'état. Tient dans la hauteur de la fenêtre. */
export function PieceDetail({ piece, state, onAide, iaActive, rang, total, suivante }: { piece: PieceDef; state: PieceState; premiere?: boolean; onAide: (id: string) => void; iaActive: boolean; rang: number; total: number; suivante: { label: string; action: () => void; primaire: boolean } }) {
  const { patch, invitation, erreur, envoyeLe } = usePieces()
  const journal = useRelances((r) => r.add)
  const [retire, setRetire] = useState<PieceState | null>(null)
  const deposer = useDepot()
  const [remplacer, setRemplacer] = useState(false)
  const [na, setNa] = useState(false)
  const [exemple, setExemple] = useState(false)
  const [raison, setRaison] = useState<string>()
  const [erreurRaison, setErreurRaison] = useState<string>()
  const statut = state.statut
  const fait = complete(statut)
  const prevenir = (quoi: string) => { if (envoyeLe) journal('modification', `Fabienne M. a ${quoi} : ${piece.nom}.`) }
  const onFile = (f: File) => { setRemplacer(false); setRetire(null); prevenir(state.fichier ? 'remplacé une pièce' : 'ajouté une pièce'); deposer(piece.id, f.name, f.size, f) }
  const retirer = () => {
    setRetire(state); annulerDepot(piece.id); prevenir('retiré une pièce')
    patch(piece.id, { statut: 'a-fournir', fichier: undefined, message: undefined, verifie: undefined, progress: undefined })
  }
  const annulerRetrait = () => { if (retire) { patch(piece.id, retire); prevenir('rétabli une pièce'); setRetire(null) } }
  const actionsFichier = (
    <span className="flex flex-wrap items-center gap-1.5">
      <Button size="sm" variant="secondary" onClick={() => setRemplacer((v) => !v)} aria-expanded={remplacer}>Remplacer le fichier</Button>
      <Button size="sm" variant="ghost" onClick={retirer}><Trash2 className="size-4" aria-hidden />Retirer</Button>
    </span>
  )

  return (
    <section aria-labelledby="piece-titre" className="flex h-full min-h-0 flex-col overflow-hidden rounded-card border border-border bg-surface shadow-sm">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-5 py-3">
        <span className="tabular text-xs text-subtle" aria-label={`Pièce ${rang} sur ${total}`}>{rang}/{total}</span>
        <h2 id="piece-titre" className="text-lg font-semibold tracking-tight">{piece.nom}</h2>
        <Badge tone={piece.obligatoire ? 'accent' : 'neutral'}>{piece.obligatoire ? 'Obligatoire' : 'Recommandée'}</Badge>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={statut} />
          <Button size="sm" variant={suivante.primaire ? 'primary' : 'secondary'} onClick={suivante.action}>{suivante.label}<ArrowRight className="size-4" aria-hidden /></Button>
        </div>
      </header>

      <div id="piece-corps" className="grid min-h-0 flex-1 content-start gap-x-5 gap-y-3 px-5 py-3 min-[1400px]:grid-cols-[minmax(0,1fr)_13.5rem]">
        <div className="flex min-w-0 flex-col gap-2">
          <div><h3 className="eyebrow">Pourquoi nous la demandons</h3><p className="mt-1.5 text-[0.9375rem] leading-snug">{piece.pourquoi}</p></div>
          <div>
            <h3 className="eyebrow">Où la trouver</h3>
            <ol className="mt-1.5 flex flex-col gap-1 text-[0.9375rem] leading-snug">{piece.ouTrouver.map((o, i) => <li key={i} className="flex gap-2.5"><span className="tabular mt-px text-xs text-subtle">0{i + 1}</span><span>{o}</span></li>)}</ol>
          </div>
          <div className="flex flex-wrap items-center gap-x-4">
            <button type="button" onClick={() => setExemple(true)} className="tr -ml-1 inline-flex min-h-8 cursor-pointer items-center rounded-sm px-1 text-sm font-medium underline underline-offset-4 hover:text-accent-text min-[1400px]:hidden">Voir un exemple</button>
          {iaActive && <button type="button" onClick={() => onAide(piece.id)} className="tr -ml-1 inline-flex min-h-8 w-fit cursor-pointer items-center gap-2 rounded-sm px-1 text-sm font-medium text-accent-text underline-offset-4 hover:underline"><MessageCircleQuestion className="size-4" aria-hidden />Une question sur cette pièce ?</button>}
          </div>
        </div>
        <div className="hidden min-[1400px]:block"><DocumentExemple piece={piece} /></div>
      </div>

      <div className="border-t border-border bg-bg-soft px-5 py-3">
        {statut === 'a-fournir' && (
          <div className="flex flex-col gap-3">
            {retire && <Banner tone="info" title="Fichier retiré" action={<Button size="sm" variant="secondary" onClick={annulerRetrait}><Undo2 className="size-4" aria-hidden />Annuler, le remettre</Button>}>Vous pouvez en déposer un autre ou revenir en arrière.</Banner>}
            {state.message && <Banner tone="danger" title="L’envoi n’a pas abouti" action={state.fichier && <Button size="sm" variant="secondary" onClick={() => deposer(piece.id, state.fichier!.nom, state.fichier!.taille)}><RotateCcw className="size-4" aria-hidden />Réessayer</Button>}>{state.message}</Banner>}
            <Dropzone compact label={piece.nom} onFile={onFile} forceTooLarge={erreur === 'fichier-lourd' ? 14_900_000 : undefined} />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => patch(piece.id, { reporte: !state.reporte })} aria-pressed={!!state.reporte}>Je ne l’ai pas encore</Button>
              <Button size="sm" variant="ghost" onClick={() => setNa(true)}>Non applicable</Button>
              {state.reporte && <p className="flex items-center gap-1.5 text-sm text-muted" role="status"><Clock className="size-4" aria-hidden />{piece.obligatoire ? 'Noté. Cette pièce reste nécessaire avant l’envoi.' : 'Reportée. Elle ne bloque pas l’envoi, vous pourrez l’ajouter ensuite.'}</p>}
            </div>
          </div>
        )}
        {statut === 'envoi' && state.fichier && <FileRow name={state.fichier.nom} size={state.fichier.taille} status="envoi" progress={state.progress ?? 0} message={state.message} actions={<Button size="sm" variant="ghost" onClick={retirer}>Annuler l’envoi</Button>} />}
        {fait && statut !== 'non-applicable' && state.fichier && (
          <div className="flex flex-col gap-3">
            <FileRow name={state.fichier.nom} size={state.fichier.taille} status={statut} message={state.verifie} actions={actionsFichier} />
            {remplacer && <Dropzone compact label={piece.nom} onFile={onFile} />}
          </div>
        )}
        {statut === 'a-corriger' && (
          <div className="flex flex-col gap-3">
            <Banner tone="warning" title="À corriger">{state.message} Remplacez le fichier, ou envoyez tel quel : l’IA alerte, elle ne bloque pas.</Banner>
            {state.fichier && <FileRow name={state.fichier.nom} size={state.fichier.taille} status="a-corriger" actions={actionsFichier} />}
            {remplacer && <Dropzone compact label={piece.nom} onFile={onFile} />}
          </div>
        )}
        {statut === 'non-applicable' && (
          <div className="flex flex-wrap items-center justify-between gap-3"><p><span className="font-medium">Non applicable.</span> <span className="text-muted">{state.raison}</span></p><Button size="sm" variant="ghost" onClick={() => patch(piece.id, { statut: 'a-fournir', raison: undefined })}>Annuler</Button></div>
        )}
        {statut === 'attente-experte' && (
          <div className="flex flex-col gap-3">
            <Banner tone="info" title="En attente de l’experte-comptable">{invitation ? `Invitée le ${new Date(invitation.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}, ${invitation.email}.` : 'Invitation envoyée.'} Vous pouvez aussi déposer cette pièce vous-même.</Banner>
            <div><Button size="sm" variant="secondary" onClick={() => patch(piece.id, { statut: 'a-fournir' })}>Déposer moi-même</Button></div>
          </div>
        )}
      </div>

      <Dialog open={exemple} onOpenChange={setExemple} title={`Exemple : ${piece.nom}`} description="Document fictif, pour savoir ce qu’on attend." footer={<Button variant="secondary" onClick={() => setExemple(false)}>Fermer</Button>}><div className="grid place-items-center py-2"><DocumentExemple piece={piece} /></div></Dialog>

      <Dialog open={na} onOpenChange={setNa} title="Pièce non applicable" description={`Dites-nous pourquoi « ${piece.nom} » ne vous concerne pas.`}
        footer={<><Button variant="ghost" onClick={() => setNa(false)}>Annuler</Button><Button onClick={() => {
          if (!raison) { setErreurRaison('Choisissez une raison pour continuer.'); return }
          patch(piece.id, { statut: 'non-applicable', raison: RAISONS.find((r) => r.value === raison)!.label }); setNa(false); setRaison(undefined); setErreurRaison(undefined)
        }}>Confirmer</Button></>}>
        <Field label="Raison" required error={erreurRaison}>{(p) => <Select id={p.id} value={raison} onValueChange={(v) => { setRaison(v); setErreurRaison(undefined) }} options={RAISONS} placeholder="Choisir une raison" describedBy={p['aria-describedby']} invalid={p.invalid} />}</Field>
        <p className="mt-3 text-sm text-muted">La complétude sera recalculée. Votre chargé d’affaires verra cette raison.</p>
      </Dialog>
    </section>
  )
}
