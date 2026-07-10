import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Settings2, Calendar, CalendarRange, Dumbbell, CreditCard, Settings, User, Users } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'

import { MobileNav } from '@/components/mobile-nav'

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border flex flex-col hidden md:flex transition-colors duration-300">
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/coach" className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <Image src="/TRACKLY_LOGO.webp" alt="Trackly logo" width={42} height={42} className="object-contain" priority />
            </div>
            <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">TRACKLY</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <Link href="/coach">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Link href="/coach/clients">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <Users className="mr-3 h-5 w-5" />
              Athlètes
            </Button>
          </Link>
          <Link href="/coach/workouts">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <Dumbbell className="mr-3 h-5 w-5" />
              Séances
            </Button>
          </Link>
          <Link href="/coach/programs">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <CalendarRange className="mr-3 h-5 w-5" />
              Programmes
            </Button>
          </Link>
          <Link href="/coach/calendar">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <Calendar className="mr-3 h-5 w-5" />
              Calendrier
            </Button>
          </Link>
          <Link href="/coach/payments">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <CreditCard className="mr-3 h-5 w-5" />
              Paiements
            </Button>
          </Link>
          <Link href="/coach/templates">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <Settings2 className="mr-3 h-5 w-5" />
              Objectifs
            </Button>
          </Link>
          <Link href="/coach/settings">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <Settings className="mr-3 h-5 w-5" />
              Profil & Paramètres
            </Button>
          </Link>
        </div>

        <div className="p-4 border-t border-border bg-background">
          <div className="mb-4 px-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/20">
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt={profile.full_name || 'Coach'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="text-sm font-bold text-foreground truncate">
              {profile?.full_name || 'Coach'}
            </div>
          </div>
          <form action={async () => {
            'use server'
            const sb = await createClient()
            await sb.auth.signOut()
            redirect('/login')
          }}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <MobileNav 
          links={[
            { href: '/coach', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
            { href: '/coach/clients', label: 'Athlètes', icon: <Users className="h-5 w-5" /> },
            { href: '/coach/workouts', label: 'Séances', icon: <Dumbbell className="h-5 w-5" /> },
            { href: '/coach/programs', label: 'Programmes', icon: <CalendarRange className="h-5 w-5" /> },
            { href: '/coach/calendar', label: 'Calendrier', icon: <Calendar className="h-5 w-5" /> },
            { href: '/coach/payments', label: 'Paiements', icon: <CreditCard className="h-5 w-5" /> },
            { href: '/coach/templates', label: 'Objectifs', icon: <Settings2 className="h-5 w-5" /> },
            { href: '/coach/settings', label: 'Profil & Paramètres', icon: <Settings className="h-5 w-5" /> },
          ]}
          profileNode={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/20">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name || 'Coach'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="text-sm font-bold text-foreground truncate">
                {profile?.full_name || 'Coach'}
              </div>
            </div>
          }
          logoutNode={
            <form action={async () => {
              'use server'
              const sb = await createClient()
              await sb.auth.signOut()
              redirect('/login')
            }}>
              <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                <LogOut className="mr-3 h-5 w-5" />
                Déconnexion
              </Button>
            </form>
          }
        />
        
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
