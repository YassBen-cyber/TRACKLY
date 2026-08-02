'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Plus, Trash2, Edit, Target } from 'lucide-react'
import { updateTemplate } from './actions'

type MetricField = {
  id: string
  name: string
  unit: string
}

export function EditTemplateModal({ template }: { template: any }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(template.name || '')
  const [description, setDescription] = useState(template.description || '')
  const [metrics, setMetrics] = useState<MetricField[]>(
    Array.isArray(template.metrics)
      ? template.metrics.map((m: any) => ({
          id: m.id || Math.random().toString(36).substring(7),
          name: m.name || '',
          unit: m.unit || ''
        }))
      : []
  )

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

    const res = await updateTemplate(template.id, {
      name,
      description,
      metrics
    })

    if (res.error) {
      setError(res.error)
    } else {
      setOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">
          <Edit className="h-4 w-4" />
        </Button>
      } />
      <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl">
        <form onSubmit={onSubmit} className="flex flex-col h-full max-h-[85vh]">
          <div className="p-6 pb-2 border-b border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Modifier le template d'objectif
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            {error && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-semibold">
                Nom du template d'objectif *
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Suivi Athlétisme, Prise de masse"
                className="bg-muted/50 border-border rounded-xl h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-semibold">
                Description (optionnelle)
              </Label>
              <Input
                id="edit-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex: Métriques clés pour la préparation physique"
                className="bg-muted/50 border-border rounded-xl h-11"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Métriques incluses</Label>
                  <p className="text-xs text-muted-foreground">Ajoutez les mesures que vos athlètes renseigneront.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addField}
                  className="rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter une métrique
                </Button>
              </div>

              <div className="space-y-3">
                {metrics.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    Aucune métrique ajoutée.
                  </p>
                )}

                {metrics.map((field) => (
                  <div key={field.id} className="flex items-center gap-3 bg-muted/30 p-3 rounded-2xl border border-border">
                    <div className="flex-1 space-y-1">
                      <Input
                        value={field.name}
                        onChange={e => updateField(field.id, { name: e.target.value })}
                        placeholder="Nom (ex: Poids, Détente)"
                        className="bg-card border-border rounded-xl h-9 text-sm"
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <Input
                        value={field.unit}
                        onChange={e => updateField(field.id, { unit: e.target.value })}
                        placeholder="Unité (ex: kg, cm)"
                        className="bg-card border-border rounded-xl h-9 text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(field.id)}
                      className="text-muted-foreground hover:text-red-500 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border bg-card flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground font-semibold rounded-xl"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
