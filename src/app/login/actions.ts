'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?message=Email et mot de passe requis')
  }

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error.message)
    redirect('/login?message=Email ou mot de passe incorrect')
  }

  if (data.user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role) {
      redirect(`/${profile.role}`)
    }
  }

  redirect('/coach')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  
  if (!fullName || !email || !password) {
    redirect('/register?message=Tous les champs sont requis')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'coach',
      }
    }
  })

  if (error) {
    console.error("Signup error:", error.message)
    redirect(`/register?message=${error.message}`)
  }

  redirect('/register?success=Compte créé avec succès ! Veuillez vérifier vos e-mails pour l\'activer.')
}
