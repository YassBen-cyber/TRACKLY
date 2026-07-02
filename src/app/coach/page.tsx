import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Calendar, Activity, TrendingUp, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CoachDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer la liste des clients pour le compte
  const { data: clients } = await supabase
    .from('profiles')
    .select('*')
    .eq('coach_id', user.id)
    .eq('role', 'client')

  // Fetch appointments for stats (upcoming)
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, start_time, client:profiles!client_id(full_name)')
    .eq('coach_id', user.id)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5)
    
  const upcomingCount = appointments?.length || 0
  const activeClientsCount = clients?.length || 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Revue globale de votre activité.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Athlètes actifs</p>
              <h3 className="text-4xl font-display font-bold text-foreground">{activeClientsCount}</h3>
            </div>
            <div className="p-3 bg-muted rounded-2xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Rendez-vous à venir</p>
              <h3 className="text-4xl font-display font-bold text-foreground">{upcomingCount}</h3>
            </div>
            <div className="p-3 bg-muted rounded-2xl">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Engagement</p>
              <h3 className="text-4xl font-display font-bold text-foreground">Top</h3>
            </div>
            <div className="p-3 bg-muted rounded-2xl">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Calendar className="w-5 h-5 text-primary" />
              Prochains rendez-vous
            </h3>
            <Link href="/coach/calendar">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {!appointments || appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun rendez-vous prévu.</p>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="flex justify-between items-center p-4 rounded-2xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border text-primary font-bold">
                      {new Date(apt.start_time).getDate()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {/* @ts-ignore */}
                        {apt.client?.full_name || 'Client'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(apt.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Activity className="w-5 h-5 text-emerald-500" />
              Activité récente
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center h-full">
            <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Historique d'activité bientôt disponible.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
