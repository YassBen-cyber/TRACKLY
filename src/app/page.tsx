import Link from 'next/link'
import { Dumbbell, ArrowRight, CheckCircle2, ChevronDown, Activity, Calendar, CreditCard, Users, Zap, Award } from 'lucide-react'
import { SmoothScroll } from '@/components/smooth-scroll'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D2A26] font-sans selection:bg-[#E87A5D]/20 selection:text-[#2D2A26]">
      <SmoothScroll />
      {/* Header */}
      <header className="relative z-30 w-full px-4 py-4 md:px-8 border-b border-[#2D2A26]/5 bg-[#FAF9F6]/80 backdrop-blur-md sticky top-0">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A5D] rounded-md">
            <div className="bg-[#FAF9F6] border border-[#2D2A26]/10 p-1.5 rounded-lg shadow-sm">
              <Dumbbell className="h-5 w-5 text-[#2D2A26]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#2D2A26]">TRACKLY</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#2D2A26]/60">
            <a href="#services" className="hover:text-[#E87A5D] transition-colors">Services</a>
            <a href="#comment-ca-marche" className="hover:text-[#E87A5D] transition-colors">Comment ça marche</a>
            <a href="#pour-qui" className="hover:text-[#E87A5D] transition-colors">Pour qui ?</a>
            <a href="#faq" className="hover:text-[#E87A5D] transition-colors">FAQ</a>
          </nav>
          
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[#2D2A26]/70 hover:text-[#2D2A26] hover:bg-[#2D2A26]/5 rounded-full transition-colors">
              Se connecter
            </Link>
            <Link href="/register" className="px-5 py-2 text-sm font-medium bg-[#2D2A26] text-[#FAF9F6] hover:bg-[#1A1816] rounded-full transition-colors flex items-center gap-2 shadow-md shadow-[#2D2A26]/10">
              Commencer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          {/* Muted background blobs */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#E87A5D]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#41B3A3]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
          
          <div className="mx-auto flex w-full max-w-[900px] flex-col items-center text-center gap-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#2D2A26]/10 text-xs font-semibold text-[#2D2A26]/60 uppercase tracking-wider mb-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#E87A5D] animate-pulse"></span>
              La nouvelle référence
            </div>
            
            <h1 className="font-serif font-light text-[44px] leading-[1.1] tracking-[-0.03em] text-[#2D2A26] md:text-[80px]">
              L'écosystème <span className="font-medium text-[#E87A5D]">sur-mesure</span> pour chaque athlète.
            </h1>
            
            <p className="text-lg leading-relaxed text-[#2D2A26]/70 max-w-[600px]">
              Oubliez les fichiers Excel et les messages éparpillés. Planifiez vos séances, suivez les progrès et gérez vos paiements au même endroit.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
              <Link href="/register" className="h-14 px-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#E87A5D] text-white font-medium text-base hover:bg-[#D96B4D] transition-transform active:scale-95 shadow-lg shadow-[#E87A5D]/20">
                Essayer gratuitement
              </Link>
              <Link href="/login" className="h-14 px-8 inline-flex items-center justify-center gap-2 rounded-full bg-white border border-[#2D2A26]/10 text-[#2D2A26] font-medium text-base hover:bg-[#F4F0EB] transition-colors shadow-sm">
                Espace Client
              </Link>
            </div>
          </div>

          {/* Abstract Visual / Dashboard Mockup */}
          <div className="mt-24 relative w-full max-w-[1000px] mx-auto z-20">
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent z-10 h-full w-full pointer-events-none"></div>
            <div className="rounded-3xl border border-[#2D2A26]/5 bg-white/50 backdrop-blur-sm shadow-2xl p-2 md:p-4 rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
              <div className="rounded-2xl border border-[#2D2A26]/5 bg-white aspect-[16/9] w-full flex flex-col overflow-hidden relative shadow-inner">
                {/* Mockup Header */}
                <div className="h-12 border-b border-[#2D2A26]/5 flex items-center px-4 gap-4 bg-[#FAF9F6]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#2D2A26]/20"></div>
                    <div className="w-3 h-3 rounded-full bg-[#2D2A26]/20"></div>
                    <div className="w-3 h-3 rounded-full bg-[#2D2A26]/20"></div>
                  </div>
                  <div className="w-48 h-4 rounded-full bg-[#2D2A26]/5 ml-auto"></div>
                </div>
                {/* Mockup Body */}
                <div className="flex-1 p-6 flex gap-6 bg-white">
                  {/* Sidebar */}
                  <div className="w-1/4 hidden md:flex flex-col gap-4">
                    <div className="w-full h-10 rounded-lg bg-[#E87A5D]/10"></div>
                    <div className="w-3/4 h-8 rounded-lg bg-[#2D2A26]/5"></div>
                    <div className="w-3/4 h-8 rounded-lg bg-[#2D2A26]/5"></div>
                  </div>
                  {/* Main Content */}
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="w-1/3 h-8 rounded-full bg-[#41B3A3]/10"></div>
                    <div className="flex gap-4">
                      <div className="w-1/2 h-32 rounded-2xl bg-[#2D2A26]/5"></div>
                      <div className="w-1/2 h-32 rounded-2xl bg-[#2D2A26]/5"></div>
                    </div>
                    <div className="w-full h-full rounded-2xl bg-[#2D2A26]/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logos / Social Proof */}
        <section className="py-12 border-y border-[#2D2A26]/5 bg-white">
          <div className="max-w-[1000px] mx-auto px-4 text-center">
            <p className="text-xs font-semibold text-[#2D2A26]/40 uppercase tracking-widest mb-8">Ils ont choisi la performance</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale">
              <div className="text-xl font-serif font-bold">CROSSFIT CLUB</div>
              <div className="text-xl font-bold tracking-tighter">ELITE ATHLETICS</div>
              <div className="text-xl font-bold italic">ProGym</div>
              <div className="text-xl font-serif font-bold">FITNESS HUB</div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 px-4 max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif font-light text-3xl md:text-5xl tracking-[-0.03em] text-[#2D2A26] mb-4">
              La clarté à chaque étape.
            </h2>
            <p className="text-[#2D2A26]/60 max-w-2xl mx-auto text-lg">
              Une suite d'outils pensée par et pour les coachs sportifs afin de vous faire gagner un temps précieux.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-[#2D2A26]/5 shadow-sm hover:shadow-md transition-all group">
              <div className="h-12 w-12 bg-[#41B3A3]/10 text-[#41B3A3] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#2D2A26] mb-3">Programmes & Suivi</h3>
              <p className="text-[#2D2A26]/60 leading-relaxed text-sm">
                Créez vos templates, assignez-les en un clic. Vos clients valident leurs séances avec leurs retours, et vous gardez un historique précis.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-[#2D2A26]/5 shadow-sm hover:shadow-md transition-all group">
              <div className="h-12 w-12 bg-[#E87A5D]/10 text-[#E87A5D] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#2D2A26] mb-3">Rendez-vous fluides</h3>
              <p className="text-[#2D2A26]/60 leading-relaxed text-sm">
                Vos athlètes indiquent leurs disponibilités, vous placez les séances aux bons créneaux. Fini les allers-retours interminables par message.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#2D2A26]/5 shadow-sm hover:shadow-md transition-all group">
              <div className="h-12 w-12 bg-[#2D2A26]/5 text-[#2D2A26] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#2D2A26] mb-3">Paiements centralisés</h3>
              <p className="text-[#2D2A26]/60 leading-relaxed text-sm">
                Générez des factures ou des demandes de paiement directement depuis l'application. Vous et vos athlètes savez toujours où vous en êtes.
              </p>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section id="comment-ca-marche" className="py-24 px-4 bg-[#2D2A26] text-white rounded-[2rem] mx-4 md:mx-8 mb-24 relative overflow-hidden">
          <div className="max-w-[1000px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-serif font-light text-3xl md:text-5xl tracking-[-0.03em] mb-4">
                Une méthode éprouvée
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                La méthode la plus rapide pour gérer votre activité.
              </p>
            </div>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold text-xl shrink-0 border border-white/10">1</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Vous invitez vos athlètes</h3>
                  <p className="text-white/60 text-lg">Créez leur profil en quelques secondes. Ils accèdent à leur espace dédié pour renseigner leurs disponibilités.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="w-16 h-16 rounded-2xl bg-[#E87A5D] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-[#E87A5D]/20">2</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Vous assignez le travail</h3>
                  <p className="text-white/60 text-lg">Piocher dans vos templates d'entraînement. Planifiez les séances et gérez la facturation en un seul clic.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="w-16 h-16 rounded-2xl bg-[#41B3A3] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-[#41B3A3]/20">3</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ils s'entraînent, vous validez</h3>
                  <p className="text-white/60 text-lg">L'athlète s'entraîne et valide sa séance avec des retours précis (RPE, sensations). Vous ajustez pour la prochaine fois.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pour Qui */}
        <section id="pour-qui" className="py-24 px-4 max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif font-light text-3xl md:text-5xl tracking-[-0.03em] text-[#2D2A26] mb-6">
                Pour ceux qui veulent <span className="font-medium text-[#41B3A3]">passer un cap</span>.
              </h2>
              <p className="text-lg text-[#2D2A26]/70 mb-8 leading-relaxed">
                TRACKLY n'est pas une simple application de fitness. C'est un véritable hub pensé exclusivement pour les professionnels du sport cherchant l'excellence.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[#2D2A26]/80 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-[#41B3A3]" /> Préparateurs physiques
                </li>
                <li className="flex items-center gap-3 text-[#2D2A26]/80 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-[#41B3A3]" /> Coachs sportifs indépendants
                </li>
                <li className="flex items-center gap-3 text-[#2D2A26]/80 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-[#41B3A3]" /> Kinésithérapeutes du sport
                </li>
                <li className="flex items-center gap-3 text-[#2D2A26]/80 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-[#41B3A3]" /> Entraîneurs personnels (Personal Trainers)
                </li>
              </ul>
            </div>
            
            <div className="relative">
              <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-[#2D2A26]/5 shadow-xl shadow-[#2D2A26]/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-16 w-16 bg-[#FAF9F6] rounded-2xl flex items-center justify-center border border-[#2D2A26]/5">
                    <Award className="h-8 w-8 text-[#E87A5D]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#2D2A26]">Professionnalisez votre image</h4>
                    <p className="text-[#2D2A26]/50 text-sm">Finis les PDF brouillons.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#2D2A26]/5 flex gap-4 items-center">
                    <Zap className="h-6 w-6 text-[#E87A5D] shrink-0" />
                    <p className="text-sm font-medium text-[#2D2A26]/70">Gain de temps : <strong className="text-[#2D2A26]">4 heures/semaine</strong></p>
                  </div>
                  <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#2D2A26]/5 flex gap-4 items-center">
                    <Users className="h-6 w-6 text-[#41B3A3] shrink-0" />
                    <p className="text-sm font-medium text-[#2D2A26]/70">Satisfaction athlète : <strong className="text-[#2D2A26]">Suivi 100% transparent</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 px-4 bg-white border-t border-[#2D2A26]/5">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif font-light text-3xl md:text-5xl tracking-[-0.03em] text-[#2D2A26] mb-4">
                Questions Fréquentes
              </h2>
            </div>
            
            <div className="space-y-4">
              <details className="group bg-[#FAF9F6] border border-[#2D2A26]/5 rounded-2xl open:bg-white open:shadow-lg transition-all duration-300">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-medium text-lg text-[#2D2A26]">
                  Comment les paiements fonctionnent-ils ?
                  <ChevronDown className="h-5 w-5 text-[#2D2A26]/40 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-[#2D2A26]/60 text-sm leading-relaxed">
                  Actuellement, la plateforme gère vos demandes de paiement comme un livre de comptes interactif. Vous créez une demande, le client la voit sur son espace, et une fois réglée (par virement, espèces, etc.), vous pouvez la marquer comme validée.
                </div>
              </details>
              
              <details className="group bg-[#FAF9F6] border border-[#2D2A26]/5 rounded-2xl open:bg-white open:shadow-lg transition-all duration-300">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-medium text-lg text-[#2D2A26]">
                  Puis-je créer mes propres exercices et métriques ?
                  <ChevronDown className="h-5 w-5 text-[#2D2A26]/40 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-[#2D2A26]/60 text-sm leading-relaxed">
                  Absolument. Vous pouvez assigner des templates de séances complets et définir des formulaires de suivi spécifiques (sommeil, poids, sensations) pour chaque athlète.
                </div>
              </details>

              <details className="group bg-[#FAF9F6] border border-[#2D2A26]/5 rounded-2xl open:bg-white open:shadow-lg transition-all duration-300">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-medium text-lg text-[#2D2A26]">
                  Mes athlètes doivent-ils payer pour utiliser l'application ?
                  <ChevronDown className="h-5 w-5 text-[#2D2A26]/40 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-[#2D2A26]/60 text-sm leading-relaxed">
                  Non, l'accès pour vos athlètes est totalement gratuit. Ils se connectent avec un code d'accès que vous leur fournissez.
                </div>
              </details>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-[#2D2A26]/5 py-12 px-4 md:px-8 bg-[#FAF9F6]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-lg border border-[#2D2A26]/5 shadow-sm">
              <Dumbbell className="h-4 w-4 text-[#2D2A26]" />
            </div>
            <span className="text-[#2D2A26] text-lg font-bold tracking-tight">TRACKLY</span>
          </div>
          
          <nav className="flex gap-6 text-sm text-[#2D2A26]/60 font-medium">
            <a href="#" className="hover:text-[#2D2A26]">Mentions légales</a>
            <a href="#" className="hover:text-[#2D2A26]">Confidentialité</a>
            <a href="#" className="hover:text-[#2D2A26]">Contact</a>
          </nav>
          
          <div className="text-[#2D2A26]/40 text-sm">
            © 2026 TRACKLY. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
