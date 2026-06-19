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

  const { error } = await supabase
    .from('client_availabilities')
    .insert({
      client_id: user.id,
      date: date,
      start_time: startTime,
      end_time: endTime
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
