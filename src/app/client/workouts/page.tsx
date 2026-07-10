import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClientWorkouts } from '../client-workouts'
import { Dumbbell } from 'lucide-react'

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: assignedSessions } = await supabase.from('assigned_sessions').select('*').eq('client_id', user.id).order('scheduled_date', { ascending: true })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <Dumbbell className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mes Entraînements</h1>
      </div>

      <div className="max-w-4xl">
        <ClientWorkouts sessions={assignedSessions || []} />
      </div>
    </div>
  )
}
