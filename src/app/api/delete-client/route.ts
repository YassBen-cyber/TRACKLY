import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('id')

    if (!clientId) {
      return NextResponse.json({ error: 'ID du client requis' }, { status: 400 })
    }

    const supabaseAuth = await createServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Verify that the client belongs to the coach
    const { data: clientProfile } = await supabaseAuth
      .from('profiles')
      .select('coach_id')
      .eq('id', clientId)
      .single()

    if (!clientProfile || clientProfile.coach_id !== user.id) {
      return NextResponse.json({ error: 'Opération non autorisée sur ce client' }, { status: 403 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Deleting the user from auth.users will cascade to profiles and other tables
    const { error } = await supabaseAdmin.auth.admin.deleteUser(clientId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
