'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CalendarPlus, Dumbbell } from 'lucide-react'
import { assignWorkoutToClient } from './actions'

export function AssignWorkoutModal({ 
  clientId, 
  templates, 
  availabilities 
}: { 
  clientId: string, 
  templates: any[], 
  availabilities: any[] 
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Grouper les disponibilités par date
  const groupedAvails = availabilities.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = []
    acc[curr.date].push(curr)
    return acc
  }, {} as Record<string, any[]>)
  
  const sortedDates = Object.keys(groupedAvails).sort()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplateId || !selectedDate) {
      setError("Veuillez sélectionner un template et une date.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await assignWorkoutToClient(clientId, selectedTemplateId, selectedDate)
      setOpen(false)
      setSelectedTemplateId('')
      setSelectedDate('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="w-full sm:w-auto h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-foreground shadow-lg shadow-blue-600/20 transition-all">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Planifier une séance
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl">
        <form onSubmit={onSubmit} className="flex flex-col h-full">
          <div className="p-6 pb-4 border-b border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-blue-500" />
                Assigner un Entraînement
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Planifiez une séance en fonction des disponibilités de l'athlète.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            {templates.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-border rounded-xl bg-card">
                <p className="text-muted-foreground text-sm">Vous n'avez créé aucun template d'entraînement.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">1. Choisir la séance</label>
                  <select 
                    value={selectedTemplateId} 
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                  >
                    <option value="" disabled className="bg-muted/50 text-muted-foreground">Sélectionner...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id} className="bg-muted/50 text-foreground py-2">
                        {t.title} ({t.exercises?.length || 0} ex)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">2. Choisir une date (selon ses disponibilités)</label>
                  {sortedDates.length === 0 ? (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                      Attention : Cet athlète n'a renseigné aucune disponibilité.
                    </div>
                  ) : null}
                  <select 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                  >
                    <option value="" disabled className="bg-muted/50 text-muted-foreground">Sélectionner une date...</option>
                    {sortedDates.map(date => {
                      const slots = groupedAvails[date]
                      const dateStr = new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
                      const slotsStr = slots.map((s: any) => `${s.start_time.substring(0,5)}-${s.end_time.substring(0,5)}`).join(', ')
                      return (
                        <option key={date} value={date} className="bg-muted/50 text-foreground py-2">
                          {dateStr} (Dispo: {slotsStr})
                        </option>
                      )
                    })}
                    <option value="custom" className="bg-muted/50 text-blue-400 font-bold py-2">
                      Autre date (Forcer l'assignation)
                    </option>
                  </select>
                </div>

                {selectedDate === 'custom' && (
                  <div className="space-y-2 pt-2 animate-in fade-in zoom-in-95">
                    <label className="text-sm text-muted-foreground">Date personnalisée</label>
                    <input 
                      type="date" 
                      required 
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border bg-card mt-auto">
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-muted text-foreground">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading || templates.length === 0} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-foreground shadow-lg shadow-blue-600/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Assigner la séance'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
