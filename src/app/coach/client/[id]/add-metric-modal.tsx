'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { addMetricType } from './actions'

export function AddMetricModal({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Veuillez entrer un nom pour la métrique.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('clientId', clientId)
      formData.append('name', name)
      formData.append('unit', unit)

      await addMetricType(formData)
      setOpen(false)
      setName('')
      setUnit('')
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="h-11 rounded-xl bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-all">
          <Activity className="mr-2 h-4 w-4" />
          Ajouter une métrique
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-white border-zinc-300 text-zinc-900 rounded-2xl">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Nouvelle métrique
            </DialogTitle>
            <DialogDescription className="text-zinc-600">
              Ajoutez une métrique personnalisée pour ce client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-700">Nom de la métrique</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Poids, Tour de taille..."
                className="bg-white border-zinc-300 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-zinc-700">Unité (optionnel)</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="ex: kg, cm..."
                className="bg-white border-zinc-300 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
