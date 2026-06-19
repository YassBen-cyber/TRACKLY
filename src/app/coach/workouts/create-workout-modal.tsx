'use client'

import { useState } from 'react'
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
import { Loader2, Plus, Trash2, Dumbbell } from 'lucide-react'
import { createWorkoutTemplate } from './actions'

type Exercise = {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
}

export function CreateWorkoutModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: '', reps: '', rest: '', notes: '' }])

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', rest: '', notes: '' }])
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises]
    newExercises[index][field] = value
    setExercises(newExercises)
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
      await createWorkoutTemplate(formData, validExercises)
      setOpen(false)
      setExercises([{ name: '', sets: '', reps: '', rest: '', notes: '' }])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Gabarit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-white border-zinc-300 text-zinc-900 rounded-2xl p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 border-b border-zinc-200 bg-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Créer un Gabarit de Séance
              </DialogTitle>
              <DialogDescription className="text-zinc-600">
                Créez un modèle d'entraînement réutilisable pour l'assigner rapidement à vos athlètes.
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
                <Label htmlFor="title" className="text-zinc-700 group-focus-within:text-primary transition-colors">Nom de la séance</Label>
                <Input id="title" name="title" required placeholder="Ex: Full Body Hypertrophie" className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900 focus:border-primary/50" />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="description" className="text-zinc-700 group-focus-within:text-primary transition-colors">Description (Optionnelle)</Label>
                <Input id="description" name="description" placeholder="Ex: Séance axée sur le volume musculaire" className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900 focus:border-primary/50" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-zinc-900">Exercices</Label>
                <Button type="button" variant="outline" size="sm" onClick={addExercise} className="rounded-lg border-zinc-300 text-primary hover:bg-primary/10">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>

              <div className="space-y-3">
                {exercises.map((ex, idx) => (
                  <div key={idx} className="bg-white border border-zinc-300 rounded-xl p-4 space-y-3 relative group transition-all hover:border-white/20">
                    {exercises.length > 1 && (
                      <button type="button" onClick={() => removeExercise(idx)} className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs text-zinc-600">Nom de l'exercice</Label>
                        <Input value={ex.name} onChange={(e) => updateExercise(idx, 'name', e.target.value)} required placeholder="Ex: Squat" className="h-9 bg-black/40 border-zinc-200 text-zinc-900 rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-600">Séries & Répétitions</Label>
                        <div className="flex gap-2">
                          <Input value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', e.target.value)} placeholder="Séries" className="h-9 bg-black/40 border-zinc-200 text-zinc-900 rounded-lg w-1/2" />
                          <Input value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', e.target.value)} placeholder="Reps" className="h-9 bg-black/40 border-zinc-200 text-zinc-900 rounded-lg w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-600">Repos & Notes</Label>
                        <div className="flex gap-2">
                          <Input value={ex.rest} onChange={(e) => updateExercise(idx, 'rest', e.target.value)} placeholder="Repos" className="h-9 bg-black/40 border-zinc-200 text-zinc-900 rounded-lg w-1/3" />
                          <Input value={ex.notes} onChange={(e) => updateExercise(idx, 'notes', e.target.value)} placeholder="Consignes" className="h-9 bg-black/40 border-zinc-200 text-zinc-900 rounded-lg flex-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-200 bg-white shrink-0">
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-zinc-100 text-zinc-900">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Créer le gabarit'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
