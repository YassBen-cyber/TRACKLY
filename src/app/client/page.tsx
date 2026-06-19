import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon, Dumbbell } from 'lucide-react'
import { ClientAvailabilities } from './client-availabilities'
import { ClientWorkouts } from './client-workouts'
import { ClientPayments } from './client-payments'
import { SetPasswordCard } from './set-password-card'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer le profil
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Récupérer les disponibilités
  const { data: availabilities } = await supabase.from('client_availabilities').select('*').eq('client_id', user.id).order('date')

  const { data: assignedSessions } = await supabase.from('assigned_sessions').select('*').eq('client_id', user.id).order('scheduled_date', { ascending: true })

  const { data: payments } = await supabase.from('payments').select('*').eq('client_id', user.id).order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F2F1ED] animated-gradient-bg">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-xl border border-primary/50 shadow-[0_0_15px_rgba(var(--color-primary),0.3)]">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900">Espace Athlète</span>
          </div>
          <form action={async () => {
            'use server'
            const sb = await createClient();
            await sb.auth.signOut();
            redirect('/login');
          }}>
            <Button variant="ghost" className="text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100">
              <LogOut className="h-4 w-4 mr-2" /> Déconnexion
            </Button>
          </form>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 relative z-10">
        <SetPasswordCard />
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Bonjour, {profile?.full_name || user.email} 👋</h1>
            <p className="text-zinc-600 mt-1">Prêt pour votre prochaine séance ?</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-zinc-200 backdrop-blur-sm">
            <ClientAvailabilities availabilities={availabilities || []} />
          </div>
        </div>

        {/* Section Paiements */}
        <ClientPayments payments={payments || []} />

        {/* Section Entraînements */}
        <ClientWorkouts sessions={assignedSessions || []} />
      </main>
    </div>
  )
}
