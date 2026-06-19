'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPayment(clientId: string, title: string, amount: number, dueDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('payments')
    .insert({
      coach_id: user.id,
      client_id: clientId,
      title,
      amount,
      due_date: dueDate || null,
      status: 'pending'
    })

  if (error) throw new Error('Erreur lors de la création du paiement')

  revalidatePath('/coach/payments')
  return { success: true }
}

export async function updatePaymentStatus(paymentId: string, status: 'pending' | 'paid' | 'cancelled') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const updates: any = { status }
  if (status === 'paid') {
    updates.paid_at = new Date().toISOString()
  } else {
    updates.paid_at = null
  }

  const { error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', paymentId)
    .eq('coach_id', user.id)

  if (error) throw new Error('Erreur lors de la mise à jour du statut')

  revalidatePath('/coach/payments')
  return { success: true }
}

export async function deletePayment(paymentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('coach_id', user.id)

  if (error) throw new Error('Erreur lors de la suppression du paiement')

  revalidatePath('/coach/payments')
  return { success: true }
}
