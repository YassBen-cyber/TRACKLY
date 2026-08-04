import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Dumbbell, Video, FileText } from 'lucide-react'
import { CreateExerciseModal } from './create-exercise-modal'
import { EditExerciseModal } from './edit-exercise-modal'
import { DeleteExerciseButton } from './delete-exercise-button'
import { ExerciseDetailsModal } from '@/components/exercise-details-modal'

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .eq('coach_id', user.id)
    .order('name', { ascending: true })

  return (
    <div className="space-y-6 sm:space-y-8 px-1 sm:px-0">
      <div className="glass-panel p-5 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Dumbbell className="h-6 w-6 text-primary shrink-0" />
            Bibliothèque d'Exercices
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Gérez vos exercices, vidéos d'exécution et consignes par défaut.
          </p>
        </div>
        <div className="w-full sm:w-auto pt-2 sm:pt-0">
          <CreateExerciseModal />
        </div>
      </div>

      {(!exercises || exercises.length === 0) ? (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center border border-border border-dashed space-y-4">
          <Dumbbell className="h-12 w-12 text-primary/50 mx-auto" />
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">Aucun exercice enregistré</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Votre bibliothèque est encore vide. Ajoutez vos exercices favoris pour construire vos séances en 1 clic.
            </p>
          </div>
          <CreateExerciseModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {exercises.map(exercise => (
            <div key={exercise.id} className="glass-panel p-5 sm:p-7 rounded-3xl flex flex-col group hover:border-primary/30 transition-all border border-border/80 shadow-sm hover:shadow-md">
              <div className="flex justify-between items-center mb-4 gap-2">
                <div className="shrink-0 text-primary">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <EditExerciseModal exercise={exercise} />
                  <DeleteExerciseButton id={exercise.id} />
                </div>
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 leading-snug">{exercise.name}</h3>
              
              <div className="mt-auto space-y-3 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {exercise.video_url ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                      <Video className="h-3.5 w-3.5" />
                      <span>Vidéo intégrée</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground/60 italic">Sans vidéo</span>
                  )}
                  
                  {(exercise.video_url || exercise.notes) && (
                    <ExerciseDetailsModal exercise={exercise} />
                  )}
                </div>

                {exercise.notes && (
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 p-3 rounded-2xl border border-border/40">
                    <FileText className="h-4 w-4 mt-0.5 shrink-0 text-emerald-400" />
                    <p className="line-clamp-3 leading-relaxed whitespace-pre-wrap break-words">{exercise.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
