import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useState } from 'react'
import { LogoLockup } from '../../components/ui'

/**
 * Hero plein cadre. Au scroll, il reste épinglé : la photo se resserre en carte arrondie,
 * le texte monte et s'estompe, la carte de témoignage glisse. Statique avec prefers-reduced-motion.
 */
export default function HeroScroll() {
  const ref = useRef<HTMLElement>(null)
  const go = useNavigate()
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  // Progression 0 à 1 sur la hauteur épinglée, mesurée à chaque événement de scroll (pas de cache à périmer).
  const scrollYProgress = useTransform(scrollY, (y) => {
    const el = ref.current
    if (!el) return 0
    const max = el.offsetHeight - window.innerHeight
    return max > 0 ? Math.min(1, Math.max(0, (y - el.offsetTop) / max)) : 0
  })
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollYProgress, 'change', (p) => setScrolled(p > 0.4))

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const radius = useTransform(scrollYProgress, [0, 1], [0, 36])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1])
  const textY = useTransform(scrollYProgress, [0, 0.6], [0, -80])
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const cardY = useTransform(scrollYProgress, [0, 0.6], [0, -40])
  const cardOpacity = useTransform(scrollYProgress, [0.1, 0.5], [1, 0])
  const shade = useTransform(scrollYProgress, [0, 1], [0.45, 0.15])
  const live = !reduce

  return (
    <section ref={ref} aria-labelledby="hero-titre" className={live ? 'relative h-[190svh]' : 'relative'}>
      {/* Barre d'en-tête : absente au repos comme chez LEDGE, elle apparaît une fois la photo resserrée */}
      <header aria-hidden={!scrolled} className={`fixed inset-x-0 top-0 z-[var(--z-header)] border-b border-border bg-bg/90 text-text backdrop-blur-sm transition-[opacity,transform] duration-[var(--duration-base)] ease-[var(--ease-out)] ${scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}>
        <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between px-5 sm:px-8">
          <Link to="/" tabIndex={scrolled ? 0 : -1} aria-label="Élan, accueil"><LogoLockup className="h-7" /></Link>
          <button type="button" tabIndex={scrolled ? 0 : -1} onClick={() => go('/eligibilite')} className="tr min-h-11 cursor-pointer rounded-full bg-primary px-6 text-sm font-medium text-primary-fg hover:bg-primary-hover">Commencer</button>
        </div>
      </header>

      <div className={live ? 'sticky top-0 h-svh overflow-hidden' : 'relative h-svh min-h-[40rem] overflow-hidden'}>
        <motion.div className="absolute inset-0 overflow-hidden bg-[#2b2620]" style={live ? { scale, borderRadius: radius } : undefined}>
          <motion.img src="/photos/hero.jpg" width={2400} height={1371} alt="Gros plan sur les mains d’un homme en veste, qui range un portefeuille dans sa poche intérieure" className="size-full object-cover object-center" style={live ? { scale: imgScale } : undefined} />
          <motion.div aria-hidden className="absolute inset-0 bg-black" style={live ? { opacity: shade } : { opacity: 0.45 }} />
        </motion.div>

        {/* Mention en haut à gauche : 14,5 px, largeur 230 px, à 32 px du bord */}
        <motion.p style={live ? { opacity: textOpacity } : undefined} className="absolute left-5 top-[12svh] hidden max-w-[14.5rem] text-[clamp(0.8125rem,1vw,0.9375rem)] font-light leading-[1.4] text-white sm:left-8 sm:block">
          Le financement des petites entreprises, instruit par de vrais chargés d’affaires.
        </motion.p>

        {/* Carte de témoignage : 320 px, coins carrés, fond translucide sans flou */}
        <motion.figure style={live ? { y: cardY, opacity: cardOpacity } : undefined} className="absolute right-5 top-[8.5svh] hidden w-[clamp(18rem,22.2vw,21rem)] items-center gap-[1.2rem] bg-white/25 p-5 text-white lg:flex sm:right-10">
          <img src="/photos/photo-1.jpg" width={87} height={60} alt="" className="h-[3.75rem] w-[5.4rem] shrink-0 object-cover object-[50%_18%]" />
          <div>
            <blockquote className="text-[clamp(0.8125rem,0.97vw,0.9375rem)] font-light leading-[1.35]">Je ne savais pas ce qu’on attendait de moi, ni si j’avais une chance.</blockquote>
            <figcaption className="mt-2 text-[clamp(0.8125rem,0.97vw,0.9375rem)] font-light">Fabienne M., céramiste</figcaption>
          </div>
        </motion.figure>

        {/* Bloc central : titre 66 px sur deux lignes, sous-titre 19 px, pilule 142 × 53, mention 14,5 px */}
        <motion.div style={live ? { y: textY, opacity: textOpacity } : undefined} className="absolute inset-x-0 bottom-[12svh] z-10 mx-auto flex max-w-[68rem] flex-col items-center px-6 text-center text-white">
          <h1 id="hero-titre" className="text-[clamp(2.125rem,4.3vw,3.875rem)] font-light leading-[1.16] tracking-[-0.025em]">Votre financement, sans deviner ce qu’on attend de vous.</h1>
          <p className="mt-[clamp(1.5rem,3.4svh,2.25rem)] max-w-[36rem] text-[clamp(1rem,1.32vw,1.1875rem)] font-light leading-[1.5] tracking-[0.005em] text-white">Cinq questions pour savoir si vous avez une chance, puis vos pièces expliquées une à une, jusqu’à une demande complète.</p>
          <button type="button" onClick={() => go('/eligibilite')} className="tr mt-[clamp(1.75rem,4.4svh,2.75rem)] h-[clamp(2.75rem,3.7vw,3.3125rem)] cursor-pointer rounded-full bg-[#f5f4f1] px-[clamp(1.75rem,2.8vw,2.5rem)] text-[clamp(0.9375rem,1.1vw,1rem)] font-normal text-[#1f1e1b] hover:bg-white active:scale-[0.98]">Commencer</button>
          <p className="mt-4 text-[clamp(0.75rem,0.95vw,0.875rem)] font-light text-white">1 minute&nbsp;• sans compte</p>
        </motion.div>
      </div>
    </section>
  )
}
