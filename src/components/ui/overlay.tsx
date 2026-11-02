import type { ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

type Common = { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode }

/** Dialogue centré : piège de focus et retour du focus fournis par Radix. */
export function Dialog({ open, onOpenChange, title, description, children, footer }: Common & { footer?: ReactNode }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="anim-overlay fixed inset-0 z-[var(--z-dialog)] bg-[var(--color-overlay)]" />
        <DialogPrimitive.Content className="anim-pop fixed left-1/2 top-1/2 z-[var(--z-dialog)] flex max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-surface shadow-lg">
          <div className="flex items-start justify-between gap-4 p-6 pb-2">
            <div>
              <DialogPrimitive.Title className="text-2xl font-semibold tracking-tight">{title}</DialogPrimitive.Title>
              {description && <DialogPrimitive.Description className="mt-1.5 text-muted">{description}</DialogPrimitive.Description>}
              {!description && <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>}
            </div>
            <DialogPrimitive.Close aria-label="Fermer" className="tr -m-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-sm text-muted hover:bg-bg-soft"><X className="size-5" /></DialogPrimitive.Close>
          </div>
          <div className="overflow-y-auto px-6 py-4">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 p-6 pt-2">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Drawer latéral. La variante « ai » prend le fond sombre à dégradé réservé à l'IA. */
export function Drawer({ open, onOpenChange, title, description, children, variant = 'default', header }: Common & { variant?: 'default' | 'ai'; header?: ReactNode }) {
  const ai = variant === 'ai'
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="anim-overlay fixed inset-0 z-[var(--z-drawer)] bg-[var(--color-overlay)]" />
        <DialogPrimitive.Content className={cn('anim-drawer fixed inset-y-0 right-0 z-[var(--z-drawer)] flex w-[min(28rem,100vw)] flex-col shadow-lg', ai ? 'bg-ai text-[var(--color-ai-text)]' : 'bg-surface text-text')}>
          {ai && <div className="ai-line h-0.5 shrink-0" aria-hidden />}
          <div className="flex items-start justify-between gap-4 p-5 pb-3">
            <div>
              {header}
              <DialogPrimitive.Title className="text-xl font-semibold tracking-tight">{title}</DialogPrimitive.Title>
              {description ? <DialogPrimitive.Description className={cn('mt-1 text-sm', ai ? 'text-[var(--color-ai-muted)]' : 'text-muted')}>{description}</DialogPrimitive.Description> : <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>}
            </div>
            <DialogPrimitive.Close aria-label="Fermer" className={cn('tr -m-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-sm', ai ? 'text-[var(--color-ai-muted)] hover:bg-white/10' : 'text-muted hover:bg-bg-soft')}><X className="size-5" /></DialogPrimitive.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
