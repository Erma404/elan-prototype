import type { PieceDef } from '../../domain/pieces'

/** Aperçu d'un document fictif : un exemple de ce qu'on attend, jamais un vrai document. */
export function DocumentExemple({ piece }: { piece: PieceDef }) {
  return (
    <figure className="w-full max-w-[13.5rem] justify-self-end" aria-label={`Exemple : ${piece.exemple.titre}`}>
      <div className="rounded-md border border-border bg-surface p-3">
        <p className="truncate text-xs font-semibold">{piece.exemple.titre}</p>
        <div aria-hidden className="mt-2 space-y-1"><div className="h-1 w-2/3 rounded-full bg-border" /><div className="h-1 w-1/2 rounded-full bg-border" /></div>
        <ul className="tabular mt-3 space-y-0.5 text-[0.6875rem] leading-snug text-muted">{piece.exemple.lignes.slice(0, 3).map((l) => <li key={l} className="truncate">{l}</li>)}</ul>
        <div aria-hidden className="mt-3 space-y-1"><div className="h-1 w-full rounded-full bg-bg-soft" /><div className="h-1 w-4/5 rounded-full bg-bg-soft" /></div>
      </div>
      <figcaption className="mt-1.5 text-center text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-subtle">Exemple de document</figcaption>
    </figure>
  )
}
