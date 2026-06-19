import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, User, Calendar, Dumbbell } from 'lucide-react'
import { MetricForms } from './metric-forms'
import { ClientMetricsView } from './client-metrics-view'
import { AssignTemplateModal } from './assign-template-modal'
import { AssignWorkoutModal } from './assign-workout-modal'
import { AssignedSessionsList } from './assigned-sessions-list'

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
  const { data: availabilities } = await supabase.from('client_availabilities').select('*').eq('client_id', id).order('date').order('start_time')
  const { data: assignedSessions } = await supabase.from('assigned_sessions').select('*').eq('client_id', id).order('scheduled_date', { ascending: true })

  return (
    <div className="min-h-screen bg-[#F2F1ED] p-4 sm:p-8 animated-gradient-bg">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        <div className="flex flex-col gap-4">
          <Link href="/coach">
            <Button variant="ghost" className="text-zinc-600 hover:text-zinc-900 px-0 -ml-2 hover:bg-transparent">
              <ChevronLeft className="mr-1 h-4 w-4" /> Retour au tableau de bord
            </Button>
          </Link>
          
          <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/50 shadow-[0_0_30px_rgba(var(--color-primary),0.3)]">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">{client.full_name}</h1>
                <p className="text-zinc-600 mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Inscrit le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <AssignWorkoutModal clientId={client.id} templates={sessionTemplates || []} availabilities={availabilities || []} />
              <AssignTemplateModal clientId={client.id} templates={metricTemplates || []} />
            </div>
          </div>
        </div>

        {/* Section Entraînements planifiés */}
        <AssignedSessionsList clientId={client.id} assignedSessions={assignedSessions || []} />

        <MetricForms clientId={client.id} metricTypes={metricTypes || []} />

        <div className="pt-4 border-t border-zinc-200">
          <ClientMetricsView values={allValues || []} clientName={client.full_name} />
        </div>

      </div>
    </div>
  )
}
