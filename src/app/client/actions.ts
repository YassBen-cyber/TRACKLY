'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAvailability(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const availabilityType = (formData.get('availabilityType') as string) || 'workout'

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

  revalidatePath('/client')
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

  revalidatePath('/client')
  revalidatePath('/coach/calendar')
  return { success: true }
}

