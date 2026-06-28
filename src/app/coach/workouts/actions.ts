'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWorkoutTemplate(formData: FormData, exercises: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('session_templates')
    .insert({
      coach_id: user.id,
      title,
      description,
      exercises
    })

  if (error) throw new Error('Erreur lors de la création du template')

  revalidatePath('/coach/workouts')
  return { success: true }
}

export async function deleteWorkoutTemplate(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const { error } = await supabase
    .from('session_templates')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error('Erreur lors de la suppression')

  revalidatePath('/coach/workouts')
}
