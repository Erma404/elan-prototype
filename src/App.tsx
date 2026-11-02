import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { TooltipProvider, ToastProvider, LogoLockup } from './components/ui'
import { applyTheme } from './lib/theme'
import { DemoPanel } from './features/demo/DemoPanel'

const Styleguide = lazy(() => import('./features/styleguide/Styleguide'))
const Landing = lazy(() => import('./features/landing/Landing'))
const Eligibilite = lazy(() => import('./features/eligibilite/Eligibilite'))
const Pieces = lazy(() => import('./features/pieces/Pieces'))
const Recap = lazy(() => import('./features/recap/Recap'))
const Envoyee = lazy(() => import('./features/recap/Envoyee'))
const Expert = lazy(() => import('./features/expert/Expert'))
const ProDossier = lazy(() => import('./features/pro/ProDossier'))

function Soon() {
  return (
    <main id="contenu" className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-5 px-6">
      <LogoLockup className="h-9 self-start" />
      <h1 className="text-4xl font-bold tracking-tighter">Cet écran arrive dans la prochaine étape du prototype.</h1>
      <Link to="/" className="self-start font-semibold underline underline-offset-4">Retour à l’accueil</Link>
    </main>
  )
}

/** À chaque changement de route : retour en haut et focus sur le titre de la page. */
function ScrollManager() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
    const t = window.setTimeout(() => {
      const h1 = document.querySelector<HTMLElement>('main h1, h1')
      if (h1) { if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }) }
    }, 60)
    return () => window.clearTimeout(t)
  }, [pathname])
  return null
}

export default function App() {
  useEffect(() => { applyTheme() }, [])
  return (
    <BrowserRouter>
      <ScrollManager />
      <TooltipProvider>
        <ToastProvider>
          <DemoPanel />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/eligibilite" element={<Eligibilite />} />
              <Route path="/demande/pieces" element={<Pieces />} />
              <Route path="/demande/recapitulatif" element={<Recap />} />
              <Route path="/demande/envoyee" element={<Envoyee />} />
              <Route path="/expert/:token" element={<Expert />} />
              <Route path="/pro/dossiers" element={<Navigate to="/pro/dossiers/argile" replace />} />
              <Route path="/pro/dossiers/:id" element={<ProDossier />} />
              <Route path="*" element={<Soon />} />
              <Route path="/styleguide" element={<Styleguide />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </TooltipProvider>
    </BrowserRouter>
  )
}
