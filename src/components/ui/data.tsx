import { useId, useRef, useState } from 'react'
import type { DragEvent, ReactNode } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { Camera, Check, ChevronDown, FileText, Upload } from 'lucide-react'
import { cn } from '../../lib/cn'
import { taille } from '../../lib/format'
import { Progress, StatusBadge } from './feedback'
import type { PieceStatus } from './feedback'
import { Button } from './form'

export function Card({ children, className, as: Tag = 'div', soft, id }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article'; soft?: boolean; id?: string }) {
  return <Tag id={id} className={cn('rounded-card p-6', soft ? 'bg-bg-soft' : 'border border-border bg-surface shadow-sm', className)}>{children}</Tag>
}

/* ---------- Accordéon : la hauteur s'anime par grid-template-rows ---------- */
export const Accordion = AccordionPrimitive.Root
export function AccordionItem({ value, header, children, className }: { value: string; header: ReactNode; children: ReactNode; className?: string }) {
  return (
    <AccordionPrimitive.Item value={value} className={cn('group rounded-card border border-border bg-surface', className)}>
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger className="tr flex min-h-16 flex-1 cursor-pointer items-center gap-3 rounded-card px-5 py-3 text-left hover:bg-bg-soft">
          <span className="flex-1">{header}</span>
          <ChevronDown className="tr size-5 shrink-0 text-muted group-data-[state=open]:rotate-180" aria-hidden />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="grid overflow-hidden data-[state=closed]:hidden">
        <div className="anim-fade px-5 pb-5">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

/* ---------- Onglets ---------- */
export const Tabs = TabsPrimitive.Root
export const TabsContent = TabsPrimitive.Content
export function TabsList({ children, label }: { children: ReactNode; label: string }) {
  return <TabsPrimitive.List aria-label={label} className="flex gap-1 border-b border-border">{children}</TabsPrimitive.List>
}
export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  return (
    <TabsPrimitive.Trigger value={value} className="tr -mb-px min-h-11 cursor-pointer border-b-2 border-transparent px-4 text-base font-medium text-muted hover:text-text data-[state=active]:border-accent data-[state=active]:text-text">
      {children}
    </TabsPrimitive.Trigger>
  )
}

/* ---------- Tableau ---------- */
export function Table({ caption, head, children }: { caption: string; head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-bg-soft text-muted">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  )
}

/* ---------- Chronologie ---------- */
export type TimelineItem = { title: string; detail?: string; time?: string; state?: 'done' | 'current' | 'todo'; ai?: boolean }
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((it, i) => (
        <li key={i} className="relative flex gap-4 pb-6 last:pb-0" aria-current={it.state === 'current' ? 'step' : undefined}>
          {i < items.length - 1 && <span aria-hidden className="absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px bg-border" />}
          <span aria-hidden className={cn('relative mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-accent-fg', it.state === 'done' ? 'border-success bg-success' : it.state === 'current' ? 'border-accent bg-surface' : 'border-border-strong bg-surface')}>
            {it.state === 'done' && <Check className="size-3.5" strokeWidth={3} />}
            {it.state === 'current' && <span className="size-2 rounded-full bg-accent" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{it.title}{it.state === 'done' && <span className="sr-only"> (terminé)</span>}{it.state === 'current' && <span className="sr-only"> (en cours)</span>}</p>
            {it.detail && <p className="mt-0.5 text-sm text-muted">{it.detail}</p>}
            {it.time && <p className="tabular mt-0.5 text-xs text-subtle">{it.time}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ---------- Étapes ---------- */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2 text-sm">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        return (
          <li key={s} aria-current={state === 'current' ? 'step' : undefined} className="flex items-center gap-2">
            <span className={cn('tabular grid size-6 place-items-center rounded-full text-xs font-semibold', state === 'done' && 'bg-success text-accent-fg', state === 'current' && 'bg-text text-bg', state === 'todo' && 'border border-border-strong text-muted')}>
              {state === 'done' ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            <span className={cn('hidden sm:inline', state === 'current' ? 'font-semibold' : 'text-muted')}>{s}</span>
            <span className="sr-only sm:hidden">{s}{state === 'done' ? ' (terminé)' : state === 'current' ? ' (en cours)' : ''}</span>
            {i < steps.length - 1 && <span aria-hidden className="h-px w-4 bg-border-strong sm:w-8" />}
          </li>
        )
      })}
    </ol>
  )
}

export function Avatar({ name, src }: { name: string; src?: string }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <AvatarPrimitive.Root className="inline-grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft text-sm font-semibold text-accent-text">
      {src && <AvatarPrimitive.Image src={src} alt="" className="size-full object-cover" />}
      <AvatarPrimitive.Fallback aria-hidden>{initials}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

/* ---------- Ligne de fichier ---------- */
export function FileRow({ name, size, status, progress, message, actions }: { name: string; size?: number; status: PieceStatus; progress?: number; message?: string; actions?: ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 rounded-md border border-border bg-surface p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-bg-soft"><FileText className="size-5 text-muted" aria-hidden /></span>
      <div className="min-w-0">
        <p className="truncate font-medium" title={name}>{name}</p>
        <p className="tabular text-sm leading-snug text-muted">{size ? taille(size) : ''}{message && <span className={cn(!!size && 'before:mx-1.5 before:content-["·"]')}>{message}</span>}</p>
      </div>
      <StatusBadge status={status} />
      {status === 'envoi' && typeof progress === 'number' && <Progress value={progress} label={`Envoi de ${name}`} className="col-span-3" />}
      {actions && <div className="col-span-3 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-2.5">{actions}</div>}
    </div>
  )
}

/* ---------- Zone de dépôt : glisser-déposer, clic, clavier, photo mobile ---------- */
export const FORMATS = ['application/pdf', 'image/jpeg', 'image/png']
export const MAX_OCTETS = 10 * 1024 * 1024

export function validateFile(f: File): string | null {
  if (!FORMATS.includes(f.type)) return 'Format refusé. Déposez un PDF, un JPG ou un PNG de 10 Mo au plus.'
  if (f.size > MAX_OCTETS) return `Fichier trop lourd : ${taille(f.size)} pour 10 Mo au plus. Rien n’est perdu, choisissez une version plus légère.`
  return null
}

export function Dropzone({ onFile, onReject, label, busy, forceTooLarge, compact }: { onFile: (f: File) => void; onReject?: (message: string, f: File) => void; label: string; busy?: boolean; forceTooLarge?: number; compact?: boolean }) {
  const [over, setOver] = useState(false)
  const [error, setError] = useState<string>()
  const input = useRef<HTMLInputElement>(null)
  const camera = useRef<HTMLInputElement>(null)
  const errId = useId()
  const take = (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    const problem = forceTooLarge ? `Fichier trop lourd : ${taille(forceTooLarge)} pour 10\u00a0Mo au plus. Rien n’est perdu, choisissez une version plus légère.` : validateFile(f)
    if (problem) { setError(problem); onReject?.(problem, f); return }
    setError(undefined)
    onFile(f)
  }
  const drop = (e: DragEvent) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files) }
  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}
        className={cn('tr flex rounded-md border border-dashed', compact ? 'flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5' : 'flex-col items-center gap-3 border-2 p-6 text-center', over ? 'border-accent bg-accent-soft' : 'border-border-strong bg-surface')}
      >
        <Upload className="size-5 shrink-0 text-muted" aria-hidden />
        {compact ? <p className="min-w-0 flex-1 text-sm text-muted"><span className="font-medium text-text">Glissez le fichier ici</span> ou choisissez-le. PDF, JPG, PNG, 10 Mo.</p> : (
          <div><p className="font-medium">Glissez le fichier ici</p><p className="text-sm text-muted">PDF, JPG ou PNG, 10 Mo au plus</p></div>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={busy} onClick={() => input.current?.click()} aria-describedby={error ? errId : undefined}>Choisir un fichier<span className="sr-only"> pour {label}</span></Button>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => camera.current?.click()}><Camera className="size-4" aria-hidden />Photo<span className="sr-only"> pour {label}</span></Button>
        </div>
        <input ref={input} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { take(e.target.files); e.target.value = '' }} />
        <input ref={camera} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { take(e.target.files); e.target.value = '' }} />
      </div>
      {error && (
        <p id={errId} role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}{' '}
          <a href="https://www.ilovepdf.com/fr/jpg_en_pdf" target="_blank" rel="noreferrer" className="underline underline-offset-2">Convertir mon fichier</a>
        </p>
      )}
    </div>
  )
}
