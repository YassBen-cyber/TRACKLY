'use server'

import { createClient } from '@/utils/supabase/server'

export async function logoutAction() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Server logout error:', error)
  }
  return { success: true }
}
