import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Button, Dialog, Field, Input, Badge } from '../../components/ui'
import { PIECES } from '../../domain/pieces'
import { usePieces } from '../../app/pieces-store'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PAR_DEFAUT = ['bilans', 'liasse', 'attestation']

export function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { etat, inviter } = usePieces()
  const [email, setEmail] = useState('')
  const [erreur, setErreur] = useState<string>()
  const [choix, setChoix] = useState<string[]>(PAR_DEFAUT)
  const dispo = PIECES.filter((p) => etat[p.id].statut === 'a-fournir')

  const envoyer = () => {
    if (!EMAIL.test(email)) { setErreur('Cette adresse n’est pas valide. Vérifiez le « @ » et le nom de domaine.'); return }
    if (choix.length === 0) { setErreur('Choisissez au moins une pièce à déléguer.'); return }
    inviter({ email, date: new Date().toISOString(), pieces: choix.filter((c) => dispo.some((d) => d.id === c)), revoquee: false })
    onOpenChange(false)
  }
  const toggle = (id: string) => setChoix((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Inviter mon experte-comptable" description="Elle dépose les pièces à votre place. Elle ne voit jamais le montant de votre demande."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button><Button onClick={envoyer}>Envoyer l’invitation</Button></>}>
      <div className="flex flex-col gap-5">
        <Field label="Adresse e-mail de l’experte-comptable" required error={erreur?.includes('adresse') ? erreur : undefined}>{(p) => <Input {...p} type="email" autoComplete="off" placeholder="prenom@cabinet.fr" value={email} onChange={(e) => { setEmail(e.target.value); setErreur(undefined) }} />}</Field>
        <fieldset>
          <legend className="text-sm font-medium">Pièces à lui confier</legend>
          <div className="mt-2 flex flex-col gap-1">
            {dispo.length === 0 && <p className="text-sm text-muted">Il n’y a plus de pièce à déléguer.</p>}
            {dispo.map((p) => (
              <label key={p.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-2 hover:bg-bg-soft">
                <input type="checkbox" checked={choix.includes(p.id)} onChange={() => toggle(p.id)} className="size-5 accent-[var(--color-accent)]" />
                <span className="text-base">{p.nom}</span>
              </label>
            ))}
          </div>
          {erreur?.includes('pièce') && <p role="alert" className="mt-1 text-sm font-medium text-danger">{erreur}</p>}
        </fieldset>
        <div className="rounded-md bg-bg-soft p-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><Eye className="size-4" aria-hidden />Ce qu’elle verra</p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted">
            <li>La liste des pièces choisies et leurs zones de dépôt</li><li>Rien d’autre : ni le montant, ni vos réponses</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2"><Badge tone="outline">Pièces uniquement</Badge><Badge tone="outline">Révocable à tout moment</Badge></div>
        </div>
      </div>
    </Dialog>
  )
}
