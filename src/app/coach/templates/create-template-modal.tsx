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
import { Loader2, Plus, Trash2, Target } from 'lucide-react'
import { createTemplate } from './actions'

type MetricField = {
  id: string
  name: string
  unit: string
}

export function CreateTemplateModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [metrics, setMetrics] = useState<MetricField[]>([])

  const addField = () => {
    setMetrics([
      ...metrics,
      { id: Math.random().toString(36).substring(7), name: '', unit: '' }
    ])
  }

  const updateField = (id: string, updates: Partial<MetricField>) => {
    setMetrics(metrics.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeField = (id: string) => {
    setMetrics(metrics.filter(f => f.id !== id))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (!name.trim()) {
      setError("Le nom de l'objectif est obligatoire.")
      setIsLoading(false)
      return
    }

    if (metrics.some(f => !f.name.trim())) {
      setError('Toutes les métriques doivent avoir un nom.')
      setIsLoading(false)
      return
    }

    const res = await createTemplate(userId, {
      name,
      description,
      metrics
    })

    if (res.error) {
      setError(res.error)
    } else {
      setOpen(false)
      // Reset form
      setName('')
      setDescription('')
      setMetrics([])
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Gabarit
        </Button>
      } />
      <DialogContent className="sm:max-w-[600px] bg-white border-zinc-300 text-zinc-900 rounded-2xl p-0 overflow-hidden shadow-2xl">
        <form onSubmit={onSubmit} className="flex flex-col h-full max-h-[85vh]">
          <div className="p-6 pb-2 border-b border-zinc-200 bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Créer un gabarit d'objectif
              </DialogTitle>
              <DialogDescription className="text-zinc-600">
                Définissez un groupe de métriques pour un objectif précis (ex: Prise de masse) pour pouvoir l'assigner à vos clients.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-700">Nom de l'objectif</Label>
                <Input
                  id="name"
                  placeholder="Ex: Basket, Prise de Masse, Remise en forme..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 focus-visible:ring-primary h-11 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-700">Description (optionnel)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Suivi des performances pour les meneurs"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 focus-visible:ring-primary h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-zinc-900">Métriques à suivre</h3>
                  <p className="text-sm text-zinc-600">Ex: Poids (kg), Note globale (/10), Réussite 3pts (%)</p>
                </div>
                <Button type="button" onClick={addField} variant="outline" size="sm" className="border-zinc-300 hover:bg-zinc-100 text-zinc-900 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
              </div>

              {metrics.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-zinc-300 rounded-xl bg-white">
                  <p className="text-zinc-600 text-sm">Aucune métrique. Cliquez sur Ajouter pour commencer.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.map((field) => (
                    <div key={field.id} className="flex gap-2 items-start bg-white p-3 rounded-xl border border-zinc-200">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Nom (ex: Poids, Note technique...)"
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          className="bg-white border-zinc-300 h-10 rounded-lg text-sm"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          placeholder="Unité (ex: kg, /10)"
                          value={field.unit}
                          onChange={(e) => updateField(field.id, { unit: e.target.value })}
                          className="bg-white border-zinc-300 h-10 rounded-lg text-sm"
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeField(field.id)} className="h-10 w-10 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-zinc-200 bg-white mt-auto">
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-zinc-100 text-zinc-900">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Créer le gabarit
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
