'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addMetricType, addMetricValue } from './actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Activity } from 'lucide-react'

export function MetricForms({ clientId, metricTypes }: { clientId: string, metricTypes: any[] }) {
  const [loadingType, setLoadingType] = useState(false)
  const [loadingValue, setLoadingValue] = useState(false)
  
  const today = new Date().toISOString().split('T')[0]

  async function handleAddType(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingType(true)
    const fd = new FormData(e.currentTarget)
    fd.append('clientId', clientId)
    try {
      await addMetricType(fd)
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingType(false)
    }
  }

  async function handleAddValue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingValue(true)
    const fd = new FormData(e.currentTarget)
    fd.append('clientId', clientId)
    try {
      await addMetricValue(fd)
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingValue(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          Créer un type de métrique
        </h3>
        <p className="text-sm text-zinc-600 mb-6">Ajoutez un nouveau standard de mesure pour vos athlètes (ex: Tour de taille, 1RM Bench).</p>
        
        <form onSubmit={handleAddType} className="space-y-4">
          <div className="space-y-2 group">
            <Label htmlFor="name" className="text-zinc-700 group-focus-within:text-primary transition-colors">Nom de la métrique</Label>
            <Input id="name" name="name" required placeholder="Ex: Poids de corps" className="bg-white border-zinc-300 h-11 rounded-xl focus:border-primary/50 text-zinc-900" />
          </div>
          <div className="space-y-2 group">
            <Label htmlFor="unit" className="text-zinc-700 group-focus-within:text-primary transition-colors">Unité</Label>
            <Input id="unit" name="unit" required placeholder="Ex: kg, cm, secs" className="bg-white border-zinc-300 h-11 rounded-xl focus:border-primary/50 text-zinc-900" />
          </div>
          <Button type="submit" disabled={loadingType} variant="outline" className="w-full h-11 rounded-xl bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 transition-all">
            {loadingType ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Créer la métrique
          </Button>
        </form>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-primary" />
          Ajouter une valeur
        </h3>
        <p className="text-sm text-zinc-600 mb-6">Saisissez une nouvelle donnée pour cet athlète à une date précise.</p>

        {metricTypes.length === 0 ? (
          <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl text-sm font-medium">
            Vous devez d'abord créer au moins un "Type de Métrique" avant de pouvoir ajouter une valeur.
          </div>
        ) : (
          <form onSubmit={handleAddValue} className="space-y-4">
            <div className="space-y-2 group">
              <Label className="text-zinc-700">Métrique</Label>
              <Select name="metricTypeId" required>
                <SelectTrigger className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-50 border-zinc-300 text-zinc-900">
                  {metricTypes.map(m => (
                    <SelectItem key={m.id} value={m.id} className="hover:bg-zinc-100 focus:bg-zinc-100 focus:text-zinc-900">
                      {m.name} ({m.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <Label htmlFor="value" className="text-zinc-700 group-focus-within:text-primary transition-colors">Valeur</Label>
                <Input id="value" name="value" type="number" step="0.01" required placeholder="Ex: 85.5" className="bg-white border-zinc-300 h-11 rounded-xl focus:border-primary/50 text-zinc-900" />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="date" className="text-zinc-700 group-focus-within:text-primary transition-colors">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={today} required className="bg-white border-zinc-300 h-11 rounded-xl focus:border-primary/50 text-zinc-900 [color-scheme:dark]" />
              </div>
            </div>

            <Button type="submit" disabled={loadingValue} className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_rgba(var(--color-primary),0.3)] transition-all hover:scale-[1.02]">
              {loadingValue ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer la donnée'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
