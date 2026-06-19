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
import { Loader2, Plus, Trash2, Edit } from 'lucide-react'
import { updateAssignedSession, deleteAssignedSession } from './actions'

type Exercise = {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
}

export function EditAssignedSessionModal({ 
  clientId, 
  session 
}: { 
  clientId: string, 
  session: any
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState(session.title)
  const [date, setDate] = useState(session.scheduled_date)
  const [exercises, setExercises] = useState<Exercise[]>(session.exercises || [])

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

    const validExercises = exercises.filter(ex => ex.name.trim() !== '')

    try {
      await updateAssignedSession(session.id, clientId, title, date, validExercises)
      setOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette séance ?")) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAssignedSession(session.id, clientId)
      setOpen(false)
    } catch (err: any) {
      setError(err.message)
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-zinc-600 hover:text-zinc-900 transition-colors" title="Modifier ou supprimer">
          <Edit className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-white border-zinc-300 text-zinc-900 rounded-2xl p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 border-b border-zinc-200 bg-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-500" />
                Modifier la séance assignée
              </DialogTitle>
              <DialogDescription className="text-zinc-600">
                Ajustez les exercices spécifiquement pour cet athlète ou supprimez la séance.
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
                <Label className="text-zinc-700 group-focus-within:text-blue-500 transition-colors">Nom de la séance</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900 focus:border-blue-500/50" />
              </div>
              <div className="space-y-2 group">
                <Label className="text-zinc-700 group-focus-within:text-blue-500 transition-colors">Date de la séance</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900 focus:border-blue-500/50 [color-scheme:dark]" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-zinc-900">Exercices</Label>
                <Button type="button" variant="outline" size="sm" onClick={addExercise} className="rounded-lg border-zinc-300 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>

              <div className="space-y-3">
                {exercises.length === 0 && <p className="text-sm text-zinc-500 italic">Aucun exercice.</p>}
                {exercises.map((ex, idx) => (
                  <div key={idx} className="bg-white border border-zinc-300 rounded-xl p-4 space-y-3 relative group transition-all hover:border-white/20">
                    <button type="button" onClick={() => removeExercise(idx)} className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
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
            <DialogFooter className="flex justify-between sm:justify-between w-full">
              <Button type="button" onClick={handleDelete} disabled={isDeleting || isLoading} className="rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none shadow-none">
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Supprimer la séance
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-zinc-100 text-zinc-900">
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading || isDeleting} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-zinc-900 shadow-lg shadow-blue-600/20">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sauvegarder'}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
