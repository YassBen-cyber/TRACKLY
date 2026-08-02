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
import { Loader2, Plus, Dumbbell } from 'lucide-react'
import { createExercise } from './actions'

export function CreateExerciseModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
      await createExercise(formData)
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
        <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un exercice
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl">
        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="p-6 pb-4 border-b border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Nouvel Exercice
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Ajoutez un exercice à votre bibliothèque personnelle.
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
              <Label htmlFor="name" className="text-muted-foreground group-focus-within:text-primary transition-colors">Nom de l'exercice</Label>
              <Input id="name" name="name" required placeholder="Ex: Développé couché" className="bg-card border-border h-11 rounded-xl text-foreground focus:border-primary/50" />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="video_url" className="text-muted-foreground group-focus-within:text-primary transition-colors">Lien vidéo (Optionnel)</Label>
              <Input id="video_url" name="video_url" type="url" placeholder="Ex: https://youtube.com/watch?v=..." className="bg-card border-border h-11 rounded-xl text-foreground focus:border-primary/50" />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="notes" className="text-muted-foreground group-focus-within:text-primary transition-colors">Consignes / Notes par défaut (Optionnel)</Label>
              <Textarea id="notes" name="notes" placeholder="Ex: Coudes à 45 degrés, ne pas cambrer le dos..." className="bg-card border-border min-h-[100px] rounded-xl text-foreground focus:border-primary/50" />
            </div>
          </div>

          <div className="p-6 border-t border-border bg-card">
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-muted text-foreground">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Créer l\'exercice'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
