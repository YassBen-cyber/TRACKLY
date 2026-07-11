import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar as CalendarIcon, Clock, Video, Users, Trash2, Info } from 'lucide-react'
import { CreateAppointmentModal } from './create-appointment-modal'
import { CoachWeeklyPlanner } from './coach-weekly-planner'
import { Button } from '@/components/ui/button'

// Helper for formatting time
function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch coach's clients
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('coach_id', user.id)
    .eq('role', 'client')

  // Fetch client availabilities
  const clientIds = clients?.map(c => c.id) || []
  const { data: clientAvailabilities } = await supabase
    .from('client_availabilities')
    .select('*')
    .in('client_id', clientIds)
    .in('availability_type', ['appointment', 'both'])
    .order('date')

  // Fetch appointments (upcoming & recent)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, profiles!appointments_client_id_fkey(full_name)')
    .eq('coach_id', user.id)
    .gte('start_time', thirtyDaysAgo.toISOString())
    .order('start_time', { ascending: true })

  // Split appointments into upcoming and past
  const now = new Date()
  const upcoming = appointments?.filter(a => new Date(a.start_time) >= now) || []
  const past = appointments?.filter(a => new Date(a.start_time) < now).reverse() || [] // Most recent past first

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Calendrier & Rendez-vous
          </h2>
          <p className="text-muted-foreground mt-1">
            Gérez vos séances en direct avec vos athlètes en les plaçant directement sur vos créneaux.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <CreateAppointmentModal clients={clients || []} clientAvailabilities={clientAvailabilities || []} />
        </div>
      </div>

      <div className="gap-8">
        
        {/* Colonne de gauche : Planning Hebdomadaire */}
        <div className="lg:col-span-2 space-y-6 fill">
          <CoachWeeklyPlanner 
            clients={clients || []}
            appointments={appointments || []}
            availabilities={[]}
            specificAvailabilities={[]}
            clientAvailabilities={clientAvailabilities || []}
          />

          {/* Historique récent */}
          {past.length > 0 && (
            <div className="pt-8">
              <h3 className="text-lg font-bold text-muted-foreground flex items-center gap-2 mb-4">
                Historique récent
              </h3>
              <div className="space-y-3">
                {past.slice(0, 5).map(apt => (
                  <div key={apt.id} className="glass-panel p-4 rounded-2xl border border-border opacity-70 hover:opacity-100 transition-opacity flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="font-bold text-muted-foreground">{apt.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {new Date(apt.start_time).toLocaleDateString('fr-FR')} • {formatTime(apt.start_time)} 
                        <span>({apt.profiles?.full_name})</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Passé
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
