'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Plus, Trash2, Edit, Video, FileText } from 'lucide-react'
import { updateWorkoutTemplate } from './actions'
import { getCoachExercises } from '../exercises/actions'
import { ExerciseSearchPicker } from '@/components/exercise-search-picker'

type Exercise = {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
  video_url?: string;
}

export function EditWorkoutModal({ template }: { template: any }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [libraryExercises, setLibraryExercises] = useState<any[]>([])

  const [exercises, setExercises] = useState<Exercise[]>(
    template.exercises?.length ? template.exercises : [{ name: '', sets: '', reps: '', rest: '', notes: '', video_url: '' }]
  )

  useEffect(() => {
    if (open) {
      getCoachExercises().then(setLibraryExercises).catch(console.error)
    }
  }, [open])

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', rest: '', notes: '', video_url: '' }])
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    setExercises(newExercises)
  }

  const selectFromLibrary = (index: number, libraryId: string) => {
    if (!libraryId) return
    const selected = libraryExercises.find(ex => ex.id === libraryId)
    if (selected) {
      const newExercises = [...exercises]
      newExercises[index] = {
        ...newExercises[index],
        name: selected.name,
        notes: selected.notes || newExercises[index].notes,
        video_url: selected.video_url || newExercises[index].video_url
      }
      setExercises(newExercises)
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation basique
    const validExercises = exercises.filter(ex => ex.name.trim() !== '')
    if (validExercises.length === 0) {
      setError('Veuillez ajouter au moins un exercice valide.')
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    try {
      await updateWorkoutTemplate(template.id, formData, validExercises)
      setOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <Edit className="h-5 w-5" />
        </button>
      } />
      <DialogContent className="sm:max-w-[750px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 border-b border-border bg-card shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Modifier le Template
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Ajustez les exercices, séries, consignes ou vidéos du modèle de séance.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2 group">
                <Label htmlFor={`title-${template.id}`} className="text-muted-foreground group-focus-within:text-primary transition-colors">Nom de la séance</Label>
                <Input id={`title-${template.id}`} name="title" defaultValue={template.title} required placeholder="Ex: Full Body Hypertrophie" className="bg-card border-border h-11 rounded-xl text-foreground focus:border-primary/50" />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor={`desc-${template.id}`} className="text-muted-foreground group-focus-within:text-primary transition-colors">Description (Optionnelle)</Label>
                <Input id={`desc-${template.id}`} name="description" defaultValue={template.description || ''} placeholder="Ex: Séance axée sur le volume musculaire" className="bg-card border-border h-11 rounded-xl text-foreground focus:border-primary/50" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-foreground">Exercices</Label>
                <Button type="button" variant="outline" size="sm" onClick={addExercise} className="rounded-lg border-border text-primary hover:bg-primary/10">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter un exercice
                </Button>
              </div>

              <div className="space-y-4">
                {exercises.map((ex, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl p-4 space-y-3 relative group transition-all hover:border-primary/30">
                    <div className="flex items-center justify-between gap-2 pr-8">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                        Exercice #{idx + 1}
                      </span>
                      {libraryExercises.length > 0 && (
                        <ExerciseSearchPicker
                          libraryExercises={libraryExercises}
                          onSelect={(selected) => selectFromLibrary(idx, selected.id)}
                        />
                      )}
                    </div>

                    {exercises.length > 1 && (
                      <button type="button" onClick={() => removeExercise(idx)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Nom de l'exercice</Label>
                        <Input value={ex.name} onChange={(e) => updateExercise(idx, 'name', e.target.value)} required placeholder="Ex: Squat" className="h-9 bg-muted/40 border-border text-foreground rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Séries & Répétitions</Label>
                        <div className="flex gap-2">
                          <Input value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', e.target.value)} placeholder="Séries" className="h-9 bg-muted/40 border-border text-foreground rounded-lg w-1/2" />
                          <Input value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', e.target.value)} placeholder="Reps" className="h-9 bg-muted/40 border-border text-foreground rounded-lg w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Temps de Repos</Label>
                        <Input value={ex.rest} onChange={(e) => updateExercise(idx, 'rest', e.target.value)} placeholder="Repos" className="h-9 bg-muted/40 border-border text-foreground rounded-lg" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Video className="h-3 w-3 text-blue-400" /> Lien Vidéo Démo (Optionnel)
                        </Label>
                        <Input value={ex.video_url || ''} onChange={(e) => updateExercise(idx, 'video_url', e.target.value)} placeholder="Ex: https://youtube.com/watch?v=..." className="h-9 bg-muted/40 border-border text-foreground rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3 text-emerald-400" /> Consignes & Conseils (Optionnel)
                        </Label>
                        <Input value={ex.notes || ''} onChange={(e) => updateExercise(idx, 'notes', e.target.value)} placeholder="Consignes de la séance..." className="h-9 bg-muted/40 border-border text-foreground rounded-lg text-xs" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border bg-card shrink-0">
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-muted text-foreground">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
