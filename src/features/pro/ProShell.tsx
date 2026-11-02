import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, LogoLockup, ProTag } from '../../components/ui'
import { useUi } from '../../app/store'
import { DemoTrigger } from '../demo/DemoPanel'

/** Coque Élan Pro : identité sobre, même système de jetons, indicateur « Pro » discret. */
export function ProShell({ children }: { children: ReactNode }) {
  const masque = useUi((s) => s.bandeauMasque)
  return (
    <div className="relative min-h-dvh bg-bg-soft text-text lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>
      <header className="border-b border-border bg-bg">
        {!masque && <p className="mono bg-text px-4 py-1.5 text-center text-xs text-bg">Prototype, données fictives</p>}
        <div className="mx-auto flex h-14 max-w-[96rem] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6"><Link to="/pro/dossiers" aria-label="Élan Pro, dossiers" className="flex items-center"><LogoLockup className="h-6" /><ProTag /></Link>
            <nav aria-label="Élan Pro"><Link to="/pro/dossiers" aria-current="page" className="text-sm font-semibold">Dossiers</Link></nav></div>
          <div className="flex items-center gap-2"><DemoTrigger /><Avatar name="Nicolas B" /><span className="hidden text-sm font-medium sm:inline">Nicolas B., chargé d’affaires</span></div>
        </div>
      </header>
      <main id="contenu" className="mx-auto w-full max-w-[96rem] px-4 py-4 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-hidden">{children}</main>
    </div>
  )
}
