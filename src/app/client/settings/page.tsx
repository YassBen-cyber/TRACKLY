import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSettings } from '@/components/profile-settings'

export default async function ClientSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Paramètres</h2>
        <p className="text-zinc-600 mt-1">Gérez vos informations personnelles et de sécurité.</p>
      </div>

      <ProfileSettings profile={profile} />
    </div>
  )
}
