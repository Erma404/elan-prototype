import { usePageTitle } from '../../lib/usePageTitle'
import HeroScroll from './HeroScroll'

export default function Landing() {
  usePageTitle('Demande de financement guidée')
  return (
    <div className="bg-bg text-text">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-demo)] focus:rounded-sm focus:bg-text focus:px-4 focus:py-2 focus:text-bg">Aller au contenu</a>
      <main id="contenu">
        <HeroScroll />
      </main>
      <footer className="px-5 py-10 text-center sm:px-8">
        <p className="mono text-sm text-muted">Prototype, données fictives</p>
      </footer>
    </div>
  )
}
