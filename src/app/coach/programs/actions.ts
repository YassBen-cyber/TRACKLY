'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProgram(formData: FormData) {
  const supabase = await createClient()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const duration_days = parseInt(formData.get('duration_days') as string || '7', 10)

  const { data, error } = await supabase
    .from('programs')
    .insert({
      coach_id: userData.user.id,
      title,
      description,
      duration_days
    })
    .select()
    .single()

  if (error) {
    console.error('Create program error', error)
    return { error: error.message }
  }

  revalidatePath('/coach/programs')
  return { success: true, programId: data.id }
}

export async function deleteProgram(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete program error', error)
    return { error: error.message }
  }

  revalidatePath('/coach/programs')
  return { success: true }
}

export async function saveProgramSession(
  programId: string, 
  dayNumber: number, 
  data: { session_template_id?: string | null, title: string, exercises: any[] }
) {
  const supabase = await createClient()
  
  // Check if a session already exists for this day
  const { data: existing } = await supabase
    .from('program_sessions')
    .select('id')
    .eq('program_id', programId)
    .eq('day_number', dayNumber)
    .single()

  let error
  if (existing) {
    // Update
    const res = await supabase
      .from('program_sessions')
      .update({
        session_template_id: data.session_template_id || null,
        title: data.title,
        exercises: data.exercises,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
    error = res.error
  } else {
    // Insert
    const res = await supabase
      .from('program_sessions')
      .insert({
        program_id: programId,
        day_number: dayNumber,
        session_template_id: data.session_template_id || null,
        title: data.title,
        exercises: data.exercises
      })
    error = res.error
  }

  if (error) {
    console.error('Save program session error', error)
    return { error: error.message }
  }

  revalidatePath(`/coach/programs/${programId}`)
  return { success: true }
}

export async function deleteProgramSession(programId: string, dayNumber: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('program_sessions')
    .delete()
    .eq('program_id', programId)
    .eq('day_number', dayNumber)

  if (error) {
    console.error('Delete program session error', error)
    return { error: error.message }
  }

  revalidatePath(`/coach/programs/${programId}`)
  return { success: true }
}

export async function assignProgramToClient(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: 'Not authenticated' }

  const programId = formData.get('program_id') as string
  const clientId = formData.get('client_id') as string
  const startDateStr = formData.get('start_date') as string
  
  if (!programId || !clientId || !startDateStr) {
    return { error: 'Missing parameters' }
  }

  const startDate = new Date(startDateStr)

  // 1. Get the program sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('program_sessions')
    .select('*')
    .eq('program_id', programId)
    .order('day_number', { ascending: true })

  if (sessionsError) {
    return { error: sessionsError.message }
  }

  if (!sessions || sessions.length === 0) {
    return { error: 'Ce programme ne contient aucune séance.' }
  }

  // 2. Prepare assigned_sessions
  const sessionsToInsert = sessions.map(session => {
    // Calculate the scheduled date: startDate + (dayNumber - 1) days
    const scheduledDate = new Date(startDate)
    scheduledDate.setDate(scheduledDate.getDate() + (session.day_number - 1))
    
    return {
      client_id: clientId,
      coach_id: userData.user.id,
      template_id: session.session_template_id,
      title: session.title,
      scheduled_date: scheduledDate.toISOString().split('T')[0],
      exercises: session.exercises,
      status: 'planned'
    }
  })

  // 3. Insert all at once
  const { error: insertError } = await supabase
    .from('assigned_sessions')
    .insert(sessionsToInsert)

  if (insertError) {
    console.error('Assign program error', insertError)
    return { error: insertError.message }
  }

  revalidatePath(`/coach/client/${clientId}`)
  return { success: true }
}
