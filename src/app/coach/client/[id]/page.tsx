import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, User, Calendar, MapPin, AlertTriangle, Mail, CheckCircle2 } from 'lucide-react'
import { ClientMetricsView } from './client-metrics-view'
import { AssignTemplateModal } from './assign-template-modal'
import { AssignProgramModal } from './assign-program-modal'
import { AddMetricModal } from './add-metric-modal'
import { AssignedSessionsList } from './assigned-sessions-list'
import { WeeklyPlanner } from './weekly-planner'
import { ClientAvailabilities } from '@/app/client/client-availabilities'
import { AppointmentHistory } from './appointment-history'
import { CreateAppointmentModal } from '../../calendar/create-appointment-modal'

import { ClientGoalCard } from './client-goal-card'

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

  // Email de l'athlète
  let clientEmail = client.email || null
  if (!clientEmail && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(id)
      if (authUser?.user?.email) {
        clientEmail = authUser.user.email
      }
    } catch (e) {
      console.error('Error fetching client email', e)
    }
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
              <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/50 shadow-[0_0_30px_rgba(var(--color-primary),0.3)] overflow-hidden shrink-0">
                {client.photo_url ? (
                  <img src={client.photo_url} alt={client.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{client.full_name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {clientEmail && (
                    <p className="text-foreground font-semibold text-sm flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-xl border border-blue-500/20">
                      <Mail className="h-4 w-4 text-blue-400" /> {clientEmail}
                    </p>
                  )}
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

          {/* Rappel d'Objectif Principal du Coach */}
          <ClientGoalCard clientId={client.id} mainGoal={client.main_goal} />

          {/* Section Maladies / Antécédents médicaux */}
          {client.medical_history ? (
            <div className="glass-panel p-6 rounded-3xl border border-red-500/30 bg-red-500/10 flex gap-4 items-start shadow-sm">
              <div className="bg-red-500/20 p-3 rounded-2xl flex-shrink-0 text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-red-400 text-base flex items-center gap-2">
                  <span>Antécédents médicaux, maladies & blessures</span>
                </h3>
                <p className="text-foreground/90 text-sm whitespace-pre-wrap leading-relaxed">{client.medical_history}</p>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 flex gap-4 items-center">
              <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-400 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Informations médicales</h3>
                <p className="text-muted-foreground text-xs">Aucun antécédent médical ni maladie/blessure renseigné par l'athlète.</p>
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
