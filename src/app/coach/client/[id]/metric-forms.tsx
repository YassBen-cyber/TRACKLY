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
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          Créer un type de métrique
        </h3>
        <p className="text-sm text-muted-foreground mb-6">Ajoutez un nouveau standard de mesure pour vos athlètes (ex: Tour de taille, 1RM Bench).</p>
        
        <form onSubmit={handleAddType} className="space-y-4">
          <div className="space-y-2 group">
            <Label htmlFor="name" className="text-muted-foreground group-focus-within:text-primary transition-colors">Nom de la métrique</Label>
            <Input id="name" name="name" required placeholder="Ex: Poids de corps" className="bg-card border-border h-11 rounded-xl focus:border-primary/50 text-foreground" />
          </div>
          <div className="space-y-2 group">
            <Label htmlFor="unit" className="text-muted-foreground group-focus-within:text-primary transition-colors">Unité</Label>
            <Input id="unit" name="unit" required placeholder="Ex: kg, cm, secs" className="bg-card border-border h-11 rounded-xl focus:border-primary/50 text-foreground" />
          </div>
          <Button type="submit" disabled={loadingType} variant="outline" className="w-full h-11 rounded-xl bg-card border-border text-foreground hover:bg-muted hover:text-foreground transition-all">
            {loadingType ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Créer la métrique
          </Button>
        </form>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-primary" />
          Ajouter une valeur
        </h3>
        <p className="text-sm text-muted-foreground mb-6">Saisissez une nouvelle donnée pour cet athlète à une date précise.</p>

        {metricTypes.length === 0 ? (
          <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl text-sm font-medium">
            Vous devez d'abord créer au moins un "Type de Métrique" avant de pouvoir ajouter une valeur.
          </div>
        ) : (
          <form onSubmit={handleAddValue} className="space-y-4">
            <div className="space-y-2 group">
              <Label className="text-muted-foreground">Métrique</Label>
              <Select name="metricTypeId" required>
                <SelectTrigger className="bg-card border-border h-11 rounded-xl text-foreground">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="bg-muted/50 border-border text-foreground">
                  {metricTypes.map(m => (
                    <SelectItem key={m.id} value={m.id} className="hover:bg-muted focus:bg-muted focus:text-foreground">
                      {m.name} ({m.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <Label htmlFor="value" className="text-muted-foreground group-focus-within:text-primary transition-colors">Valeur</Label>
                <Input id="value" name="value" type="number" step="0.01" required placeholder="Ex: 85.5" className="bg-card border-border h-11 rounded-xl focus:border-primary/50 text-foreground" />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="date" className="text-muted-foreground group-focus-within:text-primary transition-colors">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={today} required className="bg-card border-border h-11 rounded-xl focus:border-primary/50 text-foreground dark:[color-scheme:dark]" />
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
