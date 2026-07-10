import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClientAppointments } from '../client-appointments'
import { Calendar } from 'lucide-react'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Rendez-vous du client (futurs)
  const { data: clientAppointmentsData } = await supabase.from('appointments')
    .select('*, profiles:coach_id(full_name)')
    .eq('client_id', user.id)
    .gte('end_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    
  const clientAppointments = clientAppointmentsData?.map(apt => ({
    ...apt,
    coach_name: apt.profiles?.full_name
  })) || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mes Rendez-vous Prévus</h1>
      </div>

      <div className="max-w-3xl">
        <ClientAppointments appointments={clientAppointments} />
      </div>
    </div>
  )
}
