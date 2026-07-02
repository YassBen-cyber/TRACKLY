import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClientWorkouts } from '../client-workouts'
import { Calendar, FileText, CheckCircle } from 'lucide-react'

export default async function ClientHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: assignedSessions } = await supabase
    .from('assigned_sessions')
    .select('*')
    .eq('client_id', user.id)
    .order('scheduled_date', { ascending: false })

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, training_reports(public_summary)')
    .eq('client_id', user.id)
    .order('start_time', { ascending: false })

  const pastSessions = assignedSessions?.filter(s => s.status !== 'pending') || []
  const pastAppointments = appointments?.filter(a => new Date(a.start_time) < new Date()) || []

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Historique des séances</h1>
        <p className="text-muted-foreground mt-1">Retrouvez toutes vos séances passées et vos retours.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Entraînements terminés
          </h2>
          <ClientWorkouts sessions={pastSessions} />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Historique des Rendez-vous
          </h2>
          <div className="grid gap-4">
            {pastAppointments.length === 0 ? (
              <div className="text-muted-foreground italic p-4 bg-card rounded-2xl border border-border text-center">Aucun rendez-vous passé.</div>
            ) : (
              pastAppointments.map(apt => {
                const summary = apt.training_reports?.[0]?.public_summary
                return (
                  <div key={apt.id} className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
                    <div className="font-bold text-foreground capitalize flex justify-between items-center">
                      {new Date(apt.start_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-medium">Terminé</span>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">{apt.title}</div>
                    
                    {summary ? (
                      <div className="mt-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                          <FileText className="h-4 w-4" />
                          Bilan du coach
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">Aucun bilan rédigé pour le moment.</div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
