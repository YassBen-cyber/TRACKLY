'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCoachMetricValue(metricValueId: string, clientId: string, value: number, dateStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  // Verify client belongs to coach
  const { data: profile } = await supabase.from('profiles').select('coach_id').eq('id', clientId).single()
  if (profile?.coach_id !== user.id) {
    throw new Error('Non autorisé')
  }

  const { error } = await supabase
    .from('metric_values')
    .update({ 
      value,
      date: new Date(dateStr).toISOString()
    })
    .eq('id', metricValueId)
    .eq('client_id', clientId)

  if (error) throw new Error('Erreur lors de la modification')

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}

export async function deleteCoachMetricValue(metricValueId: string, clientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  // Verify client belongs to coach
  const { data: profile } = await supabase.from('profiles').select('coach_id').eq('id', clientId).single()
  if (profile?.coach_id !== user.id) {
    throw new Error('Non autorisé')
  }

  const { error } = await supabase
    .from('metric_values')
    .delete()
    .eq('id', metricValueId)
    .eq('client_id', clientId)

  if (error) throw new Error('Erreur lors de la suppression')

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}

export async function deleteMetricType(metricTypeId: string, clientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { data: profile } = await supabase.from('profiles').select('coach_id').eq('id', clientId).single()
  if (profile?.coach_id !== user.id) throw new Error('Non autorisé')

  await supabase.from('metric_values').delete().eq('metric_type_id', metricTypeId)

  const { error } = await supabase
    .from('metric_types')
    .delete()
    .eq('id', metricTypeId)
    .eq('client_id', clientId)

  if (error) throw new Error('Erreur lors de la suppression')

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}
