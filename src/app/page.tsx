'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState, ReactNode } from 'react'
import {
  ArrowRight,
  Calendar,
  Target,
  Brain,
  CreditCard,
  Users,
  TrendingUp,
  Layers,
  ChevronDown,
  CheckCircle2,
  Zap,
  BarChart2,
  Dumbbell,
  Trophy,
  HeartPulse,
  Menu,
  X,
} from 'lucide-react'

// ────────────────────────────────────────────────────────────
//  Sport icons — minimal SVG line art (monochrome)
// ────────────────────────────────────────────────────────────
const SportIcons: Record<string, ReactNode> = {
  Football: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a10 10 0 0 1 6.5 2.4L12 9 5.5 4.4A10 10 0 0 1 12 2z"/>
      <path d="M2 12h4l2-3 4 1 4-1 2 3h4"/>
      <path d="M12 22a10 10 0 0 1-6.5-2.4L12 15l6.5 4.6A10 10 0 0 1 12 22z"/>
    </svg>
  ),
  Basketball: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M4.9 4.9a14 14 0 0 1 14.2 14.2"/>
      <path d="M19.1 4.9A14 14 0 0 0 4.9 19.1"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
    </svg>
  ),
  Tennis: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M5 5a8 8 0 0 1 0 14"/>
      <path d="M19 5a8 8 0 0 0 0 14"/>
    </svg>
  ),
  Natation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>
      <path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>
      <path d="M14 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/>
      <path d="M16 6l-3 4H9l-2 3"/>
    </svg>
  ),
  Cyclisme: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="16" r="3.5"/>
      <circle cx="19" cy="16" r="3.5"/>
      <path d="M5 16l4-8h5l2 4"/>
      <path d="M13 8l1.5 4H19"/>
      <circle cx="16" cy="5" r="1.5"/>
    </svg>
  ),
  Boxe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="12" height="10" rx="4"/>
      <path d="M16 12h2a2 2 0 0 1 0 4h-2"/>
      <path d="M8 8V6a2 2 0 0 1 4 0v2"/>
      <line x1="7" y1="12" x2="13" y2="12"/>
    </svg>
  ),
  Haltérophilie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="18" y2="12"/>
      <rect x="2" y="9" width="2.5" height="6" rx="1"/>
      <rect x="3.5" y="10.5" width="2" height="3" rx="0.5"/>
      <rect x="19.5" y="9" width="2.5" height="6" rx="1"/>
      <rect x="18.5" y="10.5" width="2" height="3" rx="0.5"/>
      <circle cx="12" cy="7" r="2"/>
      <path d="M12 9v6"/>
    </svg>
  ),
  Athlétisme: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="4" r="1.5"/>
      <path d="M8 19l3-6 2 2 3-5"/>
      <path d="M10 13l-2 6"/>
      <path d="M16 11l3-3"/>
      <path d="M13 11l1-3-3-2-3 2"/>
    </svg>
  ),
  Gymnastique: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="1.5"/>
      <path d="M7 21l5-8 5 8"/>
      <path d="M12 13V9"/>
      <path d="M9 11l3-2 3 2"/>
      <line x1="5" y1="17" x2="9" y2="17"/>
      <line x1="15" y1="17" x2="19" y2="17"/>
    </svg>
  ),
  Rugby: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="7" ry="4.5" transform="rotate(45 12 12)"/>
      <line x1="7.5" y1="7.5" x2="16.5" y2="16.5"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="12" y1="9" x2="12" y2="15"/>
    </svg>
  ),
  Volleyball: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a10 10 0 0 1 5 13.5"/>
      <path d="M7 4.5A10 10 0 0 1 19.5 17"/>
      <path d="M2 12a10 10 0 0 0 12.5 9.5"/>
    </svg>
  ),
  CrossFit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="3" height="4" rx="1"/>
      <rect x="19" y="10" width="3" height="4" rx="1"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
      <rect x="7" y="8" width="2.5" height="8" rx="1"/>
      <rect x="14.5" y="8" width="2.5" height="8" rx="1"/>
    </svg>
  ),
}

// ────────────────────────────────────────────────────────────
//  Sports ticker
// ────────────────────────────────────────────────────────────
const sports = [
  'Football', 'Basketball', 'Tennis', 'Athlétisme',
  'Natation', 'Cyclisme', 'Rugby', 'Volleyball',
  'Boxe', 'Gymnastique', 'CrossFit', 'Triathlon',
  'Judo', 'Escalade', 'Aviron', 'Handball',
]

function SportsTicker() {
  return (
    <div
      className="relative overflow-hidden w-full py-1"
      style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
    >
      <div className="flex gap-8 animate-ticker whitespace-nowrap">
        {[...sports, ...sports].map((s, i) => (
          <span key={i} className="text-xs font-medium uppercase tracking-[0.18em] text-black/25 select-none font-ui">
            {s} <span className="text-black/12 mx-3">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
//  Animated counter
// ────────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      let start = 0
      const step = target / 60
      const timer = setInterval(() => {
        start += step
        if (start >= target) { setCount(target); clearInterval(timer) }
        else setCount(Math.floor(start))
      }, 16)
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  return <span ref={ref}>{count}{suffix}</span>
}

// ────────────────────────────────────────────────────────────
//  Logo
// ────────────────────────────────────────────────────────────
function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image src="/TRACKLY_LOGO.webp" alt="Trackly logo" width={size} height={size} className="object-contain" priority />
  )
}

// ────────────────────────────────────────────────────────────
//  Feature Card
// ────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, tag }: {
  icon: React.FC<React.SVGProps<SVGSVGElement>>; title: string; description: string; tag?: string
}) {
  return (
    <div className="group relative flex flex-col gap-5 rounded-2xl border border-black/6 bg-white p-7 transition-all duration-300 hover:border-black/12 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5">
      {tag && (
        <span className="font-ui absolute top-5 right-5 text-[10px] font-semibold uppercase tracking-widest text-blue-600/70 border border-blue-200 rounded-full px-2.5 py-0.5 bg-blue-50">
          {tag}
        </span>
      )}
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/4 border border-black/6 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors duration-300">
        <Icon className="h-5 w-5 text-black/40 group-hover:text-blue-600 transition-colors duration-300" />
      </div>
      <div>
        {/* Titre en Satoshi medium */}
        <h3 className="font-ui text-[14px] font-semibold text-black mb-2 tracking-tight">{title}</h3>
        {/* Description en Satoshi regular */}
        <p className="font-ui text-[13px] leading-relaxed text-black/45">{description}</p>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
//  Main Page
// ────────────────────────────────────────────────────────────
export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navScrolled = scrollY > 40

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">

      {/* ── Nav — Satoshi ──────────────────────────────────────── */}
      <header
        className={`fixed top-0 z-50 w-full px-5 transition-all duration-500 ${
          navScrolled
            ? 'py-3 bg-white/90 backdrop-blur-xl border-b border-black/6 shadow-[0_1px_12px_rgba(0,0,0,0.04)]'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1120px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={34} />
            <span className="font-ui text-[15px] font-semibold tracking-tight text-black">Trackly</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Fonctionnalités', href: '#features' },
              { label: 'Sports', href: '#sports' },
              { label: 'Comment ça marche', href: '#how' },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                className="font-ui px-4 py-2 text-[13px] font-medium text-black/50 hover:text-black rounded-full hover:bg-black/4 transition-all duration-150">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="font-ui text-[13px] font-medium text-black/50 hover:text-black transition-colors px-4 py-2 rounded-full hover:bg-black/4">
              Connexion
            </Link>
            <Link href="/register" className="font-ui inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-semibold hover:bg-black/85 transition-all duration-150">
              Commencer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-black/4 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-black/6 bg-white/95 backdrop-blur-xl px-5 py-4 flex flex-col gap-2">
            {['Fonctionnalités', 'Sports', 'Comment ça marche'].map((item) => (
              <a key={item} href="#"
                className="font-ui px-4 py-3 text-[14px] font-medium text-black/60 hover:text-black rounded-xl hover:bg-black/4"
                onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            ))}
            <div className="border-t border-black/6 pt-4 mt-2 flex flex-col gap-2">
              <Link href="/login" className="font-ui px-4 py-3 text-[14px] font-medium text-black/60 text-center rounded-xl border border-black/10">Connexion</Link>
              <Link href="/register" className="font-ui px-4 py-3 text-[14px] font-semibold text-white text-center rounded-xl bg-black">Commencer gratuitement</Link>
            </div>
          </div>
        )}
      </header>

      <main>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pt-28 pb-20 text-center">

          {/* 1 — Image de fond (tout en bas) */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <Image
              src="/BG-HERO-ALL-SPORTS.webp"
              alt=""
              fill
              className="imghero object-contain object-center opacity-[0.12]"
              priority
            />
          </div>

          {/* 2 — Dot grid par-dessus l'image */}
          <div className="pointer-events-none absolute inset-0 z-[1] opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle, #b0b0b0 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          
          {/* 4 — Glow bleu subtil */}
          <div className="pointer-events-none absolute top-1/3 left-1/2 z-[3] -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-blue-100/40 blur-[100px]" />

          {/* H1 — Apple Garamond */}
          <h1 className="font-display relative max-w-[860px] text-[58px] leading-[1.08] md:text-[80px] lg:text-[96px]">
            Une plateforme.{' '}
            <br className="hidden md:block" />
            Tous vos athlètes.
          </h1>

          {/* Subline — Satoshi light */}
          <p className="font-ui relative mt-7 max-w-[500px] text-[17px] leading-[1.65] text-black font-light">
            Trackly centralise la gestion des athlètes, le suivi des performances et l'administration — pour arrêter de jongler entre 10 applications différentes.
          </p>

          {/* CTAs — Satoshi */}
          <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register"
              className="font-ui inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-[14px] font-semibold text-white hover:bg-black/85 transition-all duration-150 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
              Commencer gratuitement <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login"
              className="font-ui inline-flex items-center gap-2 rounded-full border border-black/12 px-7 py-3.5 text-[14px] font-medium text-black/55 hover:text-black hover:border-black/25 transition-all duration-150">
              Se connecter
            </Link>
          </div>

          {/* Logo hero */}
          <div className="relative mt-16">
            <Image src="/TRACKLY_LOGO.webp" alt="Trackly" width={64} height={64} className="object-contain opacity-85 mx-auto" />
          </div>

          {/* Sports ticker */}
          <div className="relative mt-14 w-full max-w-[900px]">
            <p className="font-ui mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/25">Compatible avec tous les sports</p>
            <SportsTicker />
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-black/20">
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </div>
        </section>

        {/* ── Stats — Garamond numbers, Satoshi labels ────────────── */}
        <section className="py-16 px-5 border-y border-black/6 bg-black/[0.015]">
          <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-px md:grid-cols-4 bg-black/6 rounded-2xl overflow-hidden">
            {[
              { value: 40, suffix: '+', label: 'Sports supportés' },
              { value: 12, suffix: 'k+', label: 'Athlètes suivis' },
              { value: 98, suffix: '%', label: 'Coaches satisfaits' },
              { value: 3, suffix: 'x', label: 'Plus rapide que les tableurs' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-1.5 bg-white py-10 px-6 text-center">
                {/* Number: Apple Garamond */}
                <span className="font-display text-[44px] leading-none text-black">
                  <Counter target={value} suffix={suffix} />
                </span>
                {/* Label: Satoshi */}
                <span className="font-ui text-[12px] text-black/35 font-medium mt-1">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Problem ────────────────────────────────────────────── */}
        <section className="py-28 px-5">
          <div className="mx-auto max-w-[1120px]">
            <div className="mb-16 max-w-[560px]">
              <p className="font-ui mb-4 text-[11px] font-semibold uppercase tracking-widest text-blue-600">Le problème</p>
              {/* Garamond */}
              <h2 className="font-display text-[42px] leading-[1.1] md:text-[54px]">
                Le coaching est fragmenté.<br />
                <span className="font-display-italic text-black/25">Ça ne devrait pas l'être.</span>
              </h2>
              <p className="font-ui mt-5 text-[16px] leading-[1.7] text-black/40">
                La plupart des coachs perdent des heures chaque semaine à basculer d'une app à l'autre — WhatsApp pour communiquer, Google Sheets pour tracker, une autre pour la facturation, une autre pour la planification. Trackly met fin au chaos.
              </p>
            </div>

            <div className="grid gap-px md:grid-cols-3 bg-black/6 rounded-2xl overflow-hidden">
              {[
                { pain: 'Données éparpillées sur 10 applications', fix: 'Tout centralisé dans un seul tableau de bord', icon: Layers },
                { pain: 'Templates rigides inadaptés à votre sport', fix: 'Métriques entièrement personnalisables par discipline', icon: Target },
                { pain: 'Aucune visibilité sur la progression des athlètes', fix: 'Suivi des performances en temps réel & analytics', icon: TrendingUp },
              ].map(({ pain, fix, icon: Icon }) => (
                <div key={pain} className="flex flex-col gap-6 bg-white p-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/4 border border-black/6">
                    <Icon className="h-4.5 w-4.5 text-black/40" />
                  </div>
                  <div>
                    <p className="font-ui text-[13px] text-black/30 line-through mb-3">{pain}</p>
                    <p className="font-ui text-[14px] font-medium text-black flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />{fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Grid ───────────────────────────────────────── */}
        <section id="features" className="py-28 px-5 bg-black/[0.015]">
          <div className="mx-auto max-w-[1120px]">
            <div className="mb-16 text-center">
              <p className="font-ui mb-4 text-[11px] font-semibold uppercase tracking-widest text-blue-600">Fonctionnalités</p>
              <h2 className="font-display text-[42px] leading-[1.1] md:text-[54px]">
                Conçu pour les coachs,<br />
                <span className="font-display-italic text-black/25">pas pour les managers génériques.</span>
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard icon={HeartPulse} title="Suivi des performances" description="Enregistrez les séances, suivez des métriques personnalisées (HRV, RPE, charge, vitesse…) et visualisez la progression avec des graphiques adaptés." tag="Essentiel" />
              <FeatureCard icon={Users} title="CRM athlète" description="Profils complets avec historique, objectifs, notes de santé, journaux de blessures et documents. Toujours à jour." />
              <FeatureCard icon={Brain} title="Métriques personnalisables" description="Définissez exactement ce que vous suivez — saut vertical, temps de passage, force maximale — aucun template rigide." />
              <FeatureCard icon={Dumbbell} title="Programmes d'entraînement" description="Créez et assignez des programmes complets. Les athlètes enregistrent les résultats en temps réel." />
              <FeatureCard icon={Calendar} title="Planning & rendez-vous" description="Gérez séances, entraînements collectifs et calendriers athlètes en une seule vue. Fini les doublons." tag="Business" />
              <FeatureCard icon={CreditCard} title="Facturation & paiements" description="Envoyez des factures, suivez les paiements et gérez les abonnements directement dans Trackly." />
              <FeatureCard icon={BarChart2} title="Analytics de progression" description="Graphiques et tendances pour repérer les plateaux, les pics et les opportunités d'amélioration." />
              <FeatureCard icon={Zap} title="Multi-sport natif" description="Du football à la gymnastique, de la natation au CrossFit — Trackly s'adapte à votre sport." tag="Universel" />
              <FeatureCard icon={Trophy} title="Objectifs & jalons" description="Définissez des records personnels et des objectifs de saison. Suivez la progression automatiquement." />
            </div>
          </div>
        </section>

        {/* ── All Sports ─────────────────────────────────────────── */}
        <section id="sports" className="py-28 px-5">
          <div className="mx-auto max-w-[1120px]">
            <div className="grid md:grid-cols-2 gap-20 items-center">
              <div>
                <p className="font-ui mb-4 text-[11px] font-semibold uppercase tracking-widest text-blue-600">Universel</p>
                <h2 className="font-display text-[42px] leading-[1.1] md:text-[54px] mb-6">
                  Un seul outil pour<br />
                  <span className="font-display-italic text-black/25">tous vos sports.</span>
                </h2>
                <p className="font-ui text-[16px] leading-[1.7] text-black/40 mb-8">
                  Que vous entraîniez des athlètes professionnels ou des amateurs du weekend, sur un sport ou dix, Trackly vous donne la même plateforme puissante — personnalisée pour ce qui compte dans votre discipline.
                </p>
                <div className="flex flex-col gap-3">
                  {['Définissez vos propres métriques de performance', 'Templates adaptés par sport', 'Gestion multi-athlètes et équipes', 'Comparaison de progression entre athlètes'].map((item) => (
                    <div key={item} className="font-ui flex items-center gap-3 text-[14px] text-black/60">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />{item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sport grid — SVG icons */}
              <div className="grid grid-cols-3 gap-2.5">
                {Object.entries(SportIcons).map(([name, icon]) => (
                  <div key={name}
                    className="group flex flex-col items-center gap-3 rounded-xl border border-black/6 bg-white p-5 text-center hover:border-black/15 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-default">
                    {/* SVG icon */}
                    <div className="h-7 w-7 text-black/50 group-hover:text-black transition-colors duration-200">
                      {icon}
                    </div>
                    {/* Name — Satoshi */}
                    <span className="font-ui text-[11px] font-medium text-black/40 group-hover:text-black/60 transition-colors">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stop App Fatigue ────────────────────────────────────── */}
        <section className="py-28 px-5 bg-black/[0.015]">
          <div className="mx-auto max-w-[1120px]">
            <div className="mb-16 text-center">
              <p className="font-ui mb-4 text-[11px] font-semibold uppercase tracking-widest text-blue-600">Tout-en-un</p>
              <h2 className="font-display text-[42px] leading-[1.1] md:text-[54px]">Fini la fatigue des apps.</h2>
              <p className="font-ui mt-4 max-w-[460px] mx-auto text-[16px] text-black/35">
                Remplacez votre stack d'outils déconnectés par un seul espace de travail cohérent.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-black/6 bg-white p-8">
                <p className="font-ui text-[11px] font-semibold uppercase tracking-widest text-black/25 mb-6">Sans Trackly</p>
                <div className="flex flex-col gap-4">
                  {['WhatsApp pour communiquer avec les athlètes', 'Google Sheets pour les données de performance', 'Calendly pour la planification', 'Stripe manuellement pour les paiements', "Dropbox pour les vidéos d'entraînement", 'Notes pour les journaux de séance'].map((item) => (
                    <div key={item} className="font-ui flex items-center gap-3 text-[14px] text-black/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-black/15 flex-shrink-0" />{item}
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 rounded-xl bg-black/3 border border-black/6">
                  <p className="font-ui text-[12px] text-black/30 text-center">6 apps. 6 abonnements. Changements de contexte constants.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-8">
                <p className="font-ui text-[11px] font-semibold uppercase tracking-widest text-blue-600/70 mb-6">Avec Trackly</p>
                <div className="flex flex-col gap-4">
                  {['Profils athlètes & hub de communication', 'Métriques custom & suivi en temps réel', 'Calendrier & rendez-vous intégrés', 'Facturation & invoicing intégrés', 'Bibliothèque multimédia pour le contenu', 'Journal automatique de séances & progression'].map((item) => (
                    <div key={item} className="font-ui flex items-center gap-3 text-[14px] text-black/65">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />{item}
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 rounded-xl bg-blue-100/60 border border-blue-200">
                  <p className="font-ui text-[12px] text-blue-700 text-center font-semibold">Un seul espace de travail. Zéro friction.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────── */}
        <section id="how" className="py-28 px-5">
          <div className="mx-auto max-w-[1120px]">
            <div className="mb-16 text-center">
              <p className="font-ui mb-4 text-[11px] font-semibold uppercase tracking-widest text-blue-600">Comment ça marche</p>
              <h2 className="font-display text-[42px] leading-[1.1] md:text-[54px]">
                Opérationnel<br />
                <span className="font-display-italic text-black/25">en quelques minutes.</span>
              </h2>
            </div>
            <div className="flex flex-col gap-0">
              {[
                { step: '01', title: 'Créez votre espace de travail', description: "Inscrivez-vous, choisissez votre sport (ou vos sports), et définissez les métriques qui comptent pour vous. Moins de 5 minutes.", icon: Zap },
                { step: '02', title: 'Ajoutez vos athlètes', description: "Importez ou invitez vos athlètes. Configurez leurs profils avec objectifs, données de santé et historique d'entraînement.", icon: Users },
                { step: '03', title: 'Assignez programmes & séances', description: "Créez des plans d'entraînement, planifiez des séances et envoyez-les directement aux athlètes.", icon: Dumbbell },
                { step: '04', title: 'Suivez la progression en temps réel', description: "Les athlètes enregistrent leurs séances, vous voyez les données instantanément. Graphiques, tendances et alertes.", icon: TrendingUp },
              ].map(({ step, title, description, icon: Icon }, i, arr) => (
                <div key={step} className={`flex gap-8 items-start py-10 ${i < arr.length - 1 ? 'border-b border-black/6' : ''}`}>
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-ui text-[10px] font-bold text-black/20 tracking-widest">{step}</span>
                  </div>
                  <div className="pt-1 max-w-[600px]">
                    {/* Step title — Apple Garamond */}
                    <h3 className="font-display text-[22px] text-black mb-2">{title}</h3>
                    {/* Step desc — Satoshi */}
                    <p className="font-ui text-[14px] leading-[1.7] text-black/40">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="py-28 px-5">
          <div className="mx-auto max-w-[1120px]">
            <div className="relative overflow-hidden rounded-3xl border border-black/6 bg-black p-12 md:p-20 text-center">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[400px] w-[600px] rounded-full bg-blue-600/15 blur-[100px]" />
              </div>
              <div className="relative flex justify-center mb-8">
                <Image src="/TRACKLY_LOGO.webp" alt="Trackly" width={52} height={52} className="object-contain opacity-90" />
              </div>
              <div className="relative">
                <p className="font-ui mb-4 text-[11px] font-semibold uppercase tracking-widest text-blue-400">Commencez aujourd'hui</p>
                {/* CTA headline — Apple Garamond */}
                <h2 className="font-display text-[42px] leading-[1.1] md:text-[60px] mb-6 text-white">
                  Prêt à coacher<br />
                  <span className="font-display-italic text-white/30">sans le chaos ?</span>
                </h2>
                <p className="font-ui mb-10 text-[16px] text-white/40 max-w-[420px] mx-auto font-light">
                  Rejoignez des coachs de tous les sports qui gèrent leurs athlètes en un seul endroit.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/register"
                    className="font-ui inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[14px] font-semibold text-black hover:bg-white/90 transition-all duration-150 shadow-[0_4px_32px_rgba(255,255,255,0.15)]">
                    Commencer gratuitement <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/login"
                    className="font-ui inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-[14px] font-medium text-white/50 hover:text-white hover:border-white/30 transition-all duration-150">
                    Déjà un compte
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-black/6 px-5 py-16 bg-white">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-12">
            <div className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="font-ui text-[14px] font-semibold text-black">Trackly</span>
            </div>
            <nav className="flex flex-wrap gap-6">
              {['Fonctionnalités', 'Tarifs', 'À propos', 'Contact', 'Confidentialité', 'CGU'].map((item) => (
                <a key={item} href="#" className="font-ui text-[13px] text-black/35 hover:text-black/70 transition-colors">{item}</a>
              ))}
            </nav>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8 border-t border-black/6">
            <p className="font-ui text-[12px] text-black/25">© 2026 Trackly. Fait pour les coachs partout dans le monde.</p>
            <p className="font-display-italic text-[13px] text-black/20">Tous les sports. Une seule plateforme.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-ticker { animation: ticker 35s linear infinite; }
      `}</style>
    </div>
  )
}
