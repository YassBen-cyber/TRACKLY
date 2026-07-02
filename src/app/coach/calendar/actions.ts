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

export async function createAppointment(clientId: string, title: string, startTime: string, endTime: string, notes: string, meetingUrl: string, locationType: string = 'remote', locationDetails: string = '') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  // Check for overlapping appointments
  const { data: overlapping } = await supabase
    .from('appointments')
    .select('id')
    .eq('coach_id', user.id)
    .lt('start_time', endTime)
    .gt('end_time', startTime)

  if (overlapping && overlapping.length > 0) {
    throw new Error('Vous avez déjà un rendez-vous prévu sur ce créneau horaire.')
  }

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
      status: 'scheduled',
      location_type: locationType,
      location_details: locationDetails
    })

  if (error) throw new Error('Erreur lors de la création du rendez-vous')

  revalidatePath('/coach/calendar')
  revalidatePath(`/coach/client/${clientId}`) // Revalidate client page too
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

export async function addSpecificAvailability(date: string, startTime: string, endTime: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('coach_specific_availabilities')
    .insert({
      coach_id: user.id,
      date,
      start_time: startTime,
      end_time: endTime
    })

  if (error) throw new Error('Erreur lors de l\'ajout de la disponibilité')

  revalidatePath('/coach/calendar')
  return { success: true }
}

export async function deleteSpecificAvailability(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('coach_specific_availabilities')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error('Erreur lors de la suppression')

  revalidatePath('/coach/calendar')
  return { success: true }
}

export async function applyWeeklyTemplate(startDateStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { data: availabilities } = await supabase
    .from('coach_availabilities')
    .select('*')
    .eq('coach_id', user.id)

  if (!availabilities || availabilities.length === 0) {
    throw new Error('Aucun horaire type défini')
  }

  const start = new Date(startDateStr)
  
  const toInsert = []
  
  for (let i = 0; i < 7; i++) {
    const current = new Date(start)
    current.setDate(current.getDate() + i)
    const currentDayOfWeek = current.getDay()
    
    const dayAvails = availabilities.filter(a => a.day_of_week === currentDayOfWeek)
    for (const a of dayAvails) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const dayStr = String(current.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${dayStr}`;

      toInsert.push({
        coach_id: user.id,
        date: localDateStr,
        start_time: a.start_time,
        end_time: a.end_time
      })
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase
      .from('coach_specific_availabilities')
      .insert(toInsert)

    if (error) throw new Error('Erreur lors de l\'application du modèle')
  }

  revalidatePath('/coach/calendar')
  return { success: true }
}

export async function updateSpecificAvailability(id: string, startTime: string, endTime: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('coach_specific_availabilities')
    .update({ start_time: startTime, end_time: endTime })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error('Erreur lors de la modification')

  revalidatePath('/coach/calendar')
  return { success: true }
}
