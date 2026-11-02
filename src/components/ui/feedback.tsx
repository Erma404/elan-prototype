import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { AlertTriangle, CheckCircle2, CircleDashed, Clock, FileCheck2, Info, Loader2, MinusCircle, ShieldCheck, UserRound, X, XCircle } from 'lucide-react'
import { cn } from '../../lib/cn'

/* ---------- Badge de statut : toujours une icône et un texte ---------- */
export type PieceStatus = 'a-fournir' | 'envoi' | 'recue' | 'a-corriger' | 'verifiee' | 'non-applicable' | 'attente-experte'
export const statusMap: Record<PieceStatus, { label: string; icon: ReactNode; cls: string }> = {
  'a-fournir': { label: 'À fournir', icon: <CircleDashed />, cls: 'bg-bg-soft text-muted' },
  envoi: { label: 'Envoi en cours', icon: <Loader2 className="animate-[spin_0.8s_linear_infinite]" />, cls: 'bg-accent-soft text-accent-text' },
  recue: { label: 'Reçue', icon: <FileCheck2 />, cls: 'bg-success-soft text-success' },
  'a-corriger': { label: 'À corriger', icon: <AlertTriangle />, cls: 'bg-warning-soft text-warning' },
  verifiee: { label: 'Vérifiée', icon: <ShieldCheck />, cls: 'bg-success-soft text-success' },
  'non-applicable': { label: 'Non applicable', icon: <MinusCircle />, cls: 'bg-bg-soft text-muted' },
  'attente-experte': { label: 'En attente de l’experte-comptable', icon: <UserRound />, cls: 'bg-accent-soft text-accent-text' },
}
export function StatusBadge({ status, label }: { status: PieceStatus; label?: string }) {
  const s = statusMap[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium [&>svg]:size-4', s.cls)}>
      {s.icon}
      {label ?? s.label}
    </span>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' }) {
  const tones = {
    neutral: 'bg-bg-soft text-muted', accent: 'bg-accent-soft text-accent-text', success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning', danger: 'bg-danger-soft text-danger', outline: 'border border-border-strong text-text',
  }
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone])}>{children}</span>
}

/* ---------- Bandeau ---------- */
export function Banner({ tone = 'info', title, children, action, onClose }: { tone?: 'info' | 'success' | 'warning' | 'danger'; title?: string; children?: ReactNode; action?: ReactNode; onClose?: () => void }) {
  const t = {
    info: { cls: 'bg-accent-soft text-text', icon: <Info className="text-accent-text" /> },
    success: { cls: 'bg-success-soft text-text', icon: <CheckCircle2 className="text-success" /> },
    warning: { cls: 'bg-warning-soft text-text', icon: <AlertTriangle className="text-warning" /> },
    danger: { cls: 'bg-danger-soft text-text', icon: <XCircle className="text-danger" /> },
  }[tone]
  return (
    <div role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-md p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0', t.cls)}>
      {t.icon}
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5 text-muted')}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && <button type="button" onClick={onClose} aria-label="Fermer" className="tr -m-2 grid size-11 cursor-pointer place-items-center rounded-sm text-muted hover:bg-bg-soft"><X className="size-4" /></button>}
    </div>
  )
}

/* ---------- Progression ---------- */
export function Progress({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <ProgressPrimitive.Root value={value} aria-label={label} className={cn('relative h-2 w-full overflow-hidden rounded-full bg-border', className)}>
      <ProgressPrimitive.Indicator className="h-full w-full origin-left rounded-full bg-accent transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)]" style={{ transform: `scaleX(${Math.min(100, Math.max(0, value)) / 100})` }} />
    </ProgressPrimitive.Root>
  )
}
export function CircularProgress({ value, size = 72, label, children }: { value: number; size?: number; label: string; children?: ReactNode }) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className="transition-[stroke-dashoffset] duration-[var(--duration-slow)] ease-[var(--ease-out)]" />
      </svg>
      <div className="tabular absolute text-center text-sm font-semibold">{children}</div>
    </div>
  )
}

export const Skeleton = ({ className }: { className?: string }) => <div aria-hidden className={cn('shimmer rounded-sm', className)} />

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-card border border-dashed border-border-strong p-8">
      {icon && <div className="grid size-11 place-items-center rounded-md bg-bg-soft [&>svg]:size-5">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <p className="max-w-prose text-muted">{children}</p>}
      {action}
    </div>
  )
}

/* ---------- Tooltip ---------- */
export const TooltipProvider = TooltipPrimitive.Provider
export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <TooltipPrimitive.Root delayDuration={150}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content sideOffset={8} className="anim-fade z-[var(--z-toast)] max-w-72 rounded-sm bg-text px-3 py-2 text-sm text-bg shadow-lg">
          {content}
          <TooltipPrimitive.Arrow className="fill-text" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

/* ---------- Toast discret ---------- */
type ToastItem = { id: number; title: string; description?: string }
const ToastCtx = createContext<(t: Omit<ToastItem, 'id'>) => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const push = useCallback((t: Omit<ToastItem, 'id'>) => setItems((x) => [...x, { ...t, id: Date.now() + Math.random() }]), [])
  return (
    <ToastCtx.Provider value={push}>
      <ToastPrimitive.Provider duration={4000} label="Notifications">
        {children}
        {items.map((t) => (
          <ToastPrimitive.Root key={t.id} onOpenChange={(o) => !o && setItems((x) => x.filter((i) => i.id !== t.id))} className="anim-toast flex items-start gap-3 rounded-md border border-border bg-surface p-4 shadow-lg">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
            <div className="flex-1">
              <ToastPrimitive.Title className="text-sm font-semibold">{t.title}</ToastPrimitive.Title>
              {t.description && <ToastPrimitive.Description className="mt-0.5 text-sm text-muted">{t.description}</ToastPrimitive.Description>}
            </div>
            <ToastPrimitive.Close aria-label="Fermer" className="tr -m-2 grid size-11 cursor-pointer place-items-center rounded-sm text-muted hover:bg-bg-soft"><X className="size-4" /></ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[var(--z-toast)] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastCtx.Provider>
  )
}
