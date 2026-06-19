'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setAvailabilities(availabilities: { day_of_week: number, start_time: string, end_time: string }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  // On supprime les anciennes dispos
  await supabase
    .from('coach_availabilities')
    .delete()
    .eq('coach_id', user.id)

  // On insère les nouvelles
  if (availabilities.length > 0) {
    const { error } = await supabase
      .from('coach_availabilities')
      .insert(availabilities.map(a => ({
        coach_id: user.id,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time
      })))

    if (error) throw new Error('Erreur lors de la sauvegarde des disponibilités')
  }

  revalidatePath('/coach/calendar')
  return { success: true }
}

export async function createAppointment(clientId: string, title: string, startTime: string, endTime: string, notes: string, meetingUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('appointments')
    .insert({
      coach_id: user.id,
      client_id: clientId,
      title,
      start_time: startTime,
      end_time: endTime,
      notes,
      meeting_url: meetingUrl,
      status: 'scheduled'
    })

  if (error) throw new Error('Erreur lors de la création du rendez-vous')

  revalidatePath('/coach/calendar')
  return { success: true }
}

export async function deleteAppointment(appointmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)
    .eq('coach_id', user.id)

  if (error) throw new Error('Erreur lors de l\'annulation du rendez-vous')

  revalidatePath('/coach/calendar')
  return { success: true }
}
