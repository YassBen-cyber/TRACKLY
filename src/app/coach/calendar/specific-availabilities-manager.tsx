'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, Calendar as CalendarIcon, Loader2, Copy } from 'lucide-react'
import { addSpecificAvailability, deleteSpecificAvailability, applyWeeklyTemplate } from './actions'

export function SpecificAvailabilitiesManager({ specificAvailabilities }: { specificAvailabilities: any[] }) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  
  const [targetWeekDate, setTargetWeekDate] = useState('')

  const [isLoadingAdd, setIsLoadingAdd] = useState(false)
  const [isLoadingApply, setIsLoadingApply] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !startTime || !endTime) return
    if (startTime >= endTime) {
      alert("L'heure de fin doit être après l'heure de début")
      return
    }

    setIsLoadingAdd(true)
    try {
      await addSpecificAvailability(date, startTime, endTime)
      // Reset form
      setDate('')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsLoadingAdd(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteSpecificAvailability(id)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditSave = async (id: string) => {
    if (editStartTime >= editEndTime) {
      alert("L'heure de fin doit être après l'heure de début")
      return
    }
    setIsLoadingEdit(true)
    try {
      // Assuming updateSpecificAvailability is exported from actions
      const { updateSpecificAvailability } = await import('./actions')
      await updateSpecificAvailability(id, editStartTime, editEndTime)
      setEditingId(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsLoadingEdit(false)
    }
  }

  const startEdit = (avail: any) => {
    setEditingId(avail.id)
    setEditStartTime(avail.start_time.substring(0, 5))
    setEditEndTime(avail.end_time.substring(0, 5))
  }

  const handleApplyTemplate = async () => {
    if (!targetWeekDate) {
      alert("Veuillez choisir un jour (la semaine de ce jour sera ciblée).")
      return
    }
    
    // Obtenir le lundi de la semaine cible
    const d = new Date(targetWeekDate)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // ajuster pour le lundi
    const monday = new Date(d.setDate(diff))
    
    setIsLoadingApply(true)
    try {
      const year = monday.getFullYear();
      const month = String(monday.getMonth() + 1).padStart(2, '0');
      const dayStr = String(monday.getDate()).padStart(2, '0');
      const localMondayStr = `${year}-${month}-${dayStr}`;

      await applyWeeklyTemplate(localMondayStr)
      alert("Modèle hebdomadaire appliqué avec succès !")
      setTargetWeekDate('')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsLoadingApply(false)
    }
  }

  // Grouper les dispos spécifiques par date
  const grouped = specificAvailabilities.reduce((acc: any, avail: any) => {
    if (!acc[avail.date]) acc[avail.date] = []
    acc[avail.date].push(avail)
    return acc
  }, {})

  // Trier les dates de la plus récente à la plus ancienne (ou inversement)
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return (
    <div className="space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Ajouter une disponibilité spécifique */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Ajouter une disponibilité
            </h3>
            <p className="text-sm text-zinc-500 mt-1">Ouvrez un créneau à une date précise.</p>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required 
                className="bg-zinc-50 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Début</Label>
                <Input 
                  type="time" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)} 
                  required 
                  className="bg-zinc-50 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Fin</Label>
                <Input 
                  type="time" 
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)} 
                  required 
                  className="bg-zinc-50 rounded-xl"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoadingAdd} className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
              {isLoadingAdd ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Ajouter le créneau
            </Button>
          </form>
        </div>

        {/* Appliquer le modèle de semaine */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6 flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Copy className="h-5 w-5 text-blue-500" />
              Générer une semaine
            </h3>
            <p className="text-sm text-zinc-500 mt-1">Copiez vos "Horaires Types" sur une semaine précise.</p>
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label>Choisir une date dans la semaine ciblée</Label>
              <Input 
                type="date" 
                value={targetWeekDate} 
                onChange={e => setTargetWeekDate(e.target.value)} 
                className="bg-zinc-50 rounded-xl"
              />
              <p className="text-xs text-zinc-400">Le système générera les créneaux du Lundi au Dimanche de cette semaine-là.</p>
            </div>
          </div>
          
          <Button type="button" onClick={handleApplyTemplate} disabled={isLoadingApply || !targetWeekDate} variant="outline" className="w-full rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
            {isLoadingApply ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Appliquer les horaires types'}
          </Button>
        </div>
      </div>

      {/* Liste des disponibilités spécifiques */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 mb-6">Vos créneaux ouverts par date</h3>
        
        {sortedDates.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 italic bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            Aucune disponibilité spécifique enregistrée.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(d => (
              <div key={d} className="space-y-3">
                <div className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                  {new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {grouped[d].sort((a: any, b: any) => a.start_time.localeCompare(b.start_time)).map((avail: any) => (
                    <div key={avail.id} className="flex flex-col gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                      {editingId === avail.id ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Input type="time" value={editStartTime} onChange={e=>setEditStartTime(e.target.value)} className="h-8 text-xs" />
                            <Input type="time" value={editEndTime} onChange={e=>setEditEndTime(e.target.value)} className="h-8 text-xs" />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>Annuler</Button>
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleEditSave(avail.id)} disabled={isLoadingEdit}>
                              {isLoadingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ok'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-zinc-700">
                            {avail.start_time.substring(0, 5)} - {avail.end_time.substring(0, 5)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              onClick={() => startEdit(avail)}
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              onClick={() => handleDelete(avail.id)}
                              disabled={deletingId === avail.id}
                            >
                              {deletingId === avail.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
