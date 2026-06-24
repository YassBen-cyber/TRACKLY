import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, LayoutDashboard, Activity, CreditCard, History, LogOut } from 'lucide-react'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  return (
    <div className="flex h-screen bg-[#F2F1ED] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-xl border border-primary/50">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-black tracking-tight text-zinc-900">Espace Athlète</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <Link href="/client">
            <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Vue d'ensemble
            </Button>
          </Link>
          <Link href="/client/metrics">
            <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
              <Activity className="mr-3 h-5 w-5" />
              Ma Progression
            </Button>
          </Link>
          <Link href="/client/history">
            <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
              <History className="mr-3 h-5 w-5" />
              Historique
            </Button>
          </Link>
          <Link href="/client/payments">
            <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
              <CreditCard className="mr-3 h-5 w-5" />
              Paiements
            </Button>
          </Link>
        </div>

        <div className="p-4 border-t border-zinc-200">
          <div className="mb-4 px-2 text-sm font-medium text-zinc-800 truncate">
            {profile?.full_name || 'Athlète'}
          </div>
          <form action={async () => {
            'use server'
            const sb = await createClient()
            await sb.auth.signOut()
            redirect('/login')
          }}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-red-50 hover:text-red-600">
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden bg-white border-b border-zinc-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-bold text-zinc-900">Espace Athlète</span>
          </div>
          {/* Un menu burger pourrait être ajouté ici */}
        </div>
        
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
