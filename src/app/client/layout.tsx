import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, LayoutDashboard, Activity, CreditCard, LogOut, Settings, User, Calendar, Clock } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'
import { MobileNav } from '@/components/mobile-nav'
import { CollapsibleSidebar } from '@/components/collapsible-sidebar'
import { LogoutButton } from '@/components/logout-button'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('full_name, photo_url').eq('id', user.id).single()

  const links = [
    { href: '/client', label: "Vue d'ensemble", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/client/workouts', label: 'Entraînements', icon: <Dumbbell className="h-5 w-5" /> },
    { href: '/client/appointments', label: 'Rendez-vous', icon: <Calendar className="h-5 w-5" /> },
    { href: '/client/dispos', label: 'Mes Dispos', icon: <Clock className="h-5 w-5" /> },
    { href: '/client/metrics', label: 'Ma Progression', icon: <Activity className="h-5 w-5" /> },
    { href: '/client/payments', label: 'Paiements', icon: <CreditCard className="h-5 w-5" /> },
    { href: '/client/settings', label: 'Paramètres', icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <CollapsibleSidebar links={links} profile={profile} homeHref="/client" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <MobileNav 
          links={links}
          profileNode={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/20">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name || 'Athlète'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="text-sm font-bold text-foreground truncate">
                {profile?.full_name || 'Athlète'}
              </div>
            </div>
          }
          logoutNode={<LogoutButton />}
        />
        
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}


