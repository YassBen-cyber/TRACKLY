import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, LayoutDashboard, Activity, CreditCard, History, LogOut, Settings, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('full_name, photo_url').eq('id', user.id).single()

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/client" className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <Image src="/TRACKLY_LOGO.webp" alt="Trackly logo" width={42} height={42} className="object-contain" priority />
            </div>
            <span className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">TRACKLY</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <Link href="/client">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Vue d'ensemble
            </Button>
          </Link>
          <Link href="/client/metrics">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <Activity className="mr-3 h-5 w-5" />
              Ma Progression
            </Button>
          </Link>
          <Link href="/client/history">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <History className="mr-3 h-5 w-5" />
              Historique
            </Button>
          </Link>
          <Link href="/client/payments">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <CreditCard className="mr-3 h-5 w-5" />
              Paiements
            </Button>
          </Link>
          <Link href="/client/settings">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
              <Settings className="mr-3 h-5 w-5" />
              Paramètres
            </Button>
          </Link>
        </div>

        <div className="p-4 border-t border-border">
          <div className="mb-4 px-2 flex items-center gap-3">
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
          <form action={async () => {
            'use server'
            const sb = await createClient()
            await sb.auth.signOut()
            redirect('/login')
          }}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-red-600">
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden bg-background border-b border-border p-4 flex justify-between items-center transition-colors duration-300">
          <Link href="/client" className="flex items-center gap-2">
            <Image src="/TRACKLY_LOGO.webp" alt="Trackly logo" width={32} height={32} className="object-contain" priority />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">TRACKLY</span>
          </Link>
          <ThemeToggle />
        </div>
        
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
