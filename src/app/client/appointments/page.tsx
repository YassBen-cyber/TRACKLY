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

  const nowIso = new Date().toISOString()

  // Rendez-vous du client (futurs)
  const { data: upcomingData } = await supabase
    .from('appointments')
    .select('*, profiles:coach_id(full_name)')
    .eq('client_id', user.id)
    .gte('end_time', nowIso)
    .order('start_time', { ascending: true })

  // Rendez-vous passés avec bilans du coach
  const { data: pastData } = await supabase
    .from('appointments')
    .select('*, profiles:coach_id(full_name), training_reports(public_summary)')
    .eq('client_id', user.id)
    .lt('end_time', nowIso)
    .order('start_time', { ascending: false })

  const upcomingAppointments = upcomingData?.map(apt => ({
    ...apt,
    coach_name: apt.profiles?.full_name
  })) || []

  const pastAppointments = pastData?.map(apt => ({
    ...apt,
    coach_name: apt.profiles?.full_name
  })) || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
          <Calendar className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mes Rendez-vous</h1>
          <p className="text-muted-foreground text-sm">
            Retrouvez vos sessions prévues avec votre coach et consultez les comptes-rendus de vos rendez-vous passés.
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ClientAppointments upcomingAppointments={upcomingAppointments} pastAppointments={pastAppointments} />
      </div>
    </div>
  )
}
