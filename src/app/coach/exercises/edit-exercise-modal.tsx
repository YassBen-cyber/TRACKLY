'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Edit, Dumbbell } from 'lucide-react'
import { updateExercise } from './actions'

export function EditExerciseModal({ exercise }: { exercise: any }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
      await updateExercise(exercise.id, formData)
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
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl">
        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="p-6 pb-4 border-b border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Modifier l'exercice
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Mettez à jour les informations de cet exercice.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2 group">
              <Label htmlFor={`name-${exercise.id}`} className="text-muted-foreground group-focus-within:text-primary transition-colors">Nom de l'exercice</Label>
              <Input id={`name-${exercise.id}`} name="name" defaultValue={exercise.name} required className="bg-card border-border h-11 rounded-xl text-foreground focus:border-primary/50" />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor={`video-${exercise.id}`} className="text-muted-foreground group-focus-within:text-primary transition-colors">Lien vidéo (Optionnel)</Label>
              <Input id={`video-${exercise.id}`} name="video_url" type="url" defaultValue={exercise.video_url || ''} className="bg-card border-border h-11 rounded-xl text-foreground focus:border-primary/50" />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor={`notes-${exercise.id}`} className="text-muted-foreground group-focus-within:text-primary transition-colors">Consignes / Notes par défaut (Optionnel)</Label>
              <Textarea id={`notes-${exercise.id}`} name="notes" defaultValue={exercise.notes || ''} className="bg-card border-border min-h-[100px] rounded-xl text-foreground focus:border-primary/50" />
            </div>
          </div>

          <div className="p-6 border-t border-border bg-card">
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
