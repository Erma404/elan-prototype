import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Saisie progressive. Affiche le texte complet d'un coup si prefers-reduced-motion. */
export function useTypewriter(text: string, active = true, speed = 14) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [n, setN] = useState(active && !reduce ? 0 : text.length)
  useEffect(() => {
    if (!active || reduce) { setN(text.length); return }
    setN(0)
    const id = window.setInterval(() => setN((v) => { if (v >= text.length) { window.clearInterval(id); return v } return v + 1 }), speed)
    return () => window.clearInterval(id)
  }, [text, active, reduce, speed])
  return { shown: text.slice(0, n), done: n >= text.length }
}

/** Message généré par l'IA : fond sombre à dégradé, source citée, toujours signalé comme IA. */
export function AiMessage({ text, source, animate = true, footer }: { text: string; source?: string; animate?: boolean; footer?: ReactNode }) {
  const { shown, done } = useTypewriter(text, animate)
  return (
    <div className="bg-ai rounded-md p-4 text-[var(--color-ai-text)]">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ai-accent)]">
        <span aria-hidden className="ai-line h-0.5 w-4 rounded-full" />Assistant Élan, généré par IA
      </p>
      <p aria-live="polite" className="text-base leading-relaxed">
        {shown}
        {!done && <span aria-hidden className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-[caret_1s_steps(1)_infinite] bg-current" />}
      </p>
      {done && source && <p className={cn('mt-3 border-t border-[var(--color-ai-border)] pt-2 text-xs text-[var(--color-ai-muted)]')}>Source : {source}</p>}
      {done && footer}
    </div>
  )
}
