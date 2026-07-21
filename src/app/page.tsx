'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  X,
  Star,
  UserPlus,
  TrendingUp,
  LayoutDashboard,
  Dumbbell,
  Activity,
  Calendar,
  FileText,
  CreditCard,
  ArrowRight,
  MonitorSmartphone,
  Zap,
  Lock,
  ChevronDown,
  Minus
} from 'lucide-react'
import { useState } from 'react'

function Logo({ size = 42 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <Image src="/TRACKLY_LOGO.webp" alt="Trackly logo" width={size} height={size} className="object-contain" priority />
    </div>
  )
}

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center text-left focus:outline-none"
      >
        <h4 className="font-medium tracking-tight text-lg text-foreground">{question}</h4>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 mt-4' : 'max-h-0'}`}>
        <p className="text-muted-foreground">{answer}</p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="force-light min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-primary transition-colors duration-300">
      
      {/* ────────────────────────────────────────────────────────────
          NAVBAR
      ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 h-20 border-b border-border/50 bg-background/80 backdrop-blur-xl z-50 transition-colors duration-300">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={42} />
            <span className="font-sans text-xl font-medium tracking-tight text-foreground">Trackly</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Tarifs</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium px-3 sm:px-4">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full px-4 sm:px-6 text-sm sm:text-base font-medium tracking-tight shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                Démarrer
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ────────────────────────────────────────────────────────────
          HERO SECTION
      ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
        
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light tracking-tighter text-foreground leading-[1.1]">
              Le CRM qui <span className="font-serif italic font-light text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">simplifie</span> votre coaching.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Centralisez vos athlètes, planifiez leurs entraînements, suivez leurs performances, gérez vos rendez-vous et vos paiements depuis une seule plateforme.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg font-medium tracking-tight shadow-xl shadow-primary/20 hover:scale-105 transition-all w-full sm:w-auto">
                  Commencer gratuitement
                </Button>
              </Link>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex text-yellow-500">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-sm font-medium text-muted-foreground">Déjà utilisé par des coachs indépendants.</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
<div className="relative h-64 sm:h-80 md:h-[30vw]">
  <Image
    src="/web-app.png"
    alt="Trackly logo"
    fill
    className="object-contain rounded-2xl md:rounded-[2rem]"
    priority
  />
</div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          PROBLEM SECTION
      ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30 border-y border-border px-6">
        <div className="mx-auto max-w-4xl text-center space-y-12">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-foreground">
            Votre coaching <span className="font-serif italic font-light text-primary">mérite mieux</span> qu'Excel, WhatsApp et Google Calendar.
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="glass-panel p-8 rounded-3xl border border-border">
              <h3 className="text-xl font-medium tracking-tight mb-6 text-foreground">Aujourd'hui, vous jonglez entre :</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-destructive" /> WhatsApp pour communiquer</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-destructive" /> Google Sheets pour les suivis</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-destructive" /> Google Calendar pour les RDVs</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-destructive" /> Des notes pour les bilans</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-destructive" /> Des PDF dispersés</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-destructive" /> Des factures à la main</li>
              </ul>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-border bg-destructive/5">
              <h3 className="text-xl font-medium tracking-tight mb-6 text-destructive flex items-center gap-2">Résultat :</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <span className="text-destructive font-medium tracking-tight">1</span>
                  </div>
                  <div>
                    <strong className="text-foreground block">Perte de temps</strong>
                    <span className="text-sm text-muted-foreground">Des heures perdues en recopie et vérifications.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <span className="text-destructive font-medium tracking-tight">2</span>
                  </div>
                  <div>
                    <strong className="text-foreground block">Oublis fréquents</strong>
                    <span className="text-sm text-muted-foreground">Informations éparpillées et suivis manqués.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <span className="text-destructive font-medium tracking-tight">3</span>
                  </div>
                  <div>
                    <strong className="text-foreground block">Expérience fragmentée</strong>
                    <span className="text-sm text-muted-foreground">Une image moins professionnelle pour vos athlètes.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SOLUTION SECTION
      ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="mx-auto max-w-4xl text-center space-y-12 relative z-10">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-foreground">
            Tout votre coaching <span className="font-serif italic font-light text-primary">réuni dans une seule plateforme.</span>
          </h2>
          
          <div className="bg-card border border-border rounded-[2rem] p-8 md:p-16 shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="bg-primary text-primary-foreground font-light tracking-tighter text-xl px-8 py-3 rounded-full shadow-lg shadow-primary/30">
                TRACKLY
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mt-8">
              {[
                { icon: UserPlus, label: "Clients" },
                { icon: Dumbbell, label: "Planning" },
                { icon: Activity, label: "Performances" },
                { icon: CreditCard, label: "Paiements" },
                { icon: Calendar, label: "Rendez-vous" },
                { icon: FileText, label: "Bilans" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-2xl border border-border/50 hover:bg-muted transition-colors">
                  <item.icon className="w-8 h-8 text-primary mb-3" />
                  <span className="font-medium tracking-tight text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-xl font-medium text-foreground">Une seule connexion. Un seul tableau de bord.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          FEATURES SECTION
      ──────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-muted/30 px-6">
        <div className="mx-auto max-w-7xl space-y-32">
          
          {/* CRM */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-foreground">Centralisez <span className="font-serif italic font-light text-primary">tous vos clients.</span></h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Retrouvez chaque athlète, ses informations personnelles, ses antécédents médicaux, son historique et ses performances en quelques secondes, sur une interface épurée.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-[4/3] w-full max-w-md mx-auto">
                <div className="w-full h-full bg-background rounded-2xl flex flex-col overflow-hidden text-left shadow-2xl border border-border/60">
                  <div className="h-10 border-b border-border/60 bg-muted/30 flex items-center px-4">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400/80"/><div className="w-3 h-3 rounded-full bg-yellow-400/80"/><div className="w-3 h-3 rounded-full bg-green-400/80"/></div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <div className="font-semibold text-foreground text-sm">Athlètes (3)</div>
                      <div className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">Ajouter</div>
                    </div>
                    {[
                      { name: "Thomas Dupont", status: "Actif", obj: "Prise de masse" },
                      { name: "Sarah Connor", status: "En attente", obj: "Perte de poids" },
                      { name: "Marc Lewin", status: "Actif", obj: "Préparation Marathon" }
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40 transition-colors hover:bg-muted/40">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">{c.name[0]}</div>
                          <div>
                            <div className="text-sm font-medium text-foreground leading-tight">{c.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{c.obj}</div>
                          </div>
                        </div>
                        <div className={`text-[10px] font-medium px-2 py-1 rounded-full ${c.status === 'Actif' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-600'}`}>{c.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Planification */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-foreground">Planifiez les entraînements <span className="font-serif italic font-light text-blue-500">en quelques clics.</span></h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Construisez une bibliothèque de séances personnalisées puis assignez-les automatiquement à chaque client selon ses jours de repos et ses disponibilités.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-[4/3] w-full max-w-md mx-auto">
                <div className="w-full h-full bg-background rounded-2xl flex flex-col overflow-hidden text-left shadow-2xl border border-border/60">
                  <div className="h-10 border-b border-border/60 bg-muted/30 flex items-center px-4">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400/80"/><div className="w-3 h-3 rounded-full bg-yellow-400/80"/><div className="w-3 h-3 rounded-full bg-green-400/80"/></div>
                  </div>
                  <div className="p-4 flex gap-3 h-full">
                    {["Lundi", "Mardi", "Mercredi"].map((day, i) => (
                      <div key={i} className="flex-1 bg-muted/20 rounded-xl p-3 border border-border/40 flex flex-col gap-3">
                        <div className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">{day}</div>
                        {i === 0 && (
                          <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-lg text-xs text-blue-600 font-medium shadow-sm">
                            Haut du corps
                            <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1"><Dumbbell className="w-3 h-3"/> 4 exos</div>
                          </div>
                        )}
                        {i === 2 && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-xs text-emerald-600 font-medium shadow-sm">
                            Cardio HIIT
                            <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1"><Activity className="w-3 h-3"/> 30 min</div>
                          </div>
                        )}
                        {i === 1 && (
                          <div className="border border-dashed border-border/60 rounded-lg p-2.5 text-center text-muted-foreground/50 text-[10px] font-medium">
                            + Repos
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performances */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                <Activity className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-foreground">Visualisez les progrès <span className="font-serif italic font-light text-emerald-500">instantanément.</span></h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Poids, sommeil, RPE, fréquence cardiaque... Créez vos propres métriques. Chaque donnée saisie par vos athlètes génère des graphiques interactifs de suivi.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-[4/3] w-full max-w-md mx-auto">
                <div className="w-full h-full bg-background rounded-2xl flex flex-col overflow-hidden text-left shadow-2xl border border-border/60">
                  <div className="h-10 border-b border-border/60 bg-muted/30 flex items-center px-4">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400/80"/><div className="w-3 h-3 rounded-full bg-yellow-400/80"/><div className="w-3 h-3 rounded-full bg-green-400/80"/></div>
                  </div>
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Évolution Poids</div>
                        <div className="text-[10px] text-muted-foreground">30 derniers jours</div>
                      </div>
                      <div className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> -2.4 kg
                      </div>
                    </div>
                    <div className="flex-1 flex items-end gap-1.5 mt-2">
                      {[40, 35, 45, 30, 50, 60, 45, 55, 70, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-emerald-500/10 rounded-t-md relative group hover:bg-emerald-500/20 transition-colors" style={{ height: `${h}%` }}>
                          <div className="absolute top-0 inset-x-0 bg-emerald-500 rounded-t-md" style={{ height: '4px' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendrier */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-500">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-foreground">Ne perdez plus de temps <span className="font-serif italic font-light text-purple-500">à trouver un créneau.</span></h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Renseignez vos disponibilités. Vos athlètes réservent directement. Vos plannings se croisent de manière asynchrone, sans échange interminable de messages.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-[4/3] w-full max-w-md mx-auto">
                <div className="w-full h-full bg-background rounded-2xl flex flex-col overflow-hidden text-left shadow-2xl border border-border/60">
                  <div className="h-10 border-b border-border/60 bg-muted/30 flex items-center px-4">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400/80"/><div className="w-3 h-3 rounded-full bg-yellow-400/80"/><div className="w-3 h-3 rounded-full bg-green-400/80"/></div>
                  </div>
                  <div className="p-4 grid grid-cols-5 gap-1.5 h-full">
                    {Array.from({length: 15}).map((_, i) => (
                      <div key={i} className="bg-muted/10 border border-border/40 rounded-xl aspect-square flex items-center justify-center relative hover:bg-muted/30 transition-colors">
                        <span className="text-[10px] font-medium text-muted-foreground/50 absolute top-1.5 left-2">{i+1}</span>
                        <div className="w-full px-1.5 space-y-1 mt-2">
                          {i === 4 && <div className="w-full h-2.5 bg-purple-500/20 border border-purple-500/30 rounded-sm" />}
                          {i === 7 && <div className="w-full h-2.5 bg-blue-500/20 border border-blue-500/30 rounded-sm" />}
                          {i === 12 && <div className="w-full h-2.5 bg-primary/20 border border-primary/30 rounded-sm" />}
                          {i === 12 && <div className="w-full h-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-sm" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bilans */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-foreground">Rédigez des comptes rendus <span className="font-serif italic font-light text-orange-500">professionnels.</span></h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Chaque rendez-vous génère un historique de bilan consultable par le coach et l'athlète pour garder une trace de chaque évolution.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-[4/3] w-full max-w-md mx-auto">
                <div className="w-full h-full bg-background rounded-2xl flex flex-col overflow-hidden text-left shadow-2xl border border-border/60">
                  <div className="h-10 border-b border-border/60 bg-muted/30 flex items-center px-4">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400/80"/><div className="w-3 h-3 rounded-full bg-yellow-400/80"/><div className="w-3 h-3 rounded-full bg-green-400/80"/></div>
                  </div>
                  <div className="p-5 flex flex-col justify-center h-full gap-4">
                    <div className="bg-muted/20 p-4 rounded-xl border border-border/50 shadow-sm relative">
                      <div className="absolute top-4 right-4 text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">PDF</div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-orange-500" />
                        <div className="text-sm font-semibold text-foreground">Bilan Mensuel - T. Dupont</div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-muted rounded-full w-full" />
                        <div className="h-2 bg-muted rounded-full w-5/6" />
                        <div className="h-2 bg-muted rounded-full w-4/6" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">Envoyé automatiquement à l'athlète</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Paiements */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-foreground">Suivez vos <span className="font-serif italic font-light text-rose-500">paiements.</span></h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Visualisez rapidement les paiements en attente, payés ou en retard. Ne laissez plus aucune facture impayée passer inaperçue.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-[4/3] w-full max-w-md mx-auto">
                <div className="w-full h-full bg-background rounded-2xl flex flex-col overflow-hidden text-left shadow-2xl border border-border/60">
                  <div className="h-10 border-b border-border/60 bg-muted/30 flex items-center px-4">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400/80"/><div className="w-3 h-3 rounded-full bg-yellow-400/80"/><div className="w-3 h-3 rounded-full bg-green-400/80"/></div>
                  </div>
                  <div className="p-5 flex flex-col justify-center h-full gap-3">
                    {[
                      { amount: "150,00 €", status: "Payé", date: "01 Juin", color: "text-green-600", bg: "bg-green-500/10", border: "border-green-500/20" },
                      { amount: "150,00 €", status: "En attente", date: "01 Juil", color: "text-yellow-600", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                    ].map((p, i) => (
                      <div key={i} className="flex justify-between items-center p-3.5 rounded-xl border border-border/50 bg-card shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${p.bg} ${p.border} ${p.color}`}>
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">{p.amount}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">Facture {p.date}</div>
                          </div>
                        </div>
                        <div className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${p.bg} ${p.color}`}>{p.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          DOUBLE ESPACE SECTION
      ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="mx-auto max-w-6xl text-center space-y-16">
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-foreground">
            Une expérience complète pour le <span className="font-serif italic font-light text-primary">coach</span> ET pour l'<span className="font-serif italic font-light text-blue-500">athlète</span>.
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            {/* Espace Coach */}
            <div className="glass-panel p-10 rounded-[2.5rem] border border-border shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
              <h3 className="text-2xl font-light tracking-tighter text-foreground border-b border-border pb-6 mb-6">Espace Coach</h3>
              <ul className="space-y-5">
                {[
                  "CRM Complet & Dossiers athlètes",
                  "Planificateur de séances",
                  "Création de templates d'entraînements",
                  "Graphiques de performances",
                  "Gestion des disponibilités et rendez-vous",
                  "Suivi de la facturation et paiements",
                  "Rédaction de bilans post-appels"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span className="text-lg text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Espace Athlète */}
            <div className="glass-panel p-10 rounded-[2.5rem] border border-border shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors" />
              <h3 className="text-2xl font-light tracking-tighter text-foreground border-b border-border pb-6 mb-6">Espace Athlète</h3>
              <ul className="space-y-5">
                {[
                  "Dashboard et programme de la semaine",
                  "Saisie quotidienne/hebdomadaire des métriques",
                  "Partage asynchrone des disponibilités",
                  "Réservation autonome de rendez-vous",
                  "Exportation des séances en PDF",
                  "Historique des bilans rédigés par le coach",
                  "Suivi de l'état de ses paiements"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                    <span className="text-lg text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          HOW IT WORKS
      ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30 px-6">
        <div className="mx-auto max-w-6xl text-center space-y-16">
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-foreground">Comment ça <span className="font-serif italic font-light text-primary">fonctionne</span></h2>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/10 via-primary to-primary/10 -z-10" />

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-background border border-primary flex items-center justify-center shadow-xl shadow-primary/20">
                <span className="text-3xl font-light tracking-tighter text-primary">1</span>
              </div>
              <h3 className="text-xl font-medium tracking-tight text-foreground">Ajoutez votre client</h3>
              <p className="text-muted-foreground">Une simple invitation par email suffit pour qu'il rejoigne son espace personnel.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-background border border-primary flex items-center justify-center shadow-xl shadow-primary/20">
                <span className="text-3xl font-light tracking-tighter text-primary">2</span>
              </div>
              <h3 className="text-xl font-medium tracking-tight text-foreground">Construisez son programme</h3>
              <p className="text-muted-foreground">Assignez des séances, définissez les métriques à suivre et planifiez la semaine.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-background border border-primary flex items-center justify-center shadow-xl shadow-primary/20">
                <span className="text-3xl font-light tracking-tighter text-primary">3</span>
              </div>
              <h3 className="text-xl font-medium tracking-tight text-foreground">Suivez sa progression</h3>
              <p className="text-muted-foreground">Analysez ses graphiques, validez ses entraînements et rédigez vos bilans post-appels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          WHY CHOOSE TRACKLY
      ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl space-y-16">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-foreground text-center">Pourquoi choisir Trackly ?</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Gagnez plusieurs heures par semaine", desc: "Automatisation des tâches répétitives et centralisation totale de vos processus.", icon: Zap },
              { title: "Fidélisez vos clients", desc: "Offrez-leur une expérience premium via un portail athlète dédié et professionnel.", icon: Star },
              { title: "Suivez chaque progression", desc: "Des visualisations claires et interactives pour ne jamais naviguer à l'aveugle.", icon: TrendingUp },
              { title: "Accessible partout", desc: "Responsive design parfait pour ordinateur, tablette et mobile.", icon: MonitorSmartphone },
              { title: "Interface moderne", desc: "Design épuré et Dark Mode inclus pour un confort visuel optimal.", icon: LayoutDashboard },
              { title: "Pensé pour les coachs", desc: "Ce n'est pas un CRM générique, chaque outil répond à un besoin métier précis.", icon: Dumbbell }
            ].map((feature, i) => (
              <div key={i} className="bg-card p-8 rounded-3xl border border-border hover:border-primary/50 transition-colors shadow-sm hover:shadow-lg">
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-medium tracking-tight text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          COMPARISON
      ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30 px-6">
        <div className="mx-auto max-w-4xl space-y-12">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-foreground text-center">Comparaison</h2>
          
          <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-6 font-medium tracking-tight text-foreground w-1/3">Fonctionnalité</th>
                    <th className="p-6 font-medium tracking-tight text-muted-foreground w-1/5 text-center">Excel</th>
                    <th className="p-6 font-medium tracking-tight text-muted-foreground w-1/5 text-center">Notion</th>
                    <th className="p-6 font-light tracking-tighter text-primary w-1/5 text-center bg-primary/5">Trackly</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["CRM clients", "no", "partial", "yes"],
                    ["Programmes d'entraînement", "no", "partial", "yes"],
                    ["Suivi des Performances", "no", "no", "yes"],
                    ["Prise de Rendez-vous", "no", "partial", "yes"],
                    ["Suivi des Paiements", "no", "no", "yes"],
                    ["Rédaction des Bilans", "no", "partial", "yes"],
                    ["Espace Athlète Dédié", "no", "no", "yes"],
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-6 text-foreground font-medium">{row[0]}</td>
                      <td className="p-6 text-center">
                        {row[1] === "yes" ? <CheckCircle2 className="w-5 h-5 mx-auto text-primary" /> : row[1] === "partial" ? <Minus className="w-5 h-5 mx-auto text-yellow-500" /> : <X className="w-5 h-5 mx-auto text-muted-foreground/30" />}
                      </td>
                      <td className="p-6 text-center">
                        {row[2] === "yes" ? <CheckCircle2 className="w-5 h-5 mx-auto text-primary" /> : row[2] === "partial" ? <Minus className="w-5 h-5 mx-auto text-yellow-500" /> : <X className="w-5 h-5 mx-auto text-muted-foreground/30" />}
                      </td>
                      <td className="p-6 text-center bg-primary/5">
                        {row[3] === "yes" ? <CheckCircle2 className="w-5 h-5 mx-auto text-primary" /> : row[3] === "partial" ? <Minus className="w-5 h-5 mx-auto text-yellow-500" /> : <X className="w-5 h-5 mx-auto text-muted-foreground/30" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          TESTIMONIALS
      ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl space-y-16 text-center">
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-foreground text-center">Ce qu'en disent <span className="font-serif italic font-light text-primary">les coachs</span></h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl border border-border text-left">
              <div className="flex text-yellow-500 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <blockquote className="text-lg text-foreground italic mb-6">"Je gagne près de 5 heures par semaine sur la création de mes plannings et les relances."</blockquote>
              <div className="text-sm font-medium tracking-tight text-muted-foreground">— Coach Indépendant</div>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-border text-left">
              <div className="flex text-yellow-500 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <blockquote className="text-lg text-foreground italic mb-6">"Mes clients adorent avoir leur propre espace. Cela donne une image très pro à mon service."</blockquote>
              <div className="text-sm font-medium tracking-tight text-muted-foreground">— Coach Sportif en ligne</div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-border text-left">
              <div className="flex text-yellow-500 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <blockquote className="text-lg text-foreground italic mb-6">"J'ai enfin arrêté d'utiliser 6 applications différentes. Tout est au même endroit, c'est libérateur."</blockquote>
              <div className="text-sm font-medium tracking-tight text-muted-foreground">— Préparateur Physique</div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          FAQ
      ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-muted/30 px-6">
        <div className="mx-auto max-w-3xl space-y-12">
          <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-foreground text-center">Questions fréquentes</h2>
          
          <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-sm">
            <AccordionItem 
              question="Mes clients doivent-ils installer une application ?" 
              answer="Non, tout fonctionne directement dans leur navigateur. Ils peuvent même ajouter le site à leur écran d'accueil sur téléphone pour une expérience similaire à une application native." 
            />
            <AccordionItem 
              question="Puis-je gérer plusieurs dizaines de clients ?" 
              answer="Oui, la plateforme est spécialement conçue pour évoluer avec votre activité, que vous ayez 5 ou 100 athlètes." 
            />
            <AccordionItem 
              question="Mes données sont-elles sécurisées ?" 
              answer="Absolument. Toutes les données sont protégées, chiffrées et sécurisées via notre infrastructure moderne." 
            />
            <AccordionItem 
              question="Puis-je exporter mes séances ?" 
              answer="Oui, vos clients peuvent télécharger l'ensemble de leurs séances au format PDF pour les consulter hors-ligne à la salle de sport." 
            />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          FINAL CTA
      ──────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="mx-auto max-w-4xl text-center space-y-10">
          <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-foreground leading-tight">
            Passez plus de temps à <span className="font-serif italic font-light text-primary">coacher</span>, moins à <span className="font-serif italic font-light text-foreground">gérer.</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Rejoignez les coachs qui centralisent déjà toute leur activité avec Trackly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 rounded-full text-xl font-medium tracking-tight shadow-2xl shadow-primary/30 hover:scale-105 transition-all w-full sm:w-auto">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          FOOTER
      ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-12 bg-background">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={42} />
            <span className="font-sans text-lg font-medium tracking-tight text-foreground">Trackly</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm text-muted-foreground font-medium">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            <a href="#" className="hover:text-foreground transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-foreground transition-colors">Politique de confidentialité</a>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Trackly. Tous droits réservés.</p>
        </div>
      </footer>

    </div>
  )
}
