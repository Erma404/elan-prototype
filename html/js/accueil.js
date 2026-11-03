// Hero : effet au scroll en JavaScript pur. Statique si prefers-reduced-motion.
import { $, annoncer } from './core.js'
import { logo } from './shell.js'
import { monterDemo } from './demo.js'

document.querySelector('[data-logo]').innerHTML = logo('wordmark', 'h-7')
document.querySelector('[data-logo-hero]').innerHTML = logo('wordmark', 'h-9')
monterDemo()
const reduit = matchMedia('(prefers-reduced-motion: reduce)')
const logoHero = $('#logo-hero')
const hero = $('#hero'), scene = $('#scene'), photo = $('#photo'), img = $('#photo-img'), voile = $('#voile'), texte = $('#texte'), carte = $('#carte'), barre = $('#barre')
const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t))
let visible = false

function appliquer() {
  if (reduit.matches) { hero.className = 'relative'; scene.className = 'relative h-svh min-h-[40rem] overflow-hidden'; for (const e of [photo, img, voile, texte, carte, logoHero]) e.removeAttribute('style'); logoHero.style.setProperty('--color-accent', '#C9A66B'); return }
  hero.className = 'relative h-[190svh]'; scene.className = 'sticky top-0 h-svh overflow-hidden'
  const max = hero.offsetHeight - innerHeight
  const p = max > 0 ? Math.min(1, Math.max(0, (scrollY - hero.offsetTop) / max)) : 0
  photo.style.transform = `scale(${lerp(1, 0.9, p)})`; photo.style.borderRadius = `${lerp(0, 36, p)}px`
  img.style.transform = `scale(${lerp(1.04, 1, p)})`
  voile.style.opacity = lerp(0.45, 0.15, p)
  const f = Math.min(1, p / 0.55)
  texte.style.transform = `translateY(${lerp(0, -80, p / 0.6)}px)`; texte.style.opacity = 1 - f
  carte.style.opacity = 1 - Math.min(1, Math.max(0, (p - 0.1) / 0.4)); carte.style.transform = `translateY(${lerp(0, -40, p / 0.6)}px)`
  // Le logo du hero s'efface quand la barre (avec son logo) prend le relais.
  logoHero.style.opacity = 1 - Math.min(1, Math.max(0, (p - 0.12) / 0.25)); logoHero.style.pointerEvents = p > 0.3 ? 'none' : ''; logoHero.tabIndex = p > 0.3 ? -1 : 0
  const v = p > 0.28
  if (v !== visible) { visible = v; barre.setAttribute('aria-hidden', String(!v)); barre.classList.toggle('opacity-0', !v); barre.classList.toggle('-translate-y-2', !v); barre.classList.toggle('pointer-events-none', !v); barre.querySelectorAll('a').forEach((a) => (a.tabIndex = v ? 0 : -1)) }
}
let raf
addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(appliquer) }, { passive: true })
addEventListener('resize', appliquer); reduit.addEventListener('change', appliquer)
appliquer()
void annoncer
