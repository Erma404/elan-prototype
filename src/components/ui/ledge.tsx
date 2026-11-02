import type { ReactNode } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Icône du jeu fourni (trait épais), colorée par le texte courant grâce à un masque. */
export function Icon({ name, className }: { name: string; className?: string }) {
  const url = `url(/icons/${name}.svg)`
  return <span aria-hidden className={cn('inline-block size-6 shrink-0 bg-current', className)} style={{ WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }} />
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('eyebrow', className)}>{children}</p>
}

type GaugeItem = { label: string; value?: string; ok: boolean }
/** Carte de complétude : anneau, liste vérifiée, pied d'action. Fragment d'interface réutilisé dans l'écran Pièces. */
export function GaugeCard({ eyebrow, badge, value, max, caption, items, footerLeft, footerRight, className }: {
  eyebrow: string; badge?: string; value: number; max: number; caption: string; items: GaugeItem[]; footerLeft?: ReactNode; footerRight?: ReactNode; className?: string
}) {
  const r = 52, c = 2 * Math.PI * r
  return (
    <div className={cn('rounded-card border border-border bg-surface p-6 shadow-md', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{eyebrow}</p>
        {badge && <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-text">{badge}</span>}
      </div>
      <div className="mt-5 flex items-center gap-6">
        <div role="progressbar" aria-label={caption} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} className="relative size-32 shrink-0">
          <svg viewBox="0 0 128 128" className="-rotate-90" aria-hidden>
            <circle cx="64" cy="64" r={r} fill="none" stroke="var(--color-bg-soft)" strokeWidth="9" />
            <circle cx="64" cy="64" r={r} fill="none" stroke="var(--color-accent)" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / max)} className="transition-[stroke-dashoffset] duration-[var(--duration-slow)] ease-[var(--ease-out)]" />
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <p className="tabular text-4xl font-bold leading-none tracking-tighter">{value}<span className="text-lg font-normal text-subtle">/{max}</span></p>
            <p className="mono mt-1 text-[0.6875rem] uppercase tracking-widest text-muted">{caption}</p>
          </div>
        </div>
        <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
          {items.map((it) => (
            <li key={it.label} className="flex items-start gap-3 text-sm">
              <span aria-hidden className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full', it.ok ? 'bg-text text-bg' : 'bg-warning-soft text-warning')}>{it.ok ? <Check className="size-3" strokeWidth={3} /> : <TriangleAlert className="size-3" strokeWidth={2.5} />}</span>
              <span className="flex-1 font-medium">{it.label}<span className="sr-only">{it.ok ? ' (fait)' : ' (à faire)'}</span></span>
              {it.value && <span className="mono shrink-0 text-subtle">{it.value}</span>}
            </li>
          ))}
        </ul>
      </div>
      {(footerLeft || footerRight) && <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 text-sm"><span className="text-muted">{footerLeft}</span><span className="font-semibold">{footerRight}</span></div>}
    </div>
  )
}
