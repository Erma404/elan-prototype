import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Clock, MessageSquareQuote } from 'lucide-react'
import { ProShell } from './ProShell'
import { Badge, Button, Card, CircularProgress, Dialog, Drawer, Eyebrow, Progress, StatusBadge, Tabs, TabsContent, TabsList, TabsTrigger, Timeline, useToast } from '../../components/ui'
import type { TimelineItem } from '../../components/ui'
import { DocumentExemple } from '../pieces/DocumentExemple'
import { PIECES, compter, complete, pieceById } from '../../domain/pieces'
import { evaluer, financements, libelleAnciennete, libelleEffectif, LIBELLES_PROJET, LIBELLES_SECTEUR } from '../../domain/eligibility'
import type { Answers } from '../../domain/types'
import { AUTRES } from '../../mocks/dossiers'
import { useDemande } from '../../app/store'
import { usePieces } from '../../app/pieces-store'
import { useEvents } from '../../lib/events'
import { GENERALES } from '../ia/reponses'
import { useRelances } from './relances'
import { eur } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'

const QUESTIONS_IA: Record<string, string> = Object.fromEntries([...PIECES.flatMap((p) => p.suggestions), ...GENERALES].map((q) => [q.id, q.question]))
const jour = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
const heure = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
const PREUVE: Record<keyof Answers, string | null> = { projet: 'devis', effectif: null, anciennete: 'kbis', montant: 'devis', secteur: 'kbis' }

export default function ProDossier() {
  const { id = 'argile' } = useParams()
  usePageTitle('Fiche dossier')
  const toast = useToast()
  const { etat, envoyeLe, numero } = usePieces()
  const { answers, financementId } = useDemande()
  const events = useEvents((s) => s.events)
  const relances = useRelances()
  const [dialog, setDialog] = useState<null | 'relance' | 'correction'>(null)
  const [apercu, setApercu] = useState<string | null>(null)
  const [texte, setTexte] = useState('')
  const [ouvert, setOuvert] = useState<string | null>(null)
  const autre = AUTRES.find((d) => d.id === id)

  const c = compter(etat)
  const aCorriger = PIECES.filter((p) => etat[p.id].statut === 'a-corriger')
  const f = financements.find((x) => x.id === (financementId ?? 'pret-equipement-artisans'))!
  const ev = useMemo(() => evaluer(f, answers), [f, answers])

  if (!autre && id !== 'argile') return <Navigate to="/pro/dossiers/argile" replace />

  const file = [{ id: 'argile', entreprise: 'Atelier Argile & Feu', financement: f.nom, faites: c.faites, total: c.total, statut: c.bloquantes.length === 0 && aCorriger.length === 0 ? 'pret' : aCorriger.length > 0 ? 'corriger' : 'incomplet', corrections: aCorriger.length }, ...AUTRES.map((d) => ({ ...d }))].sort((a, b) => b.faites - a.faites)
  const badge = (s: string, n: number) => (s === 'pret' ? <Badge tone="success">Prêt à instruire</Badge> : s === 'corriger' ? <Badge tone="warning">{n} pièce{n > 1 ? 's' : ''} à corriger</Badge> : <Badge>Incomplet</Badge>)

  const manquantes = PIECES.filter((p) => !complete(etat[p.id].statut))
  const messageRelance = (kind: 'relance' | 'correction') => kind === 'correction'
    ? `Bonjour,\n\nNous avons besoin d’une correction :\n${aCorriger.map((p) => `- ${p.nom} : ${etat[p.id].message}`).join('\n') || '- (aucune pièce à corriger pour l’instant)'}\n\nVous pouvez remplacer le fichier directement dans votre demande.\n\nCordialement, Nicolas B.`
    : `Bonjour,\n\nIl manque ${manquantes.length} pièce${manquantes.length > 1 ? 's' : ''} pour instruire votre demande :\n${manquantes.map((p) => `- ${p.nom}`).join('\n')}\n\nVous pouvez les déposer depuis votre demande, l’assistant vous aide à les trouver.\n\nCordialement, Nicolas B.`
  const ouvrir = (k: 'relance' | 'correction') => { setTexte(messageRelance(k)); setDialog(k) }

  const criteres = ev.criteres.map((cr) => {
    const preuveId = PREUVE[cr.id]
    const preuve = preuveId ? pieceById(preuveId) : null
    const prouve = preuve ? complete(etat[preuve.id].statut) : false
    const reponse = { projet: answers.projet ? LIBELLES_PROJET[answers.projet] : '—', effectif: answers.effectif !== undefined ? libelleEffectif(answers.effectif) : '—', anciennete: answers.anciennete !== undefined ? libelleAnciennete(answers.anciennete) : '—', montant: answers.montant !== undefined ? eur(answers.montant) : 'Non renseigné', secteur: answers.secteur ? LIBELLES_SECTEUR[answers.secteur] : '—' }[cr.id]
    const statut = cr.ok === false ? 'À vérifier' : prouve ? 'Vérifié par pièce' : cr.ok === null ? 'À vérifier' : 'Rempli'
    return { ...cr, preuve, reponse, statut }
  })

  const journal: TimelineItem[] = [
    ...relances.items.map((r) => ({ title: r.type === 'relance' ? 'Relance envoyée' : r.type === 'correction' ? 'Correction demandée' : r.type === 'instruction' ? 'Instruction démarrée' : 'Modification par l’entrepreneur', detail: r.texte.split('\n')[0].slice(0, 90), time: heure(r.date), state: 'done' as const })),
    ...events.filter((e) => e.name === 'aide_ia_utilisee').slice(0, 3).map((e) => ({ title: 'Échange avec l’assistant', detail: `« ${QUESTIONS_IA[e.detail ?? ''] ?? 'Question'} »`, time: heure(new Date(e.at).toISOString()), state: 'done' as const })),
    ...(envoyeLe ? [{ title: 'Demande envoyée', detail: numero ?? undefined, time: heure(envoyeLe), state: 'done' as const }] : [{ title: 'Demande en cours de constitution', detail: 'Pas encore envoyée par l’entrepreneur.', state: 'current' as const }]),
  ]

  const envoyer = () => { relances.add(dialog === 'correction' ? 'correction' : 'relance', texte); toast({ title: dialog === 'correction' ? 'Correction demandée' : 'Relance envoyée', description: 'Message transmis à l’entrepreneur (démonstration).' }); setDialog(null) }

  if (autre) {
    return (
      <ProShell>
        <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <FileDeTravail file={file} id={id} badge={badge} />
          <Card className="self-start p-6"><Eyebrow>Dossier fictif</Eyebrow><h1 tabIndex={-1} className="mt-3 text-2xl font-bold tracking-tighter outline-none">{autre.entreprise}</h1><p className="mt-1 text-muted">{autre.financement} · {autre.dirigeant}</p><p className="mt-4 text-sm text-muted">Ouvrez le dossier d’Atelier Argile &amp; Feu pour la fiche complète.</p><div className="mt-5"><Link to="/pro/dossiers/argile" className="font-semibold underline underline-offset-4">Ouvrir Atelier Argile &amp; Feu</Link></div></Card>
        </div>
      </ProShell>
    )
  }

  return (
    <ProShell>
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <FileDeTravail file={file} id={id} badge={badge} />
        <div className="flex min-h-0 min-w-0 flex-col gap-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3"><h1 tabIndex={-1} className="text-2xl font-bold tracking-tighter outline-none">Atelier Argile &amp; Feu</h1>{badge(c.bloquantes.length === 0 && aCorriger.length === 0 ? 'pret' : aCorriger.length ? 'corriger' : 'incomplet', aCorriger.length)}</div>
                <p className="mt-1 text-muted">{f.nom} · <span className="tabular">{answers.montant !== undefined ? eur(answers.montant) : 'montant non renseigné'}</span> · {envoyeLe ? `envoyé le ${jour(envoyeLe)}` : 'pas encore envoyé'}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted"><Clock className="size-4" aria-hidden /><span className="tabular">Temps de relance estimé : environ 25 min (45 min sans Élan)</span><span className="text-xs text-subtle">ordre de grandeur à calibrer</span></p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => { relances.add('instruction', 'Instruction démarrée par Nicolas B.'); toast({ title: 'Instruction démarrée', description: 'L’entrepreneur est prévenu (démonstration).' }) }} disabled={c.bloquantes.length > 0} disabledReason="Des pièces obligatoires manquent : relancez d’abord l’entrepreneur.">Instruire</Button>
                <Button variant="secondary" onClick={() => ouvrir('relance')}>Relancer</Button>
                <Button variant="ghost" onClick={() => ouvrir('correction')}>Demander une correction</Button>
              </div>
            </div>
          </Card>

          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card className="flex min-h-0 flex-col p-5">
              <div className="flex items-center gap-4"><CircularProgress value={(c.faites / c.total) * 100} size={64} label={`${c.faites} pièces sur ${c.total}`}><span className="tabular text-base font-bold">{c.faites}/{c.total}</span></CircularProgress><div><h2 className="font-semibold tracking-tight">Complétude</h2><p className="text-sm text-muted">{c.bloquantes.length === 0 ? 'Toutes les pièces obligatoires sont là.' : `${c.bloquantes.length} pièce${c.bloquantes.length > 1 ? 's' : ''} obligatoire${c.bloquantes.length > 1 ? 's' : ''} manque${c.bloquantes.length > 1 ? 'nt' : ''}.`}</p></div></div>
              <ul className="mt-3 flex min-h-0 flex-col overflow-y-auto">
                {PIECES.map((p) => (
                  <li key={p.id}><button type="button" onClick={() => setApercu(p.id)} className="tr flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 rounded-sm px-2 text-left hover:bg-bg-soft"><span className="truncate text-sm font-medium">{p.nom}</span><StatusBadge status={etat[p.id].statut} /></button>
                    {etat[p.id].statut === 'a-corriger' && <p className="mx-2 mb-1 flex items-start gap-1.5 rounded-sm bg-warning-soft px-2.5 py-1.5 text-xs text-text"><MessageSquareQuote className="mt-0.5 size-3.5 shrink-0" aria-hidden />Message envoyé à l’entrepreneur : « {etat[p.id].message} »</p>}</li>
                ))}
              </ul>
            </Card>
            <Card className="flex min-h-0 flex-col p-5">
              <Tabs defaultValue="criteres" className="flex min-h-0 flex-1 flex-col">
                <TabsList label="Détail du dossier"><TabsTrigger value="criteres">Critères d’éligibilité</TabsTrigger><TabsTrigger value="journal">Journal</TabsTrigger></TabsList>
                <TabsContent value="criteres" className="min-h-0 flex-1 overflow-y-auto pt-3">
                  <div className="text-sm">
                    <div aria-hidden className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2 border-b border-border px-2 pb-2 text-muted">{['Critère', 'Réponse', 'Preuve', 'Statut'].map((h) => <span key={h}>{h}</span>)}</div>
                    <ul aria-label="Critères d’éligibilité">
                      {criteres.map((cr) => (
                        <li key={cr.id}>
                          <button type="button" onClick={() => setOuvert(ouvert === cr.id ? null : cr.id)} aria-expanded={ouvert === cr.id} className="tr grid w-full cursor-pointer grid-cols-[1.2fr_1fr_1fr_1fr] items-center gap-2 rounded-sm px-2 py-2 text-left hover:bg-bg-soft">
                            <span className="font-medium">{cr.label}<span className="sr-only">. Réponse : {cr.reponse}. Preuve : {cr.preuve?.nom ?? 'déclaré'}. Statut : {cr.statut}.</span></span>
                            <span aria-hidden className="tabular">{cr.reponse}</span><span aria-hidden className="truncate text-muted">{cr.preuve?.nom ?? 'Déclaré'}</span>
                            <span aria-hidden><Badge tone={cr.statut === 'À vérifier' ? 'warning' : cr.statut === 'Rempli' ? 'neutral' : 'success'}>{cr.statut}</Badge></span>
                          </button>
                          {ouvert === cr.id && <p className="mx-2 mb-1 rounded-sm bg-bg-soft px-3 py-2 text-muted">{cr.ok === false ? cr.raison : cr.preuve ? `Preuve attendue : ${cr.preuve.nom}.` : 'Déclaré par l’entrepreneur, aucune pièce ne le prouve.'}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="journal" className="min-h-0 flex-1 overflow-y-auto pt-4"><Timeline items={journal} /></TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)} title={dialog === 'correction' ? 'Demander une correction' : 'Relancer l’entrepreneur'} description="Message pré-rédigé, modifiable. Il part avec le lien vers la demande."
        footer={<><Button variant="ghost" onClick={() => setDialog(null)}>Annuler</Button><Button onClick={envoyer}>Envoyer</Button></>}>
        <Tabs defaultValue="modifier">
          <TabsList label="Message"><TabsTrigger value="modifier">Modifier</TabsTrigger><TabsTrigger value="apercu">Aperçu</TabsTrigger></TabsList>
          <TabsContent value="modifier" className="pt-3"><label htmlFor="msg" className="sr-only">Message</label><textarea id="msg" value={texte} onChange={(e) => setTexte(e.target.value)} rows={9} className="w-full rounded-sm border border-border-strong bg-surface p-3 text-sm leading-relaxed" /></TabsContent>
          <TabsContent value="apercu" className="pt-3"><div className="whitespace-pre-wrap rounded-md border border-border bg-bg-soft p-4 text-sm leading-relaxed">{texte}</div></TabsContent>
        </Tabs>
      </Dialog>
      <Drawer open={apercu !== null} onOpenChange={(o) => !o && setApercu(null)} title={apercu ? pieceById(apercu).nom : ''} description={apercu && etat[apercu].fichier ? etat[apercu].fichier!.nom : 'Aucun fichier déposé'}>
        {apercu && <div className="flex flex-col gap-4 p-5"><StatusBadge status={etat[apercu].statut} />{etat[apercu].verifie && <p className="text-sm text-muted">{etat[apercu].verifie}</p>}{etat[apercu].message && <p className="rounded-md bg-warning-soft p-3 text-sm">Message envoyé à l’entrepreneur : « {etat[apercu].message} »</p>}<DocumentExemple piece={pieceById(apercu)} /></div>}
      </Drawer>
    </ProShell>
  )
}

function FileDeTravail({ file, id, badge }: { file: { id: string; entreprise: string; financement: string; faites: number; total: number; statut: string; corrections: number }[]; id: string; badge: (s: string, n: number) => React.ReactNode }) {
  return (
    <nav aria-label="Dossiers à instruire" className="flex min-h-0 flex-col gap-2 overflow-y-auto">
      <div className="px-1"><h2 className="font-semibold tracking-tight">Dossiers à instruire</h2><p className="text-xs text-muted">Trié par complétude, du plus complet au moins complet.</p><p className="mt-1.5 flex gap-1.5"><Badge tone="outline">Vague 2</Badge></p></div>
      <ul className="flex flex-col gap-2">
        {file.map((d) => (
          <li key={d.id}><Link to={`/pro/dossiers/${d.id}`} aria-current={d.id === id ? 'page' : undefined} className={`tr block rounded-md border p-3 ${d.id === id ? 'border-text bg-surface shadow-sm' : 'border-border bg-surface hover:border-border-strong'}`}>
            <p className="truncate font-semibold tracking-tight">{d.entreprise}</p><p className="truncate text-xs text-muted">{d.financement}</p>
            <div className="mt-2 flex items-center gap-2"><Progress value={(d.faites / d.total) * 100} label={`${d.entreprise} : ${d.faites} pièces sur ${d.total}`} className="h-1.5 flex-1" /><span className="tabular text-xs text-muted">{d.faites}/{d.total}</span></div>
            <div className="mt-2">{badge(d.statut, d.corrections)}</div>
          </Link></li>
        ))}
      </ul>
    </nav>
  )
}
