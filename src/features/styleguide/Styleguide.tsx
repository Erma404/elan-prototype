import { useState } from 'react'
import type { ReactNode } from 'react'
import { Flame, Moon, Sun, Truck } from 'lucide-react'
import {
  Accordion, AccordionItem, AiMessage, Avatar, Badge, Banner, Button, Card, ChoiceCard, Chip, CircularProgress, Dialog, Drawer, Dropzone, EmptyState,
  Field, FileRow, Input, LogoLockup, LogoMark, LogoMarkAnimated, Progress, Select, Skeleton, Slider, Stepper, StatusBadge, Table, Tabs, TabsContent,
  TabsList, TabsTrigger, Timeline, Tooltip, useToast,
} from '../../components/ui'
import type { PieceStatus } from '../../components/ui'
import { useTheme } from '../../lib/theme'
import { eur } from '../../lib/format'

const statuses: PieceStatus[] = ['a-fournir', 'envoi', 'recue', 'a-corriger', 'verifiee', 'non-applicable', 'attente-experte']

const spans: Record<string, string> = { marque: 'lg:col-span-2', boutons: 'lg:col-span-4', choix: 'lg:col-span-3', statuts: 'lg:col-span-3' }
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className={`scroll-mt-24 rounded-card bg-bg-soft p-6 sm:p-10 ${spans[id] ?? 'lg:col-span-6'}`}>
      <h2 id={`${id}-t`} className="mb-8 text-3xl font-semibold tracking-tighter">{title}</h2>
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  )
}
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <p className="mb-3 text-sm font-medium text-muted">{label}</p>
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
)

export default function Styleguide() {
  const { choice, setChoice } = useTheme()
  const toast = useToast()
  const [choiceVal, setChoiceVal] = useState('equipement')
  const [sel, setSel] = useState<string>()
  const [montant, setMontant] = useState(80000)
  const [dialog, setDialog] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [aiDrawer, setAiDrawer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pct, setPct] = useState(66)

  return (
    <div className="min-h-dvh bg-bg">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>
      <header className="sticky top-0 z-[var(--z-header)] border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4"><LogoLockup className="h-7" /><span className="hidden text-sm text-muted sm:inline">Système de design</span></div>
          <div role="group" aria-label="Thème" className="flex gap-1 rounded-sm bg-bg-soft p-1">
            {([['light', 'Clair', <Sun key="s" className="size-4" />], ['dark', 'Sombre', <Moon key="m" className="size-4" />], ['system', 'Auto', null]] as const).map(([v, l, ic]) => (
              <button key={v} type="button" aria-pressed={choice === v} onClick={() => setChoice(v)} className="tr inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-sm px-3 text-sm font-medium text-muted aria-pressed:bg-surface aria-pressed:text-text aria-pressed:shadow-sm">{ic}{l}</button>
            ))}
          </div>
        </div>
      </header>

      <main id="contenu" className="mx-auto max-w-[88rem] px-4 pb-24 pt-6 sm:px-6">
        <div className="mb-6 flex min-h-[26rem] flex-col justify-end rounded-xl bg-text p-8 text-bg sm:p-14">
          <p className="mb-6 text-lg opacity-70">Système de design Élan</p>
          <h1 className="max-w-4xl text-[clamp(2.5rem,6vw,4.25rem)] font-bold leading-[1.08] tracking-tighter">Des composants qui ne connaissent que des jetons.</h1>
          <p className="mt-6 max-w-2xl text-xl opacity-80">Chaque composant est présenté dans tous ses états. Changez le thème en haut à droite : rien n’est écrit en dur.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button variant="inverse" size="lg" onClick={() => document.getElementById('boutons')?.scrollIntoView({ behavior: 'smooth' })}>Voir les composants</Button></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-6">

        <Section id="marque" title="Marque">
          <Row label="Symbole, lockup, symbole animé"><LogoMark className="h-16" /><LogoLockup className="h-16" /><LogoMarkAnimated className="h-16" /></Row>
        </Section>

        <Section id="boutons" title="Boutons">
          <Row label="Variantes"><Button>Envoyer ma demande</Button><Button variant="secondary">Remplacer</Button><Button variant="ghost">Annuler</Button><Button variant="destructive">Retirer l’accès</Button></Row>
          <Row label="Tailles"><Button size="sm">Petit</Button><Button size="md">Moyen</Button><Button size="lg">Grand</Button></Row>
          <Row label="États : chargement, désactivé avec sa raison">
            <Button loading>Envoi en cours</Button>
            <Button disabled disabledReason="Il manque 2 pièces obligatoires : le Kbis et le bilan.">Envoyer ma demande</Button>
            <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1600) }} variant="secondary">Simuler un envoi</Button>
          </Row>
        </Section>

        <Section id="champs" title="Champs">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Adresse e-mail de l’experte-comptable" hint="Elle recevra un lien limité aux pièces." required>{(p) => <Input {...p} type="email" autoComplete="email" placeholder="prenom@cabinet.fr" />}</Field>
            <Field label="Adresse e-mail" error="Cette adresse n’est pas valide. Vérifiez le « @ » et le nom de domaine." required>{(p) => <Input {...p} defaultValue="claire.cabinet" invalid />}</Field>
            <Field label="Secteur d’activité">{(p) => <Select id={p.id} value={sel} onValueChange={setSel} placeholder="Choisir un secteur" options={[{ value: 'artisanat', label: 'Artisanat' }, { value: 'commerce', label: 'Commerce' }, { value: 'services', label: 'Services' }]} />}</Field>
            <Field label="Désactivé">{(p) => <Input {...p} disabled value="Non modifiable" readOnly />}</Field>
          </div>
          <div className="max-w-xl">
            <p className="mb-1 flex items-baseline justify-between text-sm font-medium"><span>Montant recherché</span><output className="tabular text-2xl font-semibold tracking-tight">{eur(montant)}</output></p>
            <Slider value={montant} onValueChange={setMontant} min={5000} max={250000} step={5000} label="Montant recherché" format={eur} />
            <div className="mt-2 flex flex-wrap gap-2">{[20000, 50000, 80000, 150000].map((v) => <Chip key={v} selected={montant === v} onClick={() => setMontant(v)}>{eur(v)}</Chip>)}</div>
          </div>
        </Section>

        <Section id="choix" title="Cartes à choisir et pastilles">
          <div role="radiogroup" aria-label="Projet" className="grid max-w-2xl gap-3">
            <ChoiceCard selected={choiceVal === 'equipement'} onSelect={() => setChoiceVal('equipement')} title="Acheter un équipement" description="Machine, four, véhicule, outillage" shortcut="1" icon={<Flame className="size-5" />} />
            <ChoiceCard selected={choiceVal === 'export'} onSelect={() => setChoiceVal('export')} title="Exporter" description="Prospecter ou livrer à l’étranger" shortcut="2" icon={<Truck className="size-5" />} />
          </div>
          <Row label="Pastilles"><Chip>Artisanat</Chip><Chip selected onClick={() => {}}>Sélectionnée</Chip><Badge tone="accent">Obligatoire</Badge><Badge>Recommandée</Badge><Badge tone="warning">À corriger</Badge><Badge tone="outline">Vague 2</Badge></Row>
        </Section>

        <Section id="statuts" title="Statuts de pièce">
          <Row label="Sept états, toujours une icône et un texte">{statuses.map((s) => <StatusBadge key={s} status={s} />)}</Row>
        </Section>

        <Section id="depot" title="Dépôt de fichiers">
          <div className="grid gap-6 md:grid-cols-2">
            <Dropzone label="le Kbis" onFile={(f) => toast({ title: 'Fichier reçu', description: f.name })} />
            <div className="flex flex-col gap-3">
              <FileRow name="Kbis-atelier-argile-et-feu.pdf" size={412_000} status="envoi" progress={62} />
              <FileRow name="Bilan-2024.pdf" size={2_300_000} status="a-corriger" message="La page 2 est manquante" actions={<Button size="sm" variant="secondary">Remplacer</Button>} />
              <FileRow name="RIB-fabienne.pdf" size={96_000} status="verifiee" message="Document lisible, 1 page" />
            </div>
          </div>
        </Section>

        <Section id="retours" title="Progression, bandeaux, chargement">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-5"><CircularProgress value={pct} label="Complétude de la demande"><span className="text-base">6/9</span></CircularProgress><div><p className="text-lg font-semibold">6 pièces sur 9</p><p className="text-sm text-muted">Il vous en reste 3.</p></div></div>
              <Progress value={pct} label="Complétude" />
              <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setPct((v) => Math.max(0, v - 11))}>Moins</Button><Button size="sm" variant="secondary" onClick={() => setPct((v) => Math.min(100, v + 11))}>Plus</Button></div>
              <Stepper steps={['Éligibilité', 'Pièces', 'Envoi']} current={1} />
            </div>
            <div className="flex flex-col gap-3">
              <Banner tone="info" title="Enregistré à 14:32">Votre demande est sauvegardée automatiquement.</Banner>
              <Banner tone="warning" title="Connexion perdue">Vos modifications sont gardées sur cet appareil et partiront au retour du réseau.</Banner>
              <Banner tone="danger" title="Envoi impossible" action={<Button size="sm" variant="secondary">Réessayer</Button>}>Le fichier n’a pas pu être transmis.</Banner>
              <Banner tone="success" title="Demande envoyée" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
          <EmptyState icon={<Flame />} title="Aucun financement ne correspond pour l’instant" action={<Button variant="secondary">Parler à un conseiller</Button>}>Voici ce qui permettrait de devenir éligible, et d’autres dispositifs à explorer.</EmptyState>
        </Section>

        <Section id="donnees" title="Cartes, accordéon, onglets, tableau, chronologie">
          <div className="grid gap-6 md:grid-cols-2">
            <Card><div className="flex items-center gap-3"><Avatar name="Fabienne Martin" /><div><p className="font-semibold">Atelier Argile &amp; Feu</p><p className="text-sm text-muted">Prêt Équipement Artisans</p></div></div><p className="tabular mt-4 text-3xl font-semibold tracking-tight">{eur(80000)}</p></Card>
            <Accordion type="single" collapsible defaultValue="a" className="flex flex-col gap-3">
              <AccordionItem value="a" header={<span className="font-semibold">Kbis de moins de 3 mois</span>}><p className="text-muted">Nous vérifions que l’entreprise existe et que son dirigeant est bien celui de la demande.</p></AccordionItem>
              <AccordionItem value="b" header={<span className="font-semibold">Pièce d’identité du dirigeant</span>}><p className="text-muted">Recto et verso, lisibles, en cours de validité.</p></AccordionItem>
            </Accordion>
          </div>
          <Tabs defaultValue="pieces">
            <TabsList label="Sections de la fiche"><TabsTrigger value="pieces">Pièces</TabsTrigger><TabsTrigger value="criteres">Critères</TabsTrigger><TabsTrigger value="journal">Journal</TabsTrigger></TabsList>
            <TabsContent value="pieces" className="pt-4 text-muted">7 pièces vérifiées, 2 à corriger.</TabsContent>
            <TabsContent value="criteres" className="pt-4">
              <Table caption="Critères d’éligibilité" head={['Critère', 'Réponse', 'Statut']}>
                <tr><td className="px-4 py-3">Ancienneté</td><td className="tabular px-4 py-3">4 ans</td><td className="px-4 py-3"><StatusBadge status="verifiee" label="Vérifié par pièce" /></td></tr>
                <tr><td className="px-4 py-3">Effectif</td><td className="tabular px-4 py-3">3 salariés</td><td className="px-4 py-3"><StatusBadge status="a-corriger" label="À vérifier" /></td></tr>
              </Table>
            </TabsContent>
            <TabsContent value="journal" className="pt-4">
              <Timeline items={[{ title: 'Demande envoyée', time: '2 nov., 14:40', state: 'done' }, { title: 'Instruction par un chargé d’affaires', detail: 'Réponse sous 10 jours ouvrés', state: 'current' }, { title: 'Réponse', state: 'todo' }]} />
            </TabsContent>
          </Tabs>
        </Section>

        <Section id="surcouches" title="Dialogue, drawer, tooltip, toast, message IA">
          <Row label="Surcouches">
            <Button variant="secondary" onClick={() => setDialog(true)}>Ouvrir un dialogue</Button>
            <Button variant="secondary" onClick={() => setDrawer(true)}>Ouvrir un drawer</Button>
            <Button variant="secondary" onClick={() => setAiDrawer(true)}>Ouvrir l’assistant</Button>
            <Button variant="secondary" onClick={() => toast({ title: 'Enregistré à 14:32', description: 'Votre demande est sauvegardée.' })}>Afficher un toast</Button>
            <Tooltip content="Il manque 2 pièces obligatoires."><span tabIndex={0} className="rounded-sm border border-dashed border-border-strong px-3 py-2 text-sm">Survolez ou focalisez-moi</span></Tooltip>
          </Row>
          <div className="max-w-xl"><AiMessage text="Le Kbis s’obtient gratuitement sur infogreffe.fr ou auprès de votre expert-comptable. Il doit dater de moins de 3 mois." source="Référentiel Élan, v1" /></div>
        </Section>
        </div>
      </main>

      <Dialog open={dialog} onOpenChange={setDialog} title="Inviter mon experte-comptable" description="Elle ne verra que la liste des pièces, jamais le montant." footer={<><Button variant="ghost" onClick={() => setDialog(false)}>Annuler</Button><Button onClick={() => setDialog(false)}>Envoyer l’invitation</Button></>}>
        <Field label="Adresse e-mail" required>{(p) => <Input {...p} type="email" placeholder="prenom@cabinet.fr" />}</Field>
      </Dialog>
      <Drawer open={drawer} onOpenChange={setDrawer} title="Aperçu du document" description="Kbis-atelier.pdf"><div className="p-5 text-muted">Aperçu du document fictif.</div></Drawer>
      <Drawer open={aiDrawer} onOpenChange={setAiDrawer} variant="ai" title="Assistant Élan" description="L’IA prépare, vous validez."><div className="flex flex-col gap-3 p-5"><AiMessage text="Posez votre question sur une pièce. Je cite toujours ma source." source="Référentiel Élan, v1" /></div></Drawer>
    </div>
  )
}
