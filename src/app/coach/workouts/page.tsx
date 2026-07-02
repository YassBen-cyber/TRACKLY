import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Dumbbell, Calendar as CalendarIcon } from 'lucide-react'
import { CreateWorkoutModal } from './create-workout-modal'
import { Button } from '@/components/ui/button'

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: templates } = await supabase
    .from('session_templates')
    .select('*')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Bibliothèque de Séances
          </h2>
          <p className="text-muted-foreground mt-1">
            Créez vos templates d'entraînements pour les assigner facilement à vos athlètes.
          </p>
        </div>
        <CreateWorkoutModal />
      </div>

      {(!templates || templates.length === 0) ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-border border-dashed">
          <Dumbbell className="h-12 w-12 text-primary/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Aucun template de séance</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Vous n'avez pas encore créé de séance type. Commencez par créer votre premier template avec les exercices, séries et répétitions !
          </p>
          <CreateWorkoutModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="glass-panel p-6 rounded-3xl flex flex-col group hover:border-primary/30 transition-all border border-border">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/20 p-3 rounded-2xl">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2">{template.title}</h3>
              {template.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>
              )}
              
              <div className="mt-auto space-y-3 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground font-medium">
                  {template.exercises?.length || 0} exercice(s)
                </div>
                <div className="space-y-1">
                  {template.exercises?.slice(0, 3).map((ex: any, idx: number) => (
                    <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                      {ex.name} <span className="opacity-50">({ex.sets}x{ex.reps})</span>
                    </div>
                  ))}
                  {template.exercises?.length > 3 && (
                    <div className="text-xs text-gray-600 italic pl-3">
                      + {template.exercises.length - 3} autres exercices...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
