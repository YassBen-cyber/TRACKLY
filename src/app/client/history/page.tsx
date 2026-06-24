import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClientWorkouts } from '../client-workouts'

export default async function ClientHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: assignedSessions } = await supabase
    .from('assigned_sessions')
    .select('*')
    .eq('client_id', user.id)
    .order('scheduled_date', { ascending: false })

  const pastSessions = assignedSessions?.filter(s => s.status !== 'pending') || []

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Historique des séances</h1>
        <p className="text-zinc-600 mt-1">Retrouvez toutes vos séances passées et vos retours.</p>
      </div>
      <ClientWorkouts sessions={pastSessions} />
    </div>
  )
}
