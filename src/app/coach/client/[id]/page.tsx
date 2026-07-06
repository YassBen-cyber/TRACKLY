import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, User, Calendar, MapPin, AlertTriangle } from 'lucide-react'
import { ClientMetricsView } from './client-metrics-view'
import { AssignTemplateModal } from './assign-template-modal'
import { AssignProgramModal } from './assign-program-modal'
import { AddMetricModal } from './add-metric-modal'
import { AssignedSessionsList } from './assigned-sessions-list'
import { WeeklyPlanner } from './weekly-planner'
import { ClientAvailabilities } from '@/app/client/client-availabilities'
import { AppointmentHistory } from './appointment-history'
import { CreateAppointmentModal } from '../../calendar/create-appointment-modal'

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!client || client.coach_id !== user.id) {
    redirect('/coach')
  }

  // Métriques
  const { data: metricTypes } = await supabase.from('metric_types').select('*').eq('client_id', id).order('name')
  const { data: metricTemplates } = await supabase.from('metric_templates').select('*').eq('coach_id', user.id).order('name')
  const { data: allValues } = await supabase.from('metric_values').select('*, metric_types(name, unit)').eq('client_id', id).order('date', { ascending: true })

  // Entraînements
  const { data: sessionTemplates } = await supabase.from('session_templates').select('*').eq('coach_id', user.id).order('title')
  const { data: coachPrograms } = await supabase.from('programs').select('*').eq('coach_id', user.id).order('title')
  const { data: availabilities } = await supabase.from('client_availabilities').select('*').eq('client_id', id).order('date').order('start_time')
  const { data: assignedSessions } = await supabase.from('assigned_sessions').select('*').eq('client_id', id).order('scheduled_date', { ascending: true })

  // RDVs & Historique
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, training_reports(*)')
    .eq('client_id', id)
    .order('start_time', { ascending: false })

  const calculateAge = (dob: string) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="p-4 sm:p-0">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        <div className="flex flex-col gap-4">
          <Link href="/coach">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground px-0 -ml-2 hover:bg-transparent">
              <ChevronLeft className="mr-1 h-4 w-4" /> Retour au tableau de bord
            </Button>
          </Link>
          
          <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/50 shadow-[0_0_30px_rgba(var(--color-primary),0.3)] overflow-hidden">
                {client.photo_url ? (
                  <img src={client.photo_url} alt={client.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{client.full_name}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Inscrit le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  {client.date_of_birth && (
                    <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                      <User className="h-4 w-4" /> Né(e) le {new Date(client.date_of_birth).toLocaleDateString('fr-FR')} ({calculateAge(client.date_of_birth)} ans)
                    </p>
                  )}
                  {client.address && (
                    <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {client.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {client.medical_history && (
            <div className="glass-panel p-6 rounded-3xl border border-red-200 bg-red-50 flex gap-4 items-start">
              <div className="bg-red-100 p-3 rounded-2xl flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 mb-1">Antécédents médicaux et blessures</h3>
                <p className="text-red-800 text-sm whitespace-pre-wrap">{client.medical_history}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Entraînements planifiés</h2>
              <AssignProgramModal clientId={client.id} programs={coachPrograms || []} />
            </div>
            <WeeklyPlanner 
              clientId={client.id} 
              assignedSessions={assignedSessions || []} 
              availabilities={availabilities || []} 
              templates={sessionTemplates || []}
              appointments={appointments || []}
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">Rendez-vous</h2>
            <CreateAppointmentModal clients={[client]} clientAvailabilities={availabilities || []} defaultClientId={client.id} />
          </div>
          <AppointmentHistory clientId={client.id} appointments={appointments || []} />
        </div>



        <div className="pt-2 border-t border-border">
          <ClientMetricsView 
            values={allValues || []} 
            clientName={client.full_name} 
            clientId={client.id} 
            metricTypes={metricTypes || []} 
            headerActions={
              <>
                <AssignTemplateModal clientId={client.id} templates={metricTemplates || []} />
                <AddMetricModal clientId={client.id} />
              </>
            }
          />
        </div>

      </div>
    </div>
  )
}
