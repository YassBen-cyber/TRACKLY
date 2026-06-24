import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon, Dumbbell } from 'lucide-react'
import { ClientAvailabilities } from './client-availabilities'
import { ClientWorkouts } from './client-workouts'
import { ClientPayments } from './client-payments'
import { SetPasswordCard } from './set-password-card'
import { ClientMetrics } from './client-metrics'

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

  const pendingSessions = assignedSessions?.filter(s => s.status === 'pending') || []
  const recentPayments = payments?.slice(0, 3) || [] // Top 3 recent payments

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SetPasswordCard />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Bonjour, {profile?.full_name || user.email} 👋</h1>
          <p className="text-zinc-600 mt-1">Voici votre résumé du jour.</p>
        </div>
      </div>

      <div className="grid grid-cols-1  gap-8">
        {/* Next Workouts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900">Prochains Entraînements</h2>
          <ClientWorkouts sessions={pendingSessions} />
        </div>

        {/* RDV & Payments */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">Mes Rendez-vous / Dispos</h2>
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/20">
              <ClientAvailabilities availabilities={availabilities || []} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900">Derniers Paiements</h2>
              <Link href="/client/payments">
                <Button variant="link" className="text-primary p-0">Voir tout</Button>
              </Link>
            </div>
            <ClientPayments payments={recentPayments} />
          </div>
        </div>
      </div>
    </div>
  )
}
