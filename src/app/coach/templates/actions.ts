'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTemplate(coachId: string, data: { name: string, description: string, metrics: any[] }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('metric_templates')
    .insert({
      coach_id: coachId,
      name: data.name,
      description: data.description,
      metrics: data.metrics
    })

  if (error) {
    console.error('Create template error', error)
    return { error: error.message }
  }

  revalidatePath('/coach/templates')
  return { success: true }
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('metric_templates')
    .delete()
    .eq('id', templateId)

  if (error) {
    console.error('Delete template error', error)
    return { error: error.message }
  }

  revalidatePath('/coach/templates')
  return { success: true }
}
