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
import { Loader2, Settings2, Trash2, Plus } from 'lucide-react'
import { setAvailabilities } from './actions'

const DAYS = [
  { id: 1, name: 'Lundi' },
  { id: 2, name: 'Mardi' },
  { id: 3, name: 'Mercredi' },
  { id: 4, name: 'Jeudi' },
  { id: 5, name: 'Vendredi' },
  { id: 6, name: 'Samedi' },
  { id: 0, name: 'Dimanche' },
]

export function AvailabilitiesModal({ initialAvailabilities }: { initialAvailabilities: any[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // On transforme les données initiales pour l'UI
  const [slots, setSlots] = useState<{ day_of_week: number, start_time: string, end_time: string }[]>(
    initialAvailabilities.map(a => ({
      day_of_week: a.day_of_week,
      start_time: a.start_time.substring(0, 5),
      end_time: a.end_time.substring(0, 5)
    }))
  )

  const addSlot = (dayId: number) => {
    setSlots([...slots, { day_of_week: dayId, start_time: '09:00', end_time: '18:00' }])
  }

  const updateSlot = (index: number, field: 'start_time' | 'end_time', value: string) => {
    const newSlots = [...slots]
    newSlots[index][field] = value
    setSlots(newSlots)
  }

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Vérification que start_time < end_time
    for (const s of slots) {
      if (s.start_time >= s.end_time) {
        setError(`L'heure de fin doit être supérieure à l'heure de début.`)
        setIsLoading(false)
        return
      }
    }

    try {
      await setAvailabilities(slots)
      setOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-zinc-300 hover:bg-zinc-100 text-zinc-900">
          <Settings2 className="mr-2 h-4 w-4" />
          Mes Horaires Types
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white border-zinc-300 text-zinc-900 rounded-2xl p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 border-b border-zinc-200 bg-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Semaine Type
              </DialogTitle>
              <DialogDescription className="text-zinc-600">
                Définissez vos horaires de travail récurrents. Les clients ne pourront prendre rendez-vous que sur ces plages.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {DAYS.map(day => {
                const daySlots = slots.map((s, idx) => ({ ...s, originalIndex: idx })).filter(s => s.day_of_week === day.id)
                
                return (
                  <div key={day.id} className="border-b border-zinc-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-md font-semibold text-zinc-900 w-24">{day.name}</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => addSlot(day.id)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 px-2 rounded-lg">
                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                      </Button>
                    </div>

                    {daySlots.length === 0 ? (
                      <div className="text-sm text-zinc-500 italic pl-24">Non disponible</div>
                    ) : (
                      <div className="space-y-2 pl-2 sm:pl-24">
                        {daySlots.map((slot) => (
                          <div key={slot.originalIndex} className="flex items-center gap-2">
                            <Input 
                              type="time" 
                              value={slot.start_time} 
                              onChange={e => updateSlot(slot.originalIndex, 'start_time', e.target.value)}
                              required 
                              className="w-32 bg-black/40 border-zinc-300 text-zinc-900 rounded-lg h-9 [color-scheme:dark]" 
                            />
                            <span className="text-zinc-500">-</span>
                            <Input 
                              type="time" 
                              value={slot.end_time} 
                              onChange={e => updateSlot(slot.originalIndex, 'end_time', e.target.value)}
                              required 
                              className="w-32 bg-black/40 border-zinc-300 text-zinc-900 rounded-lg h-9 [color-scheme:dark]" 
                            />
                            <button type="button" onClick={() => removeSlot(slot.originalIndex)} className="text-zinc-500 hover:text-red-400 p-2">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-6 border-t border-zinc-200 bg-white shrink-0">
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-zinc-100 text-zinc-900">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enregistrer mes horaires'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
