'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { notifyClientAvailabilitiesAdded, notifyAppointmentEvent } from '@/lib/email'

export async function addAvailability(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const availabilityType = (formData.get('availabilityType') as string) || 'both'

  const { error } = await supabase
    .from('client_availabilities')
    .insert({
      client_id: user.id,
      date: date,
      start_time: startTime,
      end_time: endTime,
      availability_type: availabilityType
    })

  if (error) {
    throw new Error('Erreur lors de l\'ajout de la disponibilité')
  }

  // Notifier le coach par email
  notifyClientAvailabilitiesAdded({
    clientId: user.id,
    date,
    startTime,
    endTime,
    availabilityType
  }).catch(err => console.error("Erreur notification email (disponibilité):", err))

  revalidatePath('/client')
  revalidatePath('/client/dispos')
}

export async function deleteAvailability(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('client_availabilities')
    .delete()
    .eq('id', id)
    .eq('client_id', user.id)

  if (error) {
    throw new Error('Erreur lors de la suppression')
  }

  revalidatePath('/client')
}

export async function validateSession(sessionId: string, status: 'completed' | 'missed', feedback: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('assigned_sessions')
    .update({
      status,
      execution_feedback: feedback,
      completed_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('client_id', user.id)

  if (error) {
    throw new Error('Erreur lors de la validation')
  }

  revalidatePath('/client')
}

export async function simulatePayment(paymentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('payments')
    .update({ 
      status: 'paid', 
      paid_at: new Date().toISOString() 
    })
    .eq('id', paymentId)
    .eq('client_id', user.id)

  if (error) throw new Error('Erreur lors du paiement')

  revalidatePath('/client')
  return { success: true }
}

export async function addClientMetricValue(metricTypeId: string, value: number, photoUrl: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('metric_values')
    .insert({
      client_id: user.id,
      metric_type_id: metricTypeId,
      value: value,
      date: new Date().toISOString(),
      photo_url: photoUrl
    })

  if (error) {
    throw new Error('Erreur lors de l\'ajout de la métrique')
  }

  revalidatePath('/client')
  return { success: true }
}

export async function deleteClientMetricValue(metricValueId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('metric_values')
    .delete()
    .eq('id', metricValueId)
    .eq('client_id', user.id)

  if (error) throw new Error('Erreur lors de la suppression')

  revalidatePath('/client')
}

export async function updateClientMetricValue(metricValueId: string, value: number, photoUrl: string | null, dateStr?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const updateData: any = { value, photo_url: photoUrl }
  if (dateStr) {
    updateData.date = new Date(dateStr).toISOString()
  }

  const { error } = await supabase
    .from('metric_values')
    .update(updateData)
    .eq('id', metricValueId)
    .eq('client_id', user.id)

  if (error) throw new Error('Erreur lors de la modification')

  revalidatePath('/client')
}

export async function createAppointmentAsClient(coachId: string, title: string, startTime: string, endTime: string, notes: string, locationType: string = 'remote', locationDetails: string = '') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('appointments')
    .insert({
      coach_id: coachId,
      client_id: user.id,
      title: title,
      start_time: startTime,
      end_time: endTime,
      notes: notes,
      status: 'scheduled',
      location_type: locationType,
      location_details: locationDetails
    })

  if (error) {
    throw new Error('Erreur lors de la prise de rendez-vous')
  }

  // Notifier le coach par email
  notifyAppointmentEvent({
    coachId,
    clientId: user.id,
    title,
    startTime,
    endTime,
    locationType,
    locationDetails,
    notes,
    createdByRole: 'client'
  }).catch(err => console.error("Erreur notification email (RDV client):", err))

  revalidatePath('/client')
  revalidatePath('/coach/calendar')
  return { success: true }
}

export async function getClientDayPlannerData(dateStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  // 1. Récupérer les rendez-vous du client pour la date sélectionnée
  const startOfDay = `${dateStr}T00:00:00`
  const endOfDay = `${dateStr}T23:59:59`

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, profiles:coach_id(full_name, photo_url)')
    .eq('client_id', user.id)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .order('start_time', { ascending: true })

  const formattedAppointments = appointments?.map(apt => ({
    ...apt,
    coach_name: apt.profiles?.full_name,
    coach_photo: apt.profiles?.photo_url
  })) || []

  // 2. Récupérer les entraînements (assigned_sessions) du jour sélectionné
  const { data: sessions } = await supabase
    .from('assigned_sessions')
    .select('*')
    .eq('client_id', user.id)
    .eq('scheduled_date', dateStr)
    .order('created_at', { ascending: true })

  return {
    appointments: formattedAppointments,
    sessions: sessions || []
  }
}


