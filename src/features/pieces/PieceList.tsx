import { GROUPES, PIECES } from '../../domain/pieces'
import type { PieceState } from '../../domain/pieces'
import { statusMap } from '../../components/ui'
import { cn } from '../../lib/cn'

/** Liste maître : les 9 pièces groupées, avec leur état (icône et texte, jamais la couleur seule). */
export function PieceList({ etat, selection, onSelect }: { etat: Record<string, PieceState>; selection: string; onSelect: (id: string) => void }) {
  return (
    <nav aria-label="Pièces de la demande" className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
      {GROUPES.map((g) => (
        <section key={g.id} aria-labelledby={`g-${g.id}`}>
          <h2 id={`g-${g.id}`} className="eyebrow mb-1 px-2">{g.titre}</h2>
          <ul className="flex flex-col gap-0.5">
            {PIECES.filter((p) => p.groupe === g.id).map((p) => {
              const st = etat[p.id].statut
              const m = statusMap[st]
              const actif = selection === p.id
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => onSelect(p.id)} aria-current={actif ? 'true' : undefined} title={p.nom}
                    className={cn('tr flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1 text-left', actif ? 'bg-text text-bg' : 'hover:bg-bg-soft')}>
                    <span className={cn('grid size-6 shrink-0 place-items-center rounded-full [&>svg]:size-3.5', actif ? 'bg-bg/15 text-bg' : m.cls)} aria-hidden>{m.icon}</span>
                    <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium leading-tight">{p.nom}</span>
                    <span className={cn('shrink-0 text-xs', actif ? 'opacity-75' : 'text-subtle')}>{st === 'a-fournir' && !p.obligatoire ? 'Facultative' : m.label.replace('En attente de l’experte-comptable', 'Experte')}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </nav>
  )
}
