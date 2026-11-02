import { useNavigate } from 'react-router-dom'
import { Download, ExternalLink } from 'lucide-react'
import { AppShell } from '../shell/AppShell'
import { Button, Card, Eyebrow, LogoMark, Timeline } from '../../components/ui'
import { PIECES, compter } from '../../domain/pieces'
import { financements } from '../../domain/eligibility'
import { useDemande, useMontant } from '../../app/store'
import { usePieces } from '../../app/pieces-store'
import { eur } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'

export default function Envoyee() {
  usePageTitle('Demande envoyée')
  const go = useNavigate()
  const { etat, numero, envoyeLe, objet } = usePieces()
  const financementId = useDemande((s) => s.financementId)
  const montant = useMontant()
  const f = financements.find((x) => x.id === (financementId ?? 'pret-equipement-artisans'))!
  const c = compter(etat)
  const date = new Date(envoyeLe ?? Date.now())

  const telecharger = () => {
    const lignes = [`Récapitulatif de votre demande`, `Numéro : ${numero ?? '—'}`, `Financement : ${f.nom}`, `Objet : ${objet}`, `Montant souhaité : ${montant !== undefined ? eur(montant) : 'à préciser'}`, '', 'Pièces :', ...PIECES.map((p) => `- ${p.nom} : ${etat[p.id].statut}`), '', 'Prototype, données fictives.']
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([lignes.join('\n')], { type: 'text/plain;charset=utf-8' }))
    a.download = `recapitulatif-${numero ?? 'demande'}.txt`; a.click(); URL.revokeObjectURL(a.href)
  }

  return (
    <AppShell step={3} wide fit>
      <div className="mx-auto grid h-full min-h-0 max-w-5xl content-center gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-labelledby="titre" className="flex flex-col justify-center">
          <LogoMark className="h-12" />
          <Eyebrow className="mt-8">Demande envoyée</Eyebrow>
          <h1 id="titre" tabIndex={-1} className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.05] tracking-tighter outline-none">Votre demande est envoyée.</h1>
          <p className="mt-4 max-w-md text-lg text-muted">Un chargé d’affaires l’instruit. Vous pouvez encore modifier une pièce : il est prévenu de chaque changement.</p>
          <dl className="mt-6 grid grid-cols-[9rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-base">
            <dt className="text-muted">Numéro de dossier</dt><dd className="flex flex-wrap items-center gap-2"><span className="ident font-medium">{numero ?? '—'}</span></dd>
            <dt className="text-muted">Financement</dt><dd className="font-medium">{f.nom}</dd>
            <dt className="text-muted">Montant souhaité</dt><dd className="tabular font-medium">{montant !== undefined ? eur(montant) : 'À préciser'}</dd>
            <dt className="text-muted">Pièces</dt><dd className="tabular font-medium">{c.faites} sur {c.total}</dd>
          </dl>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={telecharger}><Download className="size-4" aria-hidden />Télécharger le récapitulatif</Button>
            <Button variant="secondary" onClick={() => go('/demande/pieces')}>Modifier mes pièces</Button>
            <Button variant="ghost" onClick={() => document.getElementById('suivi')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Suivre ma demande</Button>
          </div>
        </section>
        <Card id="suivi" className="self-center p-6 shadow-md">
          <h2 className="eyebrow">Suivi de votre demande</h2>
          <div className="mt-5"><Timeline items={[
            { title: 'Réception', detail: 'Votre demande est bien arrivée.', time: date.toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }), state: 'done' },
            { title: 'Instruction par un chargé d’affaires', detail: 'Il vérifie vos pièces et vos critères.', state: 'current' },
            { title: 'Réponse', detail: 'Délai estimé : sous 10 jours ouvrés', state: 'todo' }]} /></div>
                    <Button variant="ghost" size="sm" className="mt-4" onClick={() => go('/pro/dossiers/argile')}><ExternalLink className="size-4" aria-hidden />Voir côté chargé d’affaires (démo)</Button>
        </Card>
      </div>
    </AppShell>
  )
}
