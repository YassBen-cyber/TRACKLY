'use server'

import { createClient } from '@/utils/supabase/server'

export async function getCoachDayPlannerData(dateStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  // 1. Récupérer les clients du coach
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, photo_url')
    .eq('coach_id', user.id)
    .eq('role', 'client')

  const clientIds = clients?.map(c => c.id) || []

  // Map des clients pour accès rapide par id
  const clientMap: Record<string, { full_name: string | null, photo_url: string | null }> = {}
  clients?.forEach(c => {
    clientMap[c.id] = { full_name: c.full_name, photo_url: c.photo_url }
  })

  // 2. Récupérer les rendez-vous du jour sélectionné (entre 00:00 et 23:59:59)
  const startOfDay = `${dateStr}T00:00:00`
  const endOfDay = `${dateStr}T23:59:59`

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('coach_id', user.id)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .order('start_time', { ascending: true })

  const formattedAppointments = appointments?.map(apt => ({
    ...apt,
    client: clientMap[apt.client_id] || { full_name: 'Client inconnu', photo_url: null }
  })) || []

  // 3. Récupérer les entraînements (assigned_sessions) du jour sélectionné
  let formattedSessions: any[] = []
  if (clientIds.length > 0) {
    const { data: sessions } = await supabase
      .from('assigned_sessions')
      .select('*')
      .in('client_id', clientIds)
      .eq('scheduled_date', dateStr)
      .order('created_at', { ascending: true })

    formattedSessions = sessions?.map(s => ({
      ...s,
      client: clientMap[s.client_id] || { full_name: 'Client inconnu', photo_url: null }
    })) || []
  }

  return {
    appointments: formattedAppointments,
    sessions: formattedSessions
  }
}
