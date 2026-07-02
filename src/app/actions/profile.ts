'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  const fullName = formData.get('fullName') as string
  const photoUrl = formData.get('photoUrl') as string | null
  const password = formData.get('password') as string | null
  
  const dateOfBirth = formData.get('dateOfBirth') as string | null
  const address = formData.get('address') as string | null
  const medicalHistory = formData.get('medicalHistory') as string | null

  // Update auth password if provided
  if (password) {
    const { error: authError } = await supabase.auth.updateUser({
      password: password
    })
    if (authError) throw new Error('Erreur lors de la mise à jour du mot de passe')
  }

  // Update profile details
  const updateData: any = {
    full_name: fullName,
  }
  if (photoUrl !== null) {
    updateData.photo_url = photoUrl
  }
  if (dateOfBirth !== null) {
    updateData.date_of_birth = dateOfBirth || null
  }
  if (address !== null) {
    updateData.address = address || null
  }
  if (medicalHistory !== null) {
    updateData.medical_history = medicalHistory || null
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (profileError) {
    console.error(profileError)
    throw new Error('Erreur lors de la mise à jour du profil : ' + profileError.message)
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
