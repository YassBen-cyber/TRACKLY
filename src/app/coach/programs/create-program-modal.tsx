'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { createProgram } from './actions'

export function CreateProgramModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const res = await createProgram(formData)
    setIsLoading(false)

    if (res?.success) {
      setOpen(false)
      // Redirect to the program configuration page
      router.push(`/coach/programs/${res.programId}`)
    } else {
      alert(res?.error || 'Une erreur est survenue')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-lg transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Programme
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-background border-border rounded-3xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-light text-foreground">Créer un programme</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Définissez le nom et la durée totale du programme. Vous pourrez ajouter les séances ensuite.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">Nom du programme</label>
            <Input 
              id="title" 
              name="title" 
              placeholder="Ex: Sèche 4 Semaines, Prise de Masse..." 
              required 
              className="bg-card border-border rounded-xl h-11"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">Description (optionnel)</label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Objectifs, pré-requis..." 
              className="bg-card border-border rounded-xl resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="duration_days" className="text-sm font-medium text-foreground">Durée (en jours)</label>
            <Input 
              id="duration_days" 
              name="duration_days" 
              type="number" 
              min="1" 
              max="365"
              defaultValue="7"
              required 
              className="bg-card border-border rounded-xl h-11"
            />
          </div>
          
          <DialogFooter className="pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="rounded-xl font-medium border-border hover:bg-muted"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl font-medium shadow-md">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Créer le programme"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
