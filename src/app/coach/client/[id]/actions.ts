'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addMetricType(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const clientId = formData.get('clientId') as string
  const name = formData.get('name') as string
  const unit = formData.get('unit') as string

  // Vérifier si ce client appartient bien à ce coach
  const { data: profile } = await supabase.from('profiles').select('coach_id').eq('id', clientId).single()
  if (profile?.coach_id !== user.id) {
    throw new Error('Non autorisé')
  }

  const { data: newType, error } = await supabase
    .from('metric_types')
    .insert({ name, unit, client_id: clientId })
    .select('id')
    .single()

  if (error || !newType) {
    throw new Error('Erreur lors de la création de la métrique')
  }

  await supabase
    .from('metric_values')
    .insert({
      client_id: clientId,
      metric_type_id: newType.id,
      value: 0,
      date: new Date().toISOString()
    })

  if (clientId) {
    revalidatePath(`/coach/client/${clientId}`)
  }
}

export async function addMetricValue(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const clientId = formData.get('clientId') as string
  const metricTypeId = formData.get('metricTypeId') as string
  const valueStr = formData.get('value') as string
  const date = formData.get('date') as string

  // Vérifier si ce client appartient bien à ce coach
  const { data: profile } = await supabase.from('profiles').select('coach_id').eq('id', clientId).single()
  if (profile?.coach_id !== user.id) {
    throw new Error('Non autorisé')
  }

  const { error } = await supabase
    .from('metric_values')
    .insert({
      client_id: clientId,
      metric_type_id: metricTypeId,
      value: parseFloat(valueStr),
      date: new Date(date).toISOString()
    })

  if (error) {
    throw new Error("Erreur lors de l'ajout de la valeur")
  }

  revalidatePath(`/coach/client/${clientId}`)
}
export async function applyTemplateToClient(clientId: string, templateId: string) {
  // ... (keep existing implementation)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { data: template, error: tError } = await supabase
    .from('metric_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (tError || !template) throw new Error("Template introuvable")

  const metrics = template.metrics || []
  
  for (const m of metrics) {
    let { data: existingType } = await supabase
      .from('metric_types')
      .select('id')
      .eq('client_id', clientId)
      .eq('name', m.name)
      .single()

    let typeId = existingType?.id

    if (!typeId) {
      const { data: newType, error: insertError } = await supabase
        .from('metric_types')
        .insert({ client_id: clientId, name: m.name, unit: m.unit || '' })
        .select('id')
        .single()
        
      if (!insertError && newType) {
        typeId = newType.id
      }
    }

    if (typeId) {
      const { data: existingValue } = await supabase
        .from('metric_values')
        .select('id')
        .eq('client_id', clientId)
        .eq('metric_type_id', typeId)
        .limit(1)

      if (!existingValue || existingValue.length === 0) {
        await supabase
          .from('metric_values')
          .insert({
            client_id: clientId,
            metric_type_id: typeId,
            value: 0,
            date: new Date().toISOString()
          })
      }
    }
  }

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}

export async function assignWorkoutToClient(clientId: string, templateId: string, date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  // Récupérer le template de séance
  const { data: template, error: tError } = await supabase
    .from('session_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (tError || !template) throw new Error("Séance introuvable")

  // Assigner
  const { error } = await supabase
    .from('assigned_sessions')
    .insert({
      client_id: clientId,
      coach_id: user.id,
      template_id: templateId,
      title: template.title,
      scheduled_date: date,
      exercises: template.exercises
    })

  if (error) throw new Error("Erreur lors de l'assignation de la séance")

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}

export async function createCustomSessionToClient(clientId: string, title: string, date: string, exercises: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('assigned_sessions')
    .insert({
      client_id: clientId,
      coach_id: user.id,
      title,
      scheduled_date: date,
      exercises
    })

  if (error) throw new Error("Erreur lors de la création de la séance")

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}

export async function updateAssignedSession(sessionId: string, clientId: string, title: string, date: string, exercises: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('assigned_sessions')
    .update({
      title,
      scheduled_date: date,
      exercises
    })
    .eq('id', sessionId)
    .eq('coach_id', user.id)

  if (error) throw new Error("Erreur lors de la modification de la séance")

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}

export async function deleteAssignedSession(sessionId: string, clientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('assigned_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('coach_id', user.id)

  if (error) throw new Error("Erreur lors de la suppression de la séance")

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}

export async function updateCoachMetricValue(metricValueId: string, clientId: string, value: number, dateStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { data: profile } = await supabase.from('profiles').select('coach_id').eq('id', clientId).single()
  if (profile?.coach_id !== user.id) throw new Error('Non autorisé')

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

  const { data: profile } = await supabase.from('profiles').select('coach_id').eq('id', clientId).single()
  if (profile?.coach_id !== user.id) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('metric_values')
    .delete()
    .eq('id', metricValueId)
    .eq('client_id', clientId)

  if (error) throw new Error('Erreur lors de la suppression')

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}

export async function saveTrainingReport(appointmentId: string, publicSummary: string, privateNotes: string, clientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  // Verify coach owns this appointment
  const { data: appointment } = await supabase
    .from('appointments')
    .select('coach_id, status')
    .eq('id', appointmentId)
    .single()

  if (appointment?.coach_id !== user.id) {
    return { error: 'Non autorisé' }
  }

  // Upsert the training report
  const { error: reportError } = await supabase
    .from('training_reports')
    .upsert({
      appointment_id: appointmentId,
      public_summary: publicSummary,
      private_notes: privateNotes,
      updated_at: new Date().toISOString()
    }, { onConflict: 'appointment_id' })

  if (reportError) {
    console.error('Supabase error saving report:', reportError)
    return { error: `Erreur DB: ${reportError.message}` }
  }

  // Update appointment status to completed if not already
  if (appointment.status !== 'completed') {
    await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId)
  }

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}

export async function updateAppointmentStatus(appointmentId: string, status: string, clientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('coach_id', user.id)

  if (error) {
    console.error('Error updating status:', error)
    return { error: 'Erreur lors de la mise à jour du statut' }
  }

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

  if (error) throw new Error('Erreur lors de la suppression du type de métrique')

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}
