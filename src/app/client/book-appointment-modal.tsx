'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { createAppointmentAsClient } from './actions'

// Helper pour obtenir le lundi de la semaine courante
function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

export function BookAppointmentModal({ 
  coachId, 
  coachAvailabilities, 
  coachAppointments 
}: { 
  coachId: string, 
  coachAvailabilities: any[], 
  coachAppointments: any[] 
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return getMonday(today)
  })

  const [selectedSlot, setSelectedSlot] = useState<{date: string, start: string, end: string} | null>(null)
  const [notes, setNotes] = useState('')
  const [locationType, setLocationType] = useState('remote')
  const [locationDetails, setLocationDetails] = useState('')

  // Générer les créneaux disponibles pour toute la semaine
  const weekDaysWithSlots = useMemo(() => {
    const days = []
    
    // Générer les 7 jours de la semaine courante
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart)
      currentDate.setDate(weekStart.getDate() + i)
      
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;
      
      const dayAvails = coachAvailabilities.filter(a => a.date === dateStr)
      
      const bookedForDay = coachAppointments.filter(apt => {
        const aptDate = new Date(apt.start_time).toISOString().split('T')[0]
        return aptDate === dateStr && apt.status !== 'cancelled'
      })

      const slots: {start: string, end: string}[] = []

      const todayObj = new Date();
      const todayYear = todayObj.getFullYear();
      const todayMonth = String(todayObj.getMonth() + 1).padStart(2, '0');
      const todayDay = String(todayObj.getDate()).padStart(2, '0');
      const todayIso = `${todayYear}-${todayMonth}-${todayDay}`;

      if (dateStr >= todayIso) {
        dayAvails.forEach(avail => {
          const startH = parseInt(avail.start_time.split(':')[0])
          const startM = parseInt(avail.start_time.split(':')[1])
          const endH = parseInt(avail.end_time.split(':')[0])
          const endM = parseInt(avail.end_time.split(':')[1])

          let currentH = startH
          let currentM = startM

          while (currentH < endH || (currentH === endH && currentM < endM)) {
            const slotStartStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`
            let nextH = currentH + 1
            let nextM = currentM
            
            if (nextH > endH || (nextH === endH && nextM > endM)) {
              break
            }

            const slotEndStr = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`
            
            const slotStartIso = new Date(`${dateStr}T${slotStartStr}:00`).getTime()
            const slotEndIso = new Date(`${dateStr}T${slotEndStr}:00`).getTime()

            // Filtre additionnel : si on est le jour même, ne pas afficher les heures déjà passées
            if (dateStr === todayIso) {
              if (slotStartIso <= new Date().getTime()) {
                currentH += 1
                continue
              }
            }

            const isConflict = bookedForDay.some(apt => {
              const aptStart = new Date(apt.start_time).getTime()
              const aptEnd = new Date(apt.end_time).getTime()
              return (slotStartIso < aptEnd && slotEndIso > aptStart)
            })

            if (!isConflict) {
              slots.push({ start: slotStartStr, end: slotEndStr })
            }

            currentH += 1
          }
        })
      }

      days.push({
        date: currentDate,
        dateStr: dateStr,
        slots: slots
      })
    }

    return days
  }, [weekStart, coachAvailabilities, coachAppointments])

  const nextWeek = () => {
    const next = new Date(weekStart)
    next.setDate(next.getDate() + 7)
    setWeekStart(next)
    setSelectedSlot(null)
  }

  const prevWeek = () => {
    const prev = new Date(weekStart)
    prev.setDate(prev.getDate() - 7)
    // Empêcher d'aller dans les semaines passées
    const todayMonday = getMonday(new Date())
    if (prev >= todayMonday) {
      setWeekStart(prev)
      setSelectedSlot(null)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!selectedSlot) {
      setError("Veuillez choisir un créneau horaire.")
      setIsLoading(false)
      return
    }

    const startIso = new Date(`${selectedSlot.date}T${selectedSlot.start}:00`).toISOString()
    const endIso = new Date(`${selectedSlot.date}T${selectedSlot.end}:00`).toISOString()

    try {
      await createAppointmentAsClient(coachId, locationType === 'remote' ? 'Séance Visio' : 'Séance Coaching', startIso, endIso, notes, locationType, locationDetails)
      setOpen(false)
      setSelectedSlot(null)
      setNotes('')
      setLocationType('remote')
      setLocationDetails('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const isCurrentWeek = weekStart.getTime() === getMonday(new Date()).setHours(0,0,0,0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-primary-foreground shadow-lg shadow-blue-600/20 transition-all font-bold">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Prendre un RDV
        </Button>
      } />
      <DialogContent className="sm:max-w-[700px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl">
        <form onSubmit={onSubmit} className="flex flex-col h-full max-h-[85vh]">
          <div className="p-6 pb-4 border-b border-border bg-card shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
                Réserver une séance
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Sélectionnez un créneau parmi les disponibilités de votre coach.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/50 p-2 rounded-xl border border-border">
                <Button type="button" variant="ghost" size="icon" onClick={prevWeek} disabled={isCurrentWeek} className="rounded-lg hover:bg-muted">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="font-bold text-muted-foreground">
                  Semaine du {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au {weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={nextWeek} className="rounded-lg hover:bg-muted">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDaysWithSlots.map((day, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="text-center pb-2 border-b border-border">
                      <div className="text-xs font-semibold text-muted-foreground uppercase">{day.date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                      <div className="text-sm font-bold text-foreground">{day.date.getDate()}</div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {day.slots.length === 0 ? (
                        <div className="text-xs text-center text-muted-foreground py-2">-</div>
                      ) : (
                        day.slots.map((slot, idx) => {
                          const isSelected = selectedSlot?.date === day.dateStr && selectedSlot?.start === slot.start
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedSlot({ date: day.dateStr, start: slot.start, end: slot.end })}
                              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1 border ${
                                isSelected 
                                  ? 'bg-blue-600 border-blue-600 text-primary-foreground shadow-md shadow-blue-600/20' 
                                  : 'bg-card border-border text-muted-foreground hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              {slot.start}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedSlot && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label className="text-muted-foreground font-semibold text-base">Type de rendez-vous</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="remote" checked={locationType === 'remote'} onChange={(e) => setLocationType(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-border" />
                      <span className="text-muted-foreground">À distance (Visio)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="in_person" checked={locationType === 'in_person'} onChange={(e) => setLocationType(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-border" />
                      <span className="text-muted-foreground">En présentiel</span>
                    </label>
                  </div>
                </div>
                
                {locationType === 'in_person' && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground font-semibold text-base">Lieu (Optionnel)</Label>
                    <input 
                      type="text"
                      value={locationDetails}
                      onChange={(e) => setLocationDetails(e.target.value)}
                      placeholder="Ex: Salle de sport, à domicile..."
                      className="w-full bg-muted/50 border-border text-foreground rounded-xl h-11 px-3 focus:border-blue-500/50"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-muted-foreground font-semibold text-base">Un mot pour le coach ? (Optionnel)</Label>
                  <Textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    placeholder="Ex: J'aimerais qu'on parle de ma nutrition..." 
                    className="bg-muted/50 border-border text-foreground rounded-xl focus:border-blue-500/50 min-h-[100px]" 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border bg-muted/50 shrink-0">
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-muted text-foreground">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading || !selectedSlot} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-primary-foreground shadow-lg shadow-blue-600/20 font-bold">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirmer le RDV'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
