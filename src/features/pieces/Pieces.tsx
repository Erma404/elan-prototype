import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, WifiOff } from 'lucide-react'
import { AppShell } from '../shell/AppShell'
import { Banner, Button, Dialog, useToast } from '../../components/ui'
import { PIECES, compter, complete } from '../../domain/pieces'
import { financements } from '../../domain/eligibility'
import { useDemande, useMontant } from '../../app/store'
import { eur } from '../../lib/format'
import { usePieces } from '../../app/pieces-store'
import { PieceDetail } from './PieceDetail'
import { PieceList } from './PieceList'
import { Laterale } from './Laterale'
import { Assistant } from '../ia/Assistant'
import { useDepot } from './useDepot'
import { track } from '../../lib/events'
import { useAnnonce } from '../../lib/annonce'
import { usePageTitle } from '../../lib/usePageTitle'

export default function Pieces() {
  usePageTitle('Vos pièces')
  const go = useNavigate()
  const toast = useToast()
  const { etat, hors_ligne, session_expiree, erreur, objet, savedAt, envoyeLe, set } = usePieces()
  const financementId = useDemande((s) => s.financementId) ?? 'pret-equipement-artisans'
  const f = financements.find((x) => x.id === financementId)!
  const montant = useMontant()
  const deposer = useDepot()
  const msg = useAnnonce((s) => s.msg)
  const iaActive = erreur !== 'ia'
  const c = compter(etat)
  const [selection, setSelection] = useState<string>(() => (PIECES.find((x) => !complete(etat[x.id].statut)) ?? PIECES[0]).id)
  const [aide, setAide] = useState(false)
  const [aidePiece, setAidePiece] = useState<string | null>(null)
  const [reco, setReco] = useState(false)
  const piece = PIECES.find((p) => p.id === selection)!
  const rang = PIECES.findIndex((p) => p.id === selection)
  // Prochaine pièce à traiter : la suivante non terminée dans l'ordre de la liste, en repartant du début si besoin.
  const restantes = PIECES.filter((p) => !complete(etat[p.id].statut) && p.id !== selection)
  // On vise d'abord les pièces obligatoires (après celle-ci, puis avant), ensuite les recommandées.
  const ordre = (liste: typeof restantes) => [...liste.filter((p) => PIECES.indexOf(p) > rang), ...liste.filter((p) => PIECES.indexOf(p) < rang)]
  const apres = [...ordre(restantes.filter((p) => p.obligatoire)), ...ordre(restantes.filter((p) => !p.obligatoire))][0]
  const prete = c.bloquantes.length === 0
  const suivante = apres
    ? { label: 'Pièce suivante', action: () => setSelection(apres.id), primaire: complete(etat[selection].statut) }
    : prete ? { label: 'Passer à l’envoi', action: () => go('/demande/recapitulatif'), primaire: true }
    : { label: 'Pièce suivante', action: () => setSelection(PIECES[(rang + 1) % PIECES.length].id), primaire: false }
  const consigne = prete
    ? 'Toutes les pièces obligatoires sont prêtes. Vous pouvez envoyer votre demande.'
    : `Déposez les pièces obligatoires : il en reste ${c.bloquantes.length}. Quand elles sont prêtes, l’envoi se débloque.`

  useEffect(() => { track('pieces_ecran_vu') }, [])

  // Connexion perdue : reprise automatique au retour (sauvegarde locale)
  useEffect(() => {
    const off = () => set({ hors_ligne: true }); const on = () => set({ hors_ligne: false })
    window.addEventListener('offline', off); window.addEventListener('online', on)
    return () => { window.removeEventListener('offline', off); window.removeEventListener('online', on) }
  }, [set])
  useEffect(() => {
    if (hors_ligne) return
    const attente = PIECES.filter((p) => etat[p.id].statut === 'envoi' && etat[p.id].progress === 0 && etat[p.id].fichier)
    if (attente.length === 0) return
    toast({ title: 'Connexion rétablie', description: 'Vos pièces en attente partent maintenant.' })
    attente.forEach((p) => deposer(p.id, etat[p.id].fichier!.nom, etat[p.id].fichier!.taille))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hors_ligne])

  const ouvrirAide = (id: string | null) => { setAidePiece(id); setAide(true) }

  return (
    <AppShell step={1} wide fit>
      <div className="flex h-full min-h-0 flex-col gap-4">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <div>
            <h1 className="text-[clamp(1.5rem,2.4vw,2.125rem)] font-bold leading-tight tracking-tighter">{f.nom}<span className="font-normal text-muted">, {objet.toLowerCase()}{montant !== undefined && <>, <span className="tabular">{eur(montant)}</span></>}</span></h1>
            <p className="mt-1 text-[0.9375rem] text-muted" aria-live="polite">{consigne}</p>
          </div>
          <p className="tabular pb-1 text-sm text-subtle" role="status">{hors_ligne ? 'Enregistré sur cet appareil' : `Enregistré à ${savedAt}`}</p>
        </header>

        {envoyeLe && <Banner tone="info" title="Votre demande est envoyée" action={<Button size="sm" variant="secondary" onClick={() => go('/demande/envoyee')}>Voir le suivi</Button>}>Vous pouvez encore remplacer, retirer ou ajouter une pièce. Votre chargé d’affaires est prévenu de chaque changement.</Banner>}
        {hors_ligne && <Banner tone="warning" title="Connexion perdue">Vous pouvez continuer : tout est gardé sur cet appareil et partira au retour du réseau.</Banner>}
        {erreur === 'reseau' && <Banner tone="danger" title="Réseau instable (démonstration)">Les prochains dépôts échoueront, avec la possibilité de réessayer.</Banner>}

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[19.5rem_minmax(0,1fr)_21rem]">
          <PieceList etat={etat} selection={selection} onSelect={setSelection} />
          <PieceDetail key={selection} piece={piece} state={etat[piece.id]} premiere={c.faites === 0 && piece.id === PIECES[0].id} onAide={ouvrirAide} iaActive={iaActive} rang={rang + 1} total={PIECES.length} suivante={suivante} />
          <Laterale onAller={setSelection} onEnvoyer={() => go('/demande/recapitulatif')} onSuivi={() => go('/demande/envoyee')} />
        </div>
      </div>

      {iaActive && (
        <button type="button" onClick={() => ouvrirAide(null)} className="bg-ai tr fixed bottom-3 right-3 z-[var(--z-sticky)] inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full px-5 text-sm font-semibold text-[var(--color-ai-text)] shadow-lg hover:scale-[1.02] active:scale-[0.98]"><MessageCircle className="size-4" aria-hidden />Assistant Élan</button>
      )}
      <Assistant open={aide} onOpenChange={setAide} pieceId={aidePiece} />
      <div aria-live="polite" className="sr-only">{msg}</div>

      <Dialog open={session_expiree} onOpenChange={() => {}} title="Votre session a expiré" description="Par sécurité, reconnectez-vous. Rien n’est perdu : vous reprendrez là où vous en étiez."
        footer={<Button loading={reco} onClick={() => { setReco(true); setTimeout(() => { setReco(false); set({ session_expiree: false }); toast({ title: 'Reconnectée', description: 'Vous reprenez là où vous en étiez.' }) }, 900) }}>Me reconnecter</Button>}>
        <p className="flex items-center gap-2 text-sm text-muted"><WifiOff className="size-4" aria-hidden />Vos pièces et vos réponses sont gardées.</p>
      </Dialog>
    </AppShell>
  )
}
