'use client'

import React, { useState, useEffect } from 'react'
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
import { Loader2, Calendar, Trash2 } from 'lucide-react'
import { updateAppointment, deleteAppointment } from './actions'

export function EditAppointmentModal({ clients, appointment, coachAppointments = [], triggerButton }: { clients: any[], appointment: any, coachAppointments?: any[], triggerButton: React.ReactElement }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [locationType, setLocationType] = useState('remote')
  const [locationDetails, setLocationDetails] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open && appointment) {
      setClientId(appointment.client_id || '')
      setTitle(appointment.title || '')
      
      const startD = new Date(appointment.start_time)
      const endD = new Date(appointment.end_time)
      
      setDate(`${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`)
      setStartTime(`${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(2, '0')}`)
      setEndTime(`${String(endD.getHours()).padStart(2, '0')}:${String(endD.getMinutes()).padStart(2, '0')}`)
      
      setMeetingUrl(appointment.meeting_url || '')
      setLocationType(appointment.location_type || 'remote')
      setLocationDetails(appointment.location_details || '')
      setNotes(appointment.notes || '')
      setError(null)
    }
  }, [open, appointment])

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

    const startVal = new Date(`${date}T${startTime}:00`).getTime()
    const endVal = new Date(`${date}T${endTime}:00`).getTime()

    const isConflict = coachAppointments.some(apt => {
      if (apt.id === appointment.id) return false
      if (apt.status === 'cancelled') return false
      const aptStart = new Date(apt.start_time).getTime()
      const aptEnd = new Date(apt.end_time).getTime()
      return (startVal < aptEnd && endVal > aptStart)
    })

    if (isConflict) {
      setError("Vous avez déjà un rendez-vous prévu sur ce créneau horaire.")
      setIsLoading(false)
      return
    }

    const startIso = new Date(`${date}T${startTime}:00`).toISOString()
    const endIso = new Date(`${date}T${endTime}:00`).toISOString()

    try {
      await updateAppointment(appointment.id, clientId, title || 'Rendez-vous', startIso, endIso, notes, meetingUrl, locationType, locationDetails)
      setOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment annuler et supprimer ce rendez-vous ?")) return
    setIsDeleting(true)
    setError(null)
    try {
      await deleteAppointment(appointment.id)
      setOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerButton} />
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl">
        <form onSubmit={onSubmit} className="flex flex-col h-full">
          <div className="p-6 pb-4 border-b border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Modifier le rendez-vous
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Ajustez les détails ou annulez ce rendez-vous.
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
              <Label className="text-muted-foreground">Client</Label>
                <select 
                  value={clientId} 
                  onChange={e => setClientId(e.target.value)}
                  required
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-muted disabled:opacity-75 disabled:cursor-not-allowed"
                >
                <option value="" disabled className="bg-muted/50 text-muted-foreground">Sélectionner un athlète...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-muted/50 text-foreground py-2">
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Titre</Label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ex: Bilan mensuel, Séance Visio" 
                className="bg-card border-border h-11 rounded-xl text-foreground focus:border-blue-500/50" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-muted-foreground">Date</Label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  required 
                  className="bg-card border-border h-11 rounded-xl text-foreground focus:border-blue-500/50 dark:[color-scheme:dark]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Heure de début</Label>
                <Input 
                  type="time" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)} 
                  required 
                  className="bg-card border-border h-11 rounded-xl text-foreground focus:border-blue-500/50 dark:[color-scheme:dark]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Heure de fin</Label>
                <Input 
                  type="time" 
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)} 
                  required 
                  className="bg-card border-border h-11 rounded-xl text-foreground focus:border-blue-500/50 dark:[color-scheme:dark]" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Type de lieu</Label>
                <Select value={locationType} onValueChange={(val) => setLocationType(val as string)}>
                  <SelectTrigger className="bg-card border-border h-11 rounded-xl text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-muted/50 border-border text-foreground">
                    <SelectItem value="remote">À distance (Visio)</SelectItem>
                    <SelectItem value="in_person">En présentiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">{locationType === 'remote' ? 'Lien Visio (Optionnel)' : 'Adresse / Lieu (Optionnel)'}</Label>
                <Input 
                  value={locationType === 'remote' ? meetingUrl : locationDetails} 
                  onChange={e => locationType === 'remote' ? setMeetingUrl(e.target.value) : setLocationDetails(e.target.value)} 
                  placeholder={locationType === 'remote' ? "Ex: https://meet.google.com/..." : "Ex: Salle Basic Fit..."} 
                  className="bg-card border-border h-11 rounded-xl text-foreground focus:border-blue-500/50" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Notes (Optionnel)</Label>
              <Textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Sujets à aborder, matériel nécessaire..." 
                className="bg-card border-border text-foreground rounded-xl focus:border-blue-500/50" 
              />
            </div>
          </div>

          <div className="p-6 border-t border-border bg-card mt-auto flex justify-between items-center">
            <Button type="button" variant="ghost" onClick={handleDelete} disabled={isDeleting} className="rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Supprimer
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-muted text-foreground">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-foreground shadow-lg shadow-blue-600/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Mettre à jour'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
