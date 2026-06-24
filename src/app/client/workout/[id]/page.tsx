import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { WorkoutDetailsClient } from './workout-details-client'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: session } = await supabase
    .from('assigned_sessions')
    .select('*')
    .eq('id', id)
    .eq('client_id', user.id)
    .single()

  if (!session) {
    redirect('/client')
  }

  // Fetch coach info to display on the PDF maybe
  const { data: coach } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', session.coach_id)
    .single()

  return (
    <div className="min-h-screen bg-[#F2F1ED] p-4 md:p-8">
      <WorkoutDetailsClient session={session} coachName={coach?.full_name} />
    </div>
  )
}
