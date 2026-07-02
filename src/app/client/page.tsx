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
import { BookAppointmentModal } from './book-appointment-modal'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer le profil
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Récupérer le profil du coach, ses dispos et ses rdv
  let coachProfile = null
  let coachAvailabilities: any[] = []
  let coachAppointments: any[] = []
  if (profile?.coach_id) {
    const { data: coachData } = await supabase.from('profiles').select('full_name, photo_url').eq('id', profile.coach_id).single()
    coachProfile = coachData

    const { data: cAvails } = await supabase.from('coach_specific_availabilities').select('*').eq('coach_id', profile.coach_id)
    coachAvailabilities = cAvails || []

    // Only future appointments
    const { data: cAppts } = await supabase.from('appointments')
      .select('*')
      .eq('coach_id', profile.coach_id)
      .gte('start_time', new Date().toISOString())
    coachAppointments = cAppts || []
  }

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
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Bonjour, {profile?.full_name || user.email} 👋</h1>
          <p className="text-muted-foreground mt-1">Voici votre résumé du jour.</p>
          
          {profile?.coach_id && (
            <div className="mt-4">
              <BookAppointmentModal 
                coachId={profile.coach_id} 
                coachAvailabilities={coachAvailabilities} 
                coachAppointments={coachAppointments} 
              />
            </div>
          )}
        </div>
        
        {coachProfile && (
          <div className="flex items-center gap-4 bg-card px-5 py-3 rounded-2xl border border-border shadow-sm">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Votre Coach</p>
              <p className="font-semibold text-foreground">{coachProfile.full_name}</p>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/20 flex-shrink-0">
              {coachProfile.photo_url ? (
                <img src={coachProfile.photo_url} alt={coachProfile.full_name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="sm:hidden">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Votre Coach</p>
              <p className="font-semibold text-foreground">{coachProfile.full_name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1  gap-8">
        {/* Next Workouts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Prochains Entraînements</h2>
          <ClientWorkouts sessions={pendingSessions} />
        </div>

        {/* RDV & Payments */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Mes Rendez-vous / Dispos</h2>
            <div className="bg-card p-6 rounded-3xl border border-border shadow-xl shadow-foreground/5">
              <ClientAvailabilities availabilities={availabilities || []} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Derniers Paiements</h2>
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
