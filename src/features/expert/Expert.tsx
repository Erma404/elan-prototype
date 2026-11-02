import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Banner, Button, Dropzone, FileRow, LogoLockup, useToast } from '../../components/ui'
import { pieceById } from '../../domain/pieces'
import { usePieces } from '../../app/pieces-store'
import { useUi } from '../../app/store'
import { useDepot } from '../pieces/useDepot'
import { usePageTitle } from '../../lib/usePageTitle'
import { DemoTrigger } from '../demo/DemoPanel'

const PAR_DEFAUT = ['bilans', 'liasse', 'attestation']

/** Vue de l'experte-comptable invitée : les pièces seulement, jamais le montant ni les réponses. */
export default function Expert() {
  usePageTitle('Dépôt de pièces')
  const { token } = useParams()
  const { etat, invitation } = usePieces()
  const masque = useUi((s) => s.bandeauMasque)
  const toast = useToast()
  const deposer = useDepot()
  const [fini, setFini] = useState(false)
  const ids = invitation && !invitation.revoquee ? invitation.pieces : PAR_DEFAUT
  const revoque = !!invitation?.revoquee

  return (
    <div className="relative min-h-dvh bg-bg text-text lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>
      <header className="border-b border-border">
        {!masque && <p className="mono bg-text px-4 py-1.5 text-center text-xs text-bg">Prototype, données fictives</p>}
        <div className="mx-auto flex h-16 max-w-[80rem] items-center justify-between px-4 sm:px-8"><LogoLockup className="h-7" /><div className="flex items-center gap-3"><DemoTrigger /><span className="eyebrow before:!hidden">Espace experte-comptable</span></div></div>
      </header>
      <main id="contenu" className="mx-auto w-full max-w-[80rem] px-4 py-6 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        <h1 tabIndex={-1} className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-tighter outline-none">Déposez les pièces de Fabienne M.</h1>
        <div className="mt-4 max-w-3xl"><Banner tone="info" title="Vous avez été invitée par Fabienne M. à déposer des pièces pour sa demande.">Vous ne voyez que ces pièces : ni le montant, ni les réponses, ni le reste du dossier. <span className="mono text-xs text-subtle">Lien {token}</span></Banner></div>
        {revoque ? <div className="mt-6 max-w-3xl"><Banner tone="danger" title="Accès révoqué">Fabienne M. a retiré votre accès. Demandez-lui une nouvelle invitation.</Banner></div> : (
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {ids.map((id) => {
              const p = pieceById(id), s = etat[id]
              return (
                <li key={id} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5">
                  <h2 className="font-semibold tracking-tight">{p.nom}</h2>
                  <p className="text-sm text-muted">{p.pourquoi}</p>
                  {s.fichier && s.statut !== 'a-fournir' && s.statut !== 'attente-experte' ? <FileRow name={s.fichier.nom} size={s.fichier.taille} status={s.statut} progress={s.progress} message={s.verifie} /> : <Dropzone compact label={p.nom} onFile={(f) => deposer(id, f.name, f.size, f)} />}
                </li>
              )
            })}
          </ul>
        )}
        {!revoque && <div className="mt-6"><Button size="lg" disabled={fini} onClick={() => { setFini(true); toast({ title: 'Fabienne M. a été prévenue', description: 'Vos dépôts sont visibles dans sa demande.' }) }}>{fini ? <><Check className="size-5" aria-hidden />Terminé</> : 'Terminer'}</Button></div>}
      </main>
    </div>
  )
}
