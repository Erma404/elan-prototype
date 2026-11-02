import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LifeBuoy, ShieldCheck } from 'lucide-react'
import { Avatar, Button, Dialog, LogoLockup, Stepper } from '../../components/ui'
import { reinitialiser } from '../../app/reset'
import { DemoTrigger } from '../demo/DemoPanel'
import { useMontant, useUi } from '../../app/store'
import { eur } from '../../lib/format'

/** Coque commune côté Fabienne : logo, progression, aide, avatar, mention de sécurité. */
export function AppShell({ step, children, wide, fit }: { step: 0 | 1 | 2 | 3; children: ReactNode; wide?: boolean; fit?: boolean }) {
  const [aide, setAide] = useState(false)
  const go = useNavigate()
  const masque = useUi((s) => s.bandeauMasque)
  const montant = useMontant()
  return (
    <div className={`relative bg-bg text-text ${fit ? 'min-h-dvh lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden' : 'min-h-dvh'}`}>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>
      <header className="sticky top-0 z-[var(--z-header)] border-b border-border bg-bg/90 backdrop-blur-sm">
        {!masque && <p className="mono bg-text px-4 py-1.5 text-center text-xs text-bg">Prototype, données fictives</p>}
        <div className="mx-auto grid h-16 max-w-[88rem] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-8">
          <Link to="/" aria-label="Élan, accueil"><LogoLockup className="h-7" /></Link>
          <nav aria-label="Progression de la demande" className="flex justify-center"><Stepper steps={['Éligibilité', 'Pièces', 'Envoi']} current={step} /></nav>
          <div className="flex items-center gap-3">
            <p className="hidden items-center gap-3 rounded-md border border-border bg-surface px-4 py-1.5 md:flex" aria-label="Montant souhaité">
              <span className="eyebrow !tracking-[0.1em] before:!hidden">Montant souhaité</span>
              <span className="tabular text-2xl font-bold leading-none tracking-tighter">{montant !== undefined ? eur(montant) : <span className="text-base font-normal text-subtle">à préciser</span>}</span>
            </p>
            <DemoTrigger />
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => { reinitialiser(); go('/eligibilite') }}>Réinitialiser</Button>
            <Button variant="ghost" size="sm" onClick={() => setAide(true)} aria-label="Aide"><LifeBuoy className="size-4" aria-hidden /><span className="hidden sm:inline">Aide</span></Button>
            <div className="flex items-center gap-2"><Avatar name="Fabienne M" /><span className="hidden text-sm font-medium lg:inline">Fabienne M.</span></div>
          </div>
        </div>
        <p className="flex items-center justify-between gap-3 border-t border-border bg-bg-soft px-4 py-2 md:hidden"><span className="eyebrow !tracking-[0.1em] before:!hidden">Montant souhaité</span><span className="tabular text-xl font-bold leading-none tracking-tighter">{montant !== undefined ? eur(montant) : <span className="text-sm font-normal text-subtle">à préciser</span>}</span></p>
      </header>
      <main id="contenu" className={`mx-auto w-full px-4 sm:px-8 ${fit ? 'pb-20 pt-5 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:pb-4' : 'pb-24 pt-8 sm:pt-12'} ${wide ? 'max-w-[96rem]' : 'max-w-[80rem]'}`}>{children}</main>
      <footer className={`border-t border-border ${fit ? 'lg:hidden' : ''}`}>
        <p className="mx-auto flex max-w-[88rem] items-center gap-2 px-4 py-5 text-sm text-muted sm:px-8"><ShieldCheck className="size-4 shrink-0" aria-hidden />Vos documents sont hébergés en France, chiffrés, et ne servent jamais à entraîner une IA.</p>
      </footer>
      <Dialog open={aide} onOpenChange={setAide} title="Besoin d’aide ?" description="Un conseiller Élan répond du lundi au vendredi, de 9 h à 18 h." footer={<Button variant="secondary" onClick={() => setAide(false)}>Fermer</Button>}>
        <ul className="flex flex-col gap-3 text-base">
          <li><span className="font-semibold">Une question sur une pièce ?</span> Ouvrez la pièce, l’assistant vous répond.</li>
          <li><span className="font-semibold">Un doute sur votre éligibilité ?</span> Un conseiller regarde votre situation avec vous.</li>
          <li className="mono text-sm text-muted">01 80 00 00 00 · appel gratuit (numéro fictif)</li>
        </ul>
      </Dialog>
    </div>
  )
}
