'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Plus, Calendar } from 'lucide-react'
import { createAppointment } from './actions'

export function CreateAppointmentModal({ clients }: { clients: any[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [notes, setNotes] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!clientId || !date || !startTime || !endTime) {
      setError("Veuillez remplir tous les champs obligatoires.")
      setIsLoading(false)
      return
    }

    if (startTime >= endTime) {
      setError("L'heure de fin doit être après l'heure de début.")
      setIsLoading(false)
      return
    }

    // Création des TIMESTAMPTZ
    const startIso = new Date(`${date}T${startTime}:00`).toISOString()
    const endIso = new Date(`${date}T${endTime}:00`).toISOString()

    try {
      await createAppointment(clientId, title || 'Rendez-vous', startIso, endIso, notes, meetingUrl)
      setOpen(false)
      // Reset form
      setClientId('')
      setTitle('')
      setDate('')
      setStartTime('')
      setEndTime('')
      setMeetingUrl('')
      setNotes('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-zinc-900 shadow-lg shadow-blue-600/20 transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Rendez-vous
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white border-zinc-300 text-zinc-900 rounded-2xl p-0 overflow-hidden shadow-2xl">
        <form onSubmit={onSubmit} className="flex flex-col h-full">
          <div className="p-6 pb-4 border-b border-zinc-200 bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Planifier un rendez-vous
              </DialogTitle>
              <DialogDescription className="text-zinc-600">
                Fixez une séance en direct, un bilan ou une visio avec un athlète.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-zinc-700">Client</Label>
              <select 
                value={clientId} 
                onChange={e => setClientId(e.target.value)}
                required
                className="flex h-11 w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="" disabled className="bg-zinc-50 text-zinc-600">Sélectionner un athlète...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-zinc-50 text-zinc-900 py-2">
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-700">Titre</Label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ex: Bilan mensuel, Séance Visio" 
                className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900 focus:border-blue-500/50" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-zinc-700">Date</Label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  required 
                  className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900 focus:border-blue-500/50 [color-scheme:dark]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-700">Heure de début</Label>
                <Input 
                  type="time" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)} 
                  required 
                  className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900 focus:border-blue-500/50 [color-scheme:dark]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-700">Heure de fin</Label>
                <Input 
                  type="time" 
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)} 
                  required 
                  className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900 focus:border-blue-500/50 [color-scheme:dark]" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-700">Lien Visio / Lieu (Optionnel)</Label>
              <Input 
                value={meetingUrl} 
                onChange={e => setMeetingUrl(e.target.value)} 
                placeholder="Ex: https://meet.google.com/..." 
                className="bg-white border-zinc-300 h-11 rounded-xl text-zinc-900 focus:border-blue-500/50" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-700">Notes (Optionnel)</Label>
              <Textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Sujets à aborder, matériel nécessaire..." 
                className="bg-white border-zinc-300 text-zinc-900 rounded-xl focus:border-blue-500/50" 
              />
            </div>
          </div>

          <div className="p-6 border-t border-zinc-200 bg-white mt-auto">
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-zinc-100 text-zinc-900">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-zinc-900 shadow-lg shadow-blue-600/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Planifier'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
