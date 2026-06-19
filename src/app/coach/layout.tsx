import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Settings2, Calendar, Dumbbell, CreditCard } from 'lucide-react'

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
    <div className="min-h-screen bg-[#F2F1ED] p-4 sm:p-8 animated-gradient-bg">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-panel p-6 rounded-3xl gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">COACH</span>
            </h1>
            <p className="mt-1 text-zinc-600 font-medium">{profile?.full_name}</p>
          </div>
          
          <nav className="flex-1 flex justify-center gap-2">
            <Link href="/coach">
              <Button variant="ghost" className="rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Clients
              </Button>
            </Link>
            <Link href="/coach/workouts">
              <Button variant="ghost" className="rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100">
                <Dumbbell className="mr-2 h-4 w-4" />
                Séances
              </Button>
            </Link>
            <Link href="/coach/calendar">
              <Button variant="ghost" className="rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100">
                <Calendar className="mr-2 h-4 w-4" />
                Calendrier
              </Button>
            </Link>
            <Link href="/coach/payments">
              <Button variant="ghost" className="rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100">
                <CreditCard className="mr-2 h-4 w-4" />
                Paiements
              </Button>
            </Link>
            <Link href="/coach/templates">
              <Button variant="ghost" className="rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100">
                <Settings2 className="mr-2 h-4 w-4" />
                Objectifs
              </Button>
            </Link>
          </nav>

          <form action={async () => {
            'use server'
            const sb = await createClient();
            await sb.auth.signOut();
            redirect('/login');
          }}>
            <Button type="submit" variant="destructive" className="rounded-xl border-zinc-300 shadow-lg hover:shadow-red-500/20 hover:scale-105 transition-all">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </form>
        </header>

        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
