import { useEffect, useRef, useState } from 'react'
import { Phone } from 'lucide-react'
import { AiMessage, Button, Chip, Drawer, useToast } from '../../components/ui'
import { GENERALES, REPONSES, SOURCE } from './reponses'
import { pieceById } from '../../domain/pieces'
import { track } from '../../lib/events'

type Msg = { id: number; q: string; r: keyof typeof REPONSES }

/** Drawer de l'assistant Élan. Fond sombre à dégradé réservé à l'IA. Réponses scriptées, source citée, jamais de verdict. */
export function Assistant({ open, onOpenChange, pieceId }: { open: boolean; onOpenChange: (o: boolean) => void; pieceId: string | null }) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const toast = useToast()
  const fin = useRef<HTMLDivElement>(null)
  const piece = pieceId ? pieceById(pieceId) : null
  const chips = [...(piece?.suggestions ?? []), ...GENERALES]
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }) }, [msgs])
  const poser = (id: string, q: string) => { setMsgs((m) => [...m, { id: m.length + 1, q, r: id }]); track('aide_ia_utilisee', id) }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} variant="ai" title="Assistant Élan" description="L’IA prépare, vous validez."
      header={<p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-ai-accent)]">Généré par IA</p>}>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <p className="rounded-md bg-white/5 p-3 text-sm text-[var(--color-ai-muted)]">{piece ? <>Vous êtes sur <span className="font-medium text-[var(--color-ai-text)]">{piece.nom}</span>. Choisissez une question.</> : 'Choisissez une question.'} Je m’appuie uniquement sur le référentiel du financeur.</p>
        <ul className="mt-4 flex flex-col gap-4">
          {msgs.map((m) => (
            <li key={m.id} className="flex flex-col gap-2">
              <p className="self-end rounded-md bg-white/10 px-3.5 py-2 text-sm text-[var(--color-ai-text)]">{m.q}</p>
              <AiMessage text={REPONSES[m.r].texte} source={SOURCE}
                footer={REPONSES[m.r].incertain ? <p className="mt-2 text-sm text-[var(--color-ai-accent)]">Je ne suis pas sûr de pouvoir vous répondre seul. Un conseiller peut vous aider.</p> : undefined} />
            </li>
          ))}
        </ul>
        <div ref={fin} />
      </div>
      <div className="border-t border-[var(--color-ai-border)] p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[var(--color-ai-muted)]">Questions suggérées</p>
        <div className="flex flex-wrap gap-2">{chips.map((c) => <Chip key={c.id} onClick={() => poser(c.id, c.question)}>{c.question}</Chip>)}</div>
        <Button variant="secondary" className="mt-4 w-full" onClick={() => toast({ title: 'Rappel demandé', description: 'Un conseiller vous appelle sous un jour ouvré (démonstration).' })}><Phone className="size-4" aria-hidden />Parler à un conseiller</Button>
      </div>
    </Drawer>
  )
}
