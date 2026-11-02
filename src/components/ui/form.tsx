import { forwardRef, useId } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

/* ---------- Button ---------- */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'inverse' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  /** Raison affichée à la place du bouton désactivé (lue par les lecteurs d'écran). */
  disabledReason?: string
}
const buttonVariants = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  inverse: 'bg-bg text-text hover:bg-bg-soft',
  secondary: 'bg-surface text-text border border-border-strong hover:bg-bg-soft active:bg-border',
  ghost: 'bg-transparent text-text hover:bg-bg-soft active:bg-border',
  destructive: 'bg-danger text-accent-fg hover:opacity-90 active:opacity-80',
}
const buttonSizes = { sm: 'h-10 px-4 text-sm', md: 'h-12 px-6 text-base', lg: 'h-14 px-8 text-lg' }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, disabled, disabledReason, className, children, ...rest },
  ref,
) {
  const reasonId = useId()
  const off = disabled || loading
  return (
    <>
      <button
        ref={ref}
        {...rest}
        aria-disabled={off || undefined}
        aria-busy={loading || undefined}
        aria-describedby={disabled && disabledReason ? reasonId : rest['aria-describedby']}
        title={disabled ? disabledReason : rest.title}
        onClick={(e) => (off ? e.preventDefault() : rest.onClick?.(e))}
        className={cn(
          'tr inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-md font-semibold tracking-tight [touch-action:manipulation] active:scale-[0.98]',
          buttonVariants[variant],
          buttonSizes[size],
          off && 'cursor-not-allowed opacity-45 active:scale-100',
          className,
        )}
      >
        {loading && <Loader2 className="size-4 animate-[spin_0.8s_linear_infinite]" aria-hidden />}
        {children}
      </button>
      {disabled && disabledReason && <span id={reasonId} className="sr-only">{disabledReason}</span>}
    </>
  )
})

/* ---------- Champs ---------- */
type FieldProps = { label: string; hint?: string; error?: string; required?: boolean; children: (p: { id: string; 'aria-describedby'?: string; invalid: boolean }) => ReactNode }
export function Field({ label, hint, error, required, children }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errId = `${id}-err`
  const describedBy = [hint && hintId, error && errId].filter(Boolean).join(' ') || undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-danger">*</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, invalid: !!error })}
      {hint && !error && <p id={hintId} className="text-sm text-muted">{hint}</p>}
      {error && <p id={errId} role="alert" className="flex items-start gap-1.5 text-sm font-medium text-danger">{error}</p>}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(function Input(
  { invalid, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      {...rest}
      className={cn(
        'tr h-11 w-full rounded-sm border bg-surface px-3.5 text-base text-text placeholder:text-subtle hover:border-text disabled:cursor-not-allowed disabled:bg-bg-soft disabled:opacity-60',
        invalid ? 'border-danger' : 'border-border-strong',
        className,
      )}
    />
  )
})

/* ---------- Select ---------- */
export type Option = { value: string; label: string }
export function Select({ id, value, onValueChange, options, placeholder, describedBy, invalid }: {
  id?: string; value?: string; onValueChange: (v: string) => void; options: Option[]; placeholder?: string; describedBy?: string; invalid?: boolean
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={cn('tr flex h-11 w-full cursor-pointer items-center justify-between rounded-sm border bg-surface px-3.5 text-left text-base hover:border-text data-[placeholder]:text-subtle', invalid ? 'border-danger' : 'border-border-strong')}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon><ChevronDown className="size-4 text-muted" aria-hidden /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={6} className="anim-fade z-[var(--z-dialog)] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-surface shadow-lg">
          <SelectPrimitive.Viewport className="p-1.5">
            {options.map((o) => (
              <SelectPrimitive.Item key={o.value} value={o.value} className="flex min-h-10 cursor-pointer items-center justify-between rounded-sm px-3 text-base outline-none data-[highlighted]:bg-bg-soft data-[state=checked]:font-semibold">
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator><Check className="size-4 text-accent-text" aria-hidden /></SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

/* ---------- Slider ---------- */
export function Slider({ value, onValueChange, min, max, step, label, format, neutral }: {
  value: number; onValueChange: (v: number) => void; min: number; max: number; step: number; label: string; format: (n: number) => string; neutral?: boolean
}) {
  return (
    <SliderPrimitive.Root className="relative flex h-11 w-full touch-none select-none items-center" value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onValueChange(v)}>
      <SliderPrimitive.Track className="relative h-1.5 grow rounded-full bg-border">
        {!neutral && <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />}
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb aria-label={label} aria-valuetext={neutral ? 'Aucun montant choisi' : format(value)} className={cn('tr block size-6 cursor-grab rounded-full border-2 bg-surface shadow-md hover:scale-105 active:cursor-grabbing', neutral ? 'border-border-strong' : 'border-accent')} />
    </SliderPrimitive.Root>
  )
}

/* ---------- Choice card ---------- */
export function ChoiceCard({ selected, onSelect, title, description, shortcut, icon }: {
  selected: boolean; onSelect: () => void; title: string; description?: string; shortcut?: string; icon?: ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'tr flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-md border px-4 py-3 text-left active:scale-[0.99]',
        selected ? 'border-accent bg-accent-soft shadow-sm outline outline-1 outline-accent' : 'border-border bg-surface hover:border-border-strong hover:bg-bg-soft',
      )}
    >
      {icon && <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-bg-soft text-text">{icon}</span>}
      <span className="flex-1">
        <span className="block font-semibold tracking-tight">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}
      </span>
      {shortcut && <kbd className="tabular hidden size-7 place-items-center rounded-sm border border-border-strong text-sm text-muted sm:grid" aria-hidden>{shortcut}</kbd>}
      <span aria-hidden className={cn('tr grid size-6 shrink-0 place-items-center rounded-full border', selected ? 'border-accent bg-accent text-accent-fg' : 'border-border-strong')}>
        {selected && <Check className="size-4" strokeWidth={2.5} />}
      </span>
    </button>
  )
}

/* ---------- Chip ---------- */
export function Chip({ children, onClick, selected, icon }: { children: ReactNode; onClick?: () => void; selected?: boolean; icon?: ReactNode }) {
  const cls = cn('tr inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium', selected ? 'border-accent bg-accent-soft text-accent-text' : 'border-border-strong bg-surface text-text', onClick && 'cursor-pointer hover:bg-bg-soft')
  return onClick ? <button type="button" onClick={onClick} className={cls} aria-pressed={selected}>{icon}{children}</button> : <span className={cls}>{icon}{children}</span>
}
