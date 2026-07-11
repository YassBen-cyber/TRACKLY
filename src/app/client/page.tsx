import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon, Dumbbell, Calendar } from 'lucide-react'
import { ClientAvailabilities } from './client-availabilities'
import { ClientWorkouts } from './client-workouts'
import { ClientPayments } from './client-payments'
import { SetPasswordCard } from './set-password-card'
import { ClientMetrics } from './client-metrics'
import { ClientAppointments } from './client-appointments'

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
  if (profile?.coach_id) {
    const { data: coachData } = await supabase.from('profiles').select('full_name, photo_url').eq('id', profile.coach_id).single()
    coachProfile = coachData
  }

  // Rendez-vous du client
  const { data: clientAppointmentsData } = await supabase.from('appointments')
    .select('*, profiles:coach_id(full_name)')
    .eq('client_id', user.id)
    .gte('end_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    
  const clientAppointments = clientAppointmentsData?.map(apt => ({
    ...apt,
    coach_name: apt.profiles?.full_name
  })) || []

  // Récupérer les disponibilités
  const { data: availabilities } = await supabase.from('client_availabilities').select('*').eq('client_id', user.id).order('date')

  const { data: assignedSessions } = await supabase.from('assigned_sessions').select('*').eq('client_id', user.id).order('scheduled_date', { ascending: true })

  const { data: payments } = await supabase.from('payments').select('*').eq('client_id', user.id).order('created_at', { ascending: false })

  const recentPayments = payments?.slice(0, 3) || [] // Top 3 recent payments

  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
  const pendingSessions = assignedSessions?.filter(s => s.status === 'planned' && s.scheduled_date <= todayStr) || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SetPasswordCard />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Bonjour, {profile?.full_name || user.email} 👋</h1>
          <p className="text-muted-foreground mt-1">Voici votre résumé du jour.</p>
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

      <div className="flex flex-col gap-6">
        
        {/* Next Workout Card */}
        <div className="bg-card p-6 rounded-3xl border border-border shadow-md hover:shadow-lg transition-shadow flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Prochain Entraînement
            </h2>
            <Link href="/client/workouts">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">Voir tout</Button>
            </Link>
          </div>
          
          {pendingSessions.length > 0 ? (
            <div className="bg-muted/30 p-4 rounded-xl border border-border">
              <p className="font-bold text-lg text-foreground">{pendingSessions[0].title}</p>
              <p className="text-sm text-muted-foreground mt-1">Planifié le {new Date(pendingSessions[0].scheduled_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <Link href="/client/workouts" className="mt-3 block">
                <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20">Aller à la séance</Button>
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-6 border border-dashed border-border rounded-xl">
              <p>Aucun entraînement en attente.</p>
            </div>
          )}
        </div>

        {/* Next Appointment Card */}
        <div className="bg-card p-6 rounded-3xl border border-border shadow-md hover:shadow-lg transition-shadow flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Prochain Rendez-vous
            </h2>
            <Link href="/client/appointments">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">Voir tout</Button>
            </Link>
          </div>
          
          {clientAppointments.length > 0 ? (
            <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
              <p className="font-bold text-lg text-foreground">{clientAppointments[0].title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(clientAppointments[0].start_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </p>
              <Link href="/client/appointments" className="mt-3 block">
                <Button className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/20">Voir les détails</Button>
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-6 border border-dashed border-border rounded-xl">
              <p>Aucun rendez-vous prévu.</p>
            </div>
          )}
        </div>

        {/* Availabilities Widget */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Mes Dispos / Souhaits de RDV</h2>
          <div className="bg-card p-6 rounded-3xl border border-border shadow-md">
            <ClientAvailabilities availabilities={availabilities || []} />
          </div>
        </div>

        {/* Payments Widget */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-foreground">Derniers Paiements</h2>
            <Link href="/client/payments">
              <Button variant="link" className="text-primary p-0">Historique</Button>
            </Link>
          </div>
          <ClientPayments payments={recentPayments} />
        </div>
      </div>
    </div>
  )
}
