'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import { addAvailability, deleteAvailability } from './actions'

// Générer les créneaux horaires toutes les 30 minutes
const TIME_SLOTS: string[] = []
for (let h = 6; h <= 23; h++) {
  const hour = h.toString().padStart(2, '0')
  TIME_SLOTS.push(`${hour}:00`)
  TIME_SLOTS.push(`${hour}:30`)
}

export function ClientAvailabilities({ availabilities }: { availabilities: any[] }) {
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('19:00')

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    if (!date) {
      setError("Veuillez choisir une date.")
      return
    }

    // Validation des heures
    if (startTime >= endTime) {
      setError("L'heure de fin doit être postérieure à l'heure de début.")
      return
    }

    setLoadingAdd(true)
    const fd = new FormData()
    fd.append('date', date)
    fd.append('startTime', startTime)
    fd.append('endTime', endTime)

    try {
      await addAvailability(fd)
      setDate('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingAdd(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteAvailability(id)
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  // Grouper par date
  const grouped = availabilities.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = []
    acc[curr.date].push(curr)
    return acc
  }, {} as Record<string, any[]>)

  // Trier les dates
  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <CalendarIcon className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-zinc-900">Mes Disponibilités</h2>
      </div>
      <p className="text-zinc-600 text-sm mb-6">
        Indiquez les jours exacts où vous êtes disponible pour vous entraîner.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-zinc-300">
        <div className="flex-1">
          <Input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} 
            required 
            className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900 [color-scheme:dark] w-full" 
          />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <Select value={startTime} onValueChange={(val) => setStartTime(val || '')}>
            <SelectTrigger className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-50 border-zinc-300 text-zinc-900 max-h-60">
              {TIME_SLOTS.map(t => <SelectItem key={`start-${t}`} value={t} className="hover:bg-zinc-100 focus:bg-zinc-100 focus:text-zinc-900">{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-zinc-600">à</span>
          <Select value={endTime} onValueChange={(val) => setEndTime(val || '')}>
            <SelectTrigger className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-50 border-zinc-300 text-zinc-900 max-h-60">
              {TIME_SLOTS.map(t => <SelectItem key={`end-${t}`} value={t} className="hover:bg-zinc-100 focus:bg-zinc-100 focus:text-zinc-900">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={loadingAdd} className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 sm:w-auto w-full">
          {loadingAdd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Ajouter
        </Button>
      </form>

      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 bg-white rounded-2xl border border-dashed border-zinc-300">
            Aucune disponibilité renseignée.
          </div>
        ) : (
          sortedDates.map(dateStr => {
            const slots = grouped[dateStr].sort((a: any, b: any) => a.start_time.localeCompare(b.start_time))
            const formattedDate = new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
            
            return (
              <div key={dateStr} className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-40 font-semibold text-zinc-900 capitalize">
                  {formattedDate}
                </div>
                <div className="flex-1 flex flex-wrap gap-2">
                  {slots.map((slot: any) => (
                    <div key={slot.id} className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-sm">
                      <span>{slot.start_time.substring(0,5)} - {slot.end_time.substring(0,5)}</span>
                      <button 
                        onClick={() => handleDelete(slot.id)}
                        disabled={deletingId === slot.id}
                        className="ml-2 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        {deletingId === slot.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
