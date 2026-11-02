import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react'
import { AppShell } from '../shell/AppShell'
import { Banner, Button, Card, Dialog, Eyebrow, Field, Input, StatusBadge, Timeline } from '../../components/ui'
import { PIECES, compter } from '../../domain/pieces'
import { financements } from '../../domain/eligibility'
import { useDemande, useMontant } from '../../app/store'
import { usePieces } from '../../app/pieces-store'
import { envoyerDemande } from '../../mocks/api'
import { track } from '../../lib/events'
import { eur } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'

export default function Recap() {
  usePageTitle('Récapitulatif avant envoi')
  const go = useNavigate()
  const { etat, consentement, erreur, objet, set } = usePieces()
  const { financementId, setAnswer } = useDemande()
  const montant = useMontant()
  const f = financements.find((x) => x.id === (financementId ?? 'pret-equipement-artisans'))!
  const c = compter(etat)
  const [envoi, setEnvoi] = useState(false)
  const [echec, setEchec] = useState<string>()
  const [edit, setEdit] = useState(false)
  const [saisie, setSaisie] = useState(montant ? String(montant) : '')
  const bloque = c.bloquantes.length > 0
  const raison = bloque ? `Il manque ${c.bloquantes.length} pièce${c.bloquantes.length > 1 ? 's' : ''} obligatoire${c.bloquantes.length > 1 ? 's' : ''}.` : !consentement ? 'Cochez la case de consentement pour envoyer.' : ''

  const envoyer = async () => {
    track('envoi_clique'); setEnvoi(true); setEchec(undefined)
    try {
      const r = await envoyerDemande(erreur)
      set({ numero: r.numero, envoyeLe: new Date().toISOString() })
      track('envoi_reussi'); go('/demande/envoyee')
    } catch (e) { setEchec(e instanceof Error ? e.message : 'L’envoi n’a pas abouti.') } finally { setEnvoi(false) }
  }

  return (
    <AppShell step={2} wide fit>
      <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <section aria-labelledby="titre" className="flex min-h-0 flex-col gap-4 lg:overflow-y-auto">
          <div>
            <Eyebrow>Avant l’envoi</Eyebrow>
            <h1 id="titre" tabIndex={-1} className="mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-tighter outline-none">Vérifiez, puis envoyez votre demande.</h1>
          </div>
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4"><h2 className="text-lg font-semibold tracking-tight">Résumé de la demande</h2><Button variant="ghost" size="sm" onClick={() => setEdit(true)}><Pencil className="size-4" aria-hidden />Modifier</Button></div>
            <dl className="mt-3 grid grid-cols-[8rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-base">
              <dt className="text-muted">Financement</dt><dd className="font-medium">{f.nom}</dd>
              <dt className="text-muted">Objet</dt><dd className="font-medium">{objet}</dd>
              <dt className="text-muted">Montant souhaité</dt><dd className="tabular font-medium">{montant !== undefined ? eur(montant) : <button type="button" onClick={() => setEdit(true)} className="tr cursor-pointer font-medium text-accent-text underline underline-offset-4">Préciser le montant</button>}</dd>
            </dl>
          </Card>
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4"><h2 className="text-lg font-semibold tracking-tight">Vos pièces</h2><p className="tabular text-sm text-muted">{c.faites} sur {c.total}</p></div>
            <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {PIECES.map((p) => <li key={p.id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate">{p.nom}</span><StatusBadge status={etat[p.id].statut} /></li>)}
            </ul>
          </Card>
        </section>

        <aside aria-label="Envoi" className="flex min-h-0 flex-col gap-4 overflow-y-auto pb-2">
          <Card className="p-5 shadow-md">
            <h2 className="text-lg font-semibold tracking-tight">Votre consentement</h2>
            <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <input type="checkbox" checked={consentement} onChange={(e) => set({ consentement: e.target.checked })} className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]" />
              <span>J’accepte que mes documents soient traités pour instruire ma demande. Ils sont hébergés en France, conservés <span className="tabular">5 ans</span>, et ne servent jamais à entraîner une IA.</span>
            </label>
            {bloque && (
              <div className="mt-4"><Banner tone="warning" title="Envoi bloqué">
                <ul className="mt-1 flex flex-col">{c.bloquantes.map((p) => <li key={p.id}><button type="button" onClick={() => go('/demande/pieces')} className="tr min-h-9 cursor-pointer text-left font-medium underline underline-offset-4">{p.nom}</button></li>)}</ul>
              </Banner></div>
            )}
            {echec && <div className="mt-4"><Banner tone="danger" title="Envoi impossible">{echec}</Banner></div>}
            <Button size="lg" className="mt-5 w-full" loading={envoi} disabled={bloque || !consentement} disabledReason={raison} onClick={envoyer}>Envoyer ma demande <ArrowRight className="size-5" aria-hidden /></Button>
            {raison && <p className="mt-2 text-xs text-muted">{raison}</p>}
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => go('/demande/pieces')}><ArrowLeft className="size-4" aria-hidden />Revenir aux pièces</Button>
          </Card>
          <Card soft className="p-5">
            <h2 className="text-lg font-semibold tracking-tight">Et ensuite</h2>
            <div className="mt-3"><Timeline items={[{ title: 'Réception', detail: 'Vous recevez la confirmation.', state: 'current' }, { title: 'Instruction par un chargé d’affaires', state: 'todo' }, { title: 'Réponse', detail: 'Délai estimé : sous 10 jours ouvrés', state: 'todo' }]} /></div>
            <p className="mt-2"></p>
          </Card>
        </aside>
      </div>
      <Dialog open={edit} onOpenChange={setEdit} title="Modifier le montant souhaité" description="Il met à jour votre demande et le résumé."
        footer={<><Button variant="ghost" onClick={() => setEdit(false)}>Annuler</Button><Button onClick={() => { const n = Number(saisie); if (n > 0) setAnswer('montant', n); setEdit(false) }}>Enregistrer</Button></>}>
        <Field label="Montant souhaité, en euros">{(p) => <Input {...p} inputMode="numeric" autoComplete="off" value={saisie} onChange={(e) => setSaisie(e.target.value.replace(/\D/g, '').slice(0, 8))} className="tabular" />}</Field>
      </Dialog>
    </AppShell>
  )
}
