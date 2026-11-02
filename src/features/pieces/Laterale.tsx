import { useState } from 'react'
import { ArrowRight, UserPlus } from 'lucide-react'
import { Button, Card, CircularProgress, Tooltip } from '../../components/ui'
import { compter } from '../../domain/pieces'
import { usePieces } from '../../app/pieces-store'
import { InviteDialog } from './InviteDialog'

export function Laterale({ onAller, onEnvoyer, onSuivi }: { onAller: (id: string) => void; onEnvoyer: () => void; onSuivi: () => void }) {
  const { etat, invitation, revoquer, envoyeLe } = usePieces()
  const [invite, setInvite] = useState(false)
  const c = compter(etat)
  const pct = (c.faites / c.total) * 100
  const bloque = c.bloquantes.length > 0
  const raison = bloque ? `Il manque ${c.bloquantes.length} pièce${c.bloquantes.length > 1 ? 's' : ''} obligatoire${c.bloquantes.length > 1 ? 's' : ''} : ${c.bloquantes.map((p) => p.nom).join(', ')}.` : ''
  const envoyer = envoyeLe ? (
    <Button size="lg" className="w-full" onClick={onSuivi}>Voir le suivi de ma demande <ArrowRight className="size-5" aria-hidden /></Button>
  ) : (
    <Button size="lg" className="w-full" disabled={bloque} disabledReason={raison} onClick={onEnvoyer}>Envoyer ma demande <ArrowRight className="size-5" aria-hidden /></Button>
  )

  return (
    <aside aria-label="Avancement de la demande" className="flex min-h-0 flex-col gap-3 overflow-y-auto pb-14">
      <Card className="p-5 shadow-md">
        <p className="eyebrow">Complétude</p>
        <div className="mt-3 flex items-center gap-4">
          <CircularProgress value={pct} size={88} label={`${c.faites} ${c.faites > 1 ? 'pièces' : 'pièce'} sur ${c.total}`}><span className="tabular text-2xl font-bold tracking-tighter">{c.faites}<span className="text-base font-normal text-subtle">/{c.total}</span></span></CircularProgress>
          <div><p className="text-xl font-semibold tracking-tight"><span className="tabular">{c.faites}</span> {c.faites > 1 ? 'pièces' : 'pièce'} sur <span className="tabular">{c.total}</span></p><p className="mt-0.5 text-sm text-muted">{c.faites === c.total ? 'Tout est prêt.' : `Il vous en reste ${c.total - c.faites}.`}</p></div>
        </div>
        {(c.bloquantes.length > 0 || c.recommandees.length > 0) && (
          <div className="mt-4 border-t border-border pt-3">
            <h2 className="eyebrow">{c.bloquantes.length > 0 ? 'Prochaine pièce obligatoire' : 'Il reste une pièce recommandée'}</h2>
            <button type="button" onClick={() => onAller((c.bloquantes[0] ?? c.recommandees[0]).id)} className="tr mt-2 flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-md bg-bg-soft px-3 text-left hover:bg-border"><span className="truncate text-sm font-semibold">{(c.bloquantes[0] ?? c.recommandees[0]).nom}</span><ArrowRight className="size-4 shrink-0" aria-hidden /></button>
          </div>
        )}
        <div className="mt-4">
          {bloque && !envoyeLe ? <Tooltip content={raison}><span className="block">{envoyer}</span></Tooltip> : envoyer}
          {!bloque && !envoyeLe && <p className="mt-2 text-sm font-medium text-success">Toutes les pièces obligatoires sont prêtes.</p>}
          {bloque && !envoyeLe && <p className="mt-2 text-xs leading-snug text-muted" id="raison-envoi">Il manque {c.bloquantes.length} pièce{c.bloquantes.length > 1 ? 's' : ''} obligatoire{c.bloquantes.length > 1 ? 's' : ''}. Choisissez-en une dans la liste.</p>}
        </div>
      </Card>
      <Card soft className="p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-surface"><UserPlus className="size-4" aria-hidden /></span>
          <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold tracking-tight">Inviter mon experte-comptable</h2><p className="text-xs text-muted">Pièces uniquement, sans le montant.</p></div>
          {!(invitation && !invitation.revoquee) && <Button variant="secondary" size="sm" onClick={() => setInvite(true)}>Inviter</Button>}
        </div>
        {invitation && !invitation.revoquee && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-sm"><span className="font-medium">{invitation.email}</span><span className="block text-xs text-muted">Invitée le {new Date(invitation.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span></p><Button size="sm" variant="ghost" onClick={revoquer}>Révoquer l’accès</Button></div>
        )}
      </Card>
      <InviteDialog open={invite} onOpenChange={setInvite} />
    </aside>
  )
}
