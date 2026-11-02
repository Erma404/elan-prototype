import { cn } from '../../lib/cn'

import { LOGO } from './logo-data'

type LogoProps = { className?: string; title?: string }

/** Symbole : le É en graisse régulière (lisible à 16 px). L'accent est coupé au même angle (45°) que les barres. */
export function LogoMark({ className, title = 'Élan' }: LogoProps) {
  return (
    <svg viewBox={LOGO.mark.vb} role="img" aria-label={title} className={cn('w-auto', className ?? 'h-8')} fill="none">
      <path d={LOGO.mark.ink} fill="currentColor" />
      <path d={LOGO.mark.accent} fill="var(--color-accent)" />
    </svg>
  )
}

/** Wordmark ÉLAN en capitales légères, dessinées lettre par lettre sur la même règle de coupe. */
export function LogoLockup({ className, title = 'Élan' }: LogoProps) {
  return (
    <svg viewBox={LOGO.wordmark.vb} role="img" aria-label={title} className={cn('w-auto', className ?? 'h-8')} fill="none">
      <path d={LOGO.wordmark.ink} fill="currentColor" />
      <path d={LOGO.wordmark.accent} fill="var(--color-accent)" />
    </svg>
  )
}

/** Symbole animé : 480 ms de révélation puis 320 ms pour l'accent. Statique si prefers-reduced-motion. */
export function LogoMarkAnimated({ className }: { className?: string }) {
  return (
    <svg viewBox={LOGO.mark.vb} role="img" aria-label="Élan" className={cn('w-auto', className ?? 'h-14')} fill="none">
      <path d={LOGO.mark.ink} fill="currentColor" className="logo-e" />
      <path d={LOGO.mark.accent} fill="var(--color-accent)" className="logo-a" />
    </svg>
  )
}

export function ProTag() {
  return (
    <span className="ml-2 rounded-sm border border-border-strong px-1.5 py-px align-middle text-xs font-semibold leading-4 text-muted">Pro</span>
  )
}
