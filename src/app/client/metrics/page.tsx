import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClientMetrics } from '../client-metrics'

export default async function ClientMetricsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: metricTypes } = await supabase.from('metric_types').select('*').eq('client_id', user.id).order('name')
  const { data: metricValues } = await supabase.from('metric_values').select('*').eq('client_id', user.id).order('date', { ascending: true })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Suivi détaillé</h1>
        <p className="text-muted-foreground mt-1">Consultez et ajoutez vos mesures et photos de progression.</p>
      </div>
      <ClientMetrics metricTypes={metricTypes || []} metricValues={metricValues || []} />
    </div>
  )
}
