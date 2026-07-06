import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarRange } from 'lucide-react'
import { ProgramGrid } from './program-grid'

export default async function ProgramDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the program
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .eq('coach_id', user.id)
    .single()

  if (!program) {
    redirect('/coach/programs')
  }

  // Fetch program sessions
  const { data: programSessions } = await supabase
    .from('program_sessions')
    .select('*')
    .eq('program_id', program.id)

  // Fetch coach's session templates
  const { data: sessionTemplates } = await supabase
    .from('session_templates')
    .select('*')
    .eq('coach_id', user.id)
    .order('title')

  return (
    <div className="space-y-6">
      <Link href="/coach/programs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux programmes
      </Link>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-8">
        <div className="border-b border-border pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarRange className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">{program.title}</h2>
          </div>
          {program.description && (
            <p className="text-muted-foreground mt-2 max-w-3xl">{program.description}</p>
          )}
          <div className="mt-4 flex gap-3">
            <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium border border-border">
              Durée : {program.duration_days} jours
            </div>
            <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium border border-border">
              Séances configurées : {programSessions?.length || 0}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-foreground">Configuration des jours</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Cliquez sur un jour pour lui assigner une séance d'entraînement. Les jours vides seront considérés comme des jours de repos.
          </p>

          <ProgramGrid 
            program={program} 
            programSessions={programSessions || []} 
            sessionTemplates={sessionTemplates || []} 
          />
        </div>
      </div>
    </div>
  )
}
