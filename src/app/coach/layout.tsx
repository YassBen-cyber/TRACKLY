import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Settings2, Calendar, CalendarRange, Dumbbell, CreditCard, Settings, User, Users, BookOpen } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'

import { MobileNav } from '@/components/mobile-nav'
import { CollapsibleSidebar } from '@/components/collapsible-sidebar'
import { LogoutButton } from '@/components/logout-button'

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

  const links = [
    { href: '/coach', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/coach/clients', label: 'Athlètes', icon: <Users className="h-5 w-5" /> },
    { href: '/coach/workouts', label: 'Séances', icon: <Dumbbell className="h-5 w-5" /> },
    { href: '/coach/exercises', label: 'Exercices', icon: <BookOpen className="h-5 w-5" /> },
    { href: '/coach/programs', label: 'Programmes', icon: <CalendarRange className="h-5 w-5" /> },
    { href: '/coach/calendar', label: 'Calendrier', icon: <Calendar className="h-5 w-5" /> },
    { href: '/coach/payments', label: 'Paiements', icon: <CreditCard className="h-5 w-5" /> },
    { href: '/coach/templates', label: 'Objectifs', icon: <Settings2 className="h-5 w-5" /> },
    { href: '/coach/settings', label: 'Profil & Paramètres', icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <CollapsibleSidebar links={links} profile={profile} homeHref="/coach" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <MobileNav 
          links={[
            { href: '/coach', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
            { href: '/coach/clients', label: 'Athlètes', icon: <Users className="h-5 w-5" /> },
            { href: '/coach/workouts', label: 'Séances', icon: <Dumbbell className="h-5 w-5" /> },
            { href: '/coach/exercises', label: 'Exercices', icon: <BookOpen className="h-5 w-5" /> },
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
          logoutNode={<LogoutButton />}
        />
        
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
