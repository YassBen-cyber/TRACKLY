import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User as UserIcon, AlertCircle, Dumbbell, Clock, CreditCard, ArrowRight } from 'lucide-react'
import { ClientPayments } from './client-payments'
import { SetPasswordCard } from './set-password-card'
import { ClientDayPlanner } from './client-day-planner'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer le profil
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Récupérer le profil du coach
  let coachProfile = null
  if (profile?.coach_id) {
    const { data: coachData } = await supabase.from('profiles').select('full_name, photo_url').eq('id', profile.coach_id).single()
    coachProfile = coachData
  }

  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

  // Rendez-vous du jour
  const startOfDay = `${todayStr}T00:00:00`
  const endOfDay = `${todayStr}T23:59:59`

  const { data: todayAppointmentsData } = await supabase
    .from('appointments')
    .select('*, profiles:coach_id(full_name, photo_url)')
    .eq('client_id', user.id)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .order('start_time', { ascending: true })

  const initialAppointments = todayAppointmentsData?.map(apt => ({
    ...apt,
    coach_name: apt.profiles?.full_name,
    coach_photo: apt.profiles?.photo_url
  })) || []

  // Entraînements du jour
  const { data: todaySessions } = await supabase
    .from('assigned_sessions')
    .select('*')
    .eq('client_id', user.id)
    .eq('scheduled_date', todayStr)
    .order('created_at', { ascending: true })

  // Séances en retard (à valider)
  const { data: assignedSessions } = await supabase
    .from('assigned_sessions')
    .select('*')
    .eq('client_id', user.id)

  const pendingSessions = assignedSessions?.filter(s => s.status === 'planned' && s.scheduled_date < todayStr) || []

  // Derniers paiements
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  const recentPayments = payments?.slice(0, 3) || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SetPasswordCard />

      {/* Alerte séances en retard */}
      {pendingSessions.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-yellow-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                Vous avez {pendingSessions.length} {pendingSessions.length > 1 ? 'séances en retard' : 'séance en retard'}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                N'oubliez pas de transmettre vos ressentis à votre coach.
              </p>
            </div>
          </div>
          <Link href="/client/workouts" className="w-full sm:w-auto">
            <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl w-full sm:w-auto">
              Faire mes retours
            </Button>
          </Link>
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Bonjour, {profile?.full_name || user.email}
          </h1>
          <p className="text-muted-foreground mt-1">Consultez votre programme du jour ou choisissez une autre date.</p>
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

      {/* Sélecteur de jour & Planning dynamique du jour */}
      <ClientDayPlanner 
        initialDate={todayStr}
        initialAppointments={initialAppointments}
        initialSessions={todaySessions || []}
      />

      {/* Accès rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/client/dispos" className="group">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm group-hover:border-primary/50 transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">Mes Disponibilités</h3>
                <p className="text-xs text-muted-foreground">Gérer vos créneaux libres pour le coach</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <Link href="/client/workouts" className="group">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm group-hover:border-primary/50 transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-blue-500">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg group-hover:text-blue-500 transition-colors">Tous mes entraînements</h3>
                <p className="text-xs text-muted-foreground">Voir le programme et l'historique complet</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Derniers Paiements */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Derniers Paiements</h2>
          <Link href="/client/payments">
            <Button variant="link" className="text-primary p-0">Historique complet</Button>
          </Link>
        </div>
        <ClientPayments payments={recentPayments} />
      </div>
    </div>
  )
}
