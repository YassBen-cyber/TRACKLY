import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, fullName } = await request.json()

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Email et nom complet requis' }, { status: 400 })
    }

    const supabaseAuth = await createServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'La clé SUPABASE_SERVICE_ROLE_KEY est manquante dans le fichier .env.local' }, { status: 500 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        redirectTo: `${origin}/auth/callback`,
        data: {
          full_name: fullName,
          role: 'client',
          coach_id: user.id
        }
      }
    })

    if (error) throw error

    const hashedToken = data.properties.hashed_token
    const customLink = `${origin}/auth/callback?token_hash=${hashedToken}&type=invite`

    return NextResponse.json({ success: true, link: customLink })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
