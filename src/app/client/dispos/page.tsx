import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClientAvailabilities } from '../client-availabilities'
import { Clock } from 'lucide-react'

export default async function DisposPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer les disponibilités du client
  const { data: availabilities } = await supabase
    .from('client_availabilities')
    .select('*')
    .eq('client_id', user.id)
    .order('date', { ascending: true })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
          <Clock className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mes Disponibilités</h1>
          <p className="text-muted-foreground text-sm">
            Indiquez vos créneaux libres pour informer votre coach de vos moments d'entraînement ou d'appel.
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ClientAvailabilities availabilities={availabilities || []} />
      </div>
    </div>
  )
}
