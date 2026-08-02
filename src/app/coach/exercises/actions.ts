'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createExercise(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const name = formData.get('name') as string
  const notes = formData.get('notes') as string
  const video_url = formData.get('video_url') as string

  const { error } = await supabase
    .from('exercises')
    .insert({
      coach_id: user.id,
      name,
      notes,
      video_url
    })

  if (error) throw new Error('Erreur lors de la création de l\'exercice')

  revalidatePath('/coach/exercises')
  return { success: true }
}

export async function updateExercise(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const name = formData.get('name') as string
  const notes = formData.get('notes') as string
  const video_url = formData.get('video_url') as string

  const { error } = await supabase
    .from('exercises')
    .update({
      name,
      notes,
      video_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error('Erreur lors de la modification de l\'exercice')

  revalidatePath('/coach/exercises')
  return { success: true }
}

export async function deleteExercise(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error('Erreur lors de la suppression')

  revalidatePath('/coach/exercises')
}

export async function getCoachExercises() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('coach_id', user.id)
    .order('name', { ascending: true })

  if (error) return []
  return data || []
}
