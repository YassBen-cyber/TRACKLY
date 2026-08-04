import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Calendar, Dumbbell, TrendingUp } from 'lucide-react'
import { CoachDayPlanner } from './coach-day-planner'

export default async function CoachDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Récupérer la liste des clients du coach
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, photo_url')
    .eq('coach_id', user.id)
    .eq('role', 'client')

  const activeClientsCount = clients?.length || 0
  const clientIds = clients?.map(c => c.id) || []

  const clientMap: Record<string, { full_name: string | null, photo_url: string | null }> = {}
  clients?.forEach(c => {
    clientMap[c.id] = { full_name: c.full_name, photo_url: c.photo_url }
  })

  // Date du jour ISO (YYYY-MM-DD)
  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
  const startOfDay = `${todayStr}T00:00:00`
  const endOfDay = `${todayStr}T23:59:59`

  // 2. Récupérer les rendez-vous du jour pour le coach
  const { data: todayAppointmentsData } = await supabase
    .from('appointments')
    .select('*')
    .eq('coach_id', user.id)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .order('start_time', { ascending: true })

  const initialAppointments = todayAppointmentsData?.map(apt => ({
    ...apt,
    client: clientMap[apt.client_id] || { full_name: 'Client inconnu', photo_url: null }
  })) || []

  // 3. Récupérer les séances d'entraînement prévues aujourd'hui
  let initialSessions: any[] = []
  if (clientIds.length > 0) {
    const { data: sessionsData } = await supabase
      .from('assigned_sessions')
      .select('*')
      .in('client_id', clientIds)
      .eq('scheduled_date', todayStr)
      .order('created_at', { ascending: true })

    initialSessions = sessionsData?.map(s => ({
      ...s,
      client: clientMap[s.client_id] || { full_name: 'Client inconnu', photo_url: null }
    })) || []
  }

  // Tous les rendez-vous futurs (pour la stat globale)
  const { data: futureAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('coach_id', user.id)
    .gte('start_time', new Date().toISOString())

  const upcomingCount = futureAppointments?.length || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard Coach</h2>
          <p className="text-muted-foreground text-sm mt-1">Revue globale et planning quotidien de vos athlètes.</p>
        </div>
      </div>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/coach/clients">
          <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Athlètes actifs</p>
                <h3 className="text-4xl font-display font-black text-foreground">{activeClientsCount}</h3>
              </div>
              <div className="text-primary">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/coach/calendar">
          <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group hover:border-orange-500/50 transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">RDV à venir (Total)</p>
                <h3 className="text-4xl font-display font-black text-foreground">{upcomingCount}</h3>
              </div>
              <div className="text-orange-500">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>

        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Séances Aujourd'hui</p>
              <h3 className="text-4xl font-display font-black text-foreground">{initialSessions.length}</h3>
            </div>
            <div className="text-blue-500">
              <Dumbbell className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Sélecteur de jour & Planning dynamique du Coach */}
      <CoachDayPlanner 
        initialDate={todayStr}
        initialAppointments={initialAppointments}
        initialSessions={initialSessions}
      />
    </div>
  )
}
