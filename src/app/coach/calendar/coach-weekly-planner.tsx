'use client'

import { useState, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Video, MapPin } from 'lucide-react'
import { CreateAppointmentModal } from './create-appointment-modal'

function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function CoachWeeklyPlanner({ 
  clients,
  appointments, 
  availabilities,
  specificAvailabilities,
  clientAvailabilities
}: { 
  clients: any[],
  appointments: any[], 
  availabilities: any[],
  specificAvailabilities: any[],
  clientAvailabilities: any[]
}) {
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return getMonday(today)
  })

  // Drag to scroll logic
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }
  const onMouseLeave = () => setIsDragging(false)
  const onMouseUp = () => setIsDragging(false)
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const nextWeek = () => {
    const next = new Date(weekStart)
    next.setDate(next.getDate() + 7)
    setWeekStart(next)
  }

  const prevWeek = () => {
    const prev = new Date(weekStart)
    prev.setDate(prev.getDate() - 7)
    setWeekStart(prev)
  }

  const days = useMemo(() => {
    const arr = []
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart)
      currentDate.setDate(weekStart.getDate() + i)
      
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const dayStr = String(currentDate.getDate()).padStart(2, '0')
      const dateIso = `${year}-${month}-${dayStr}`
      
      // Calculate day of week (0 = Monday, ..., 6 = Sunday for our DB structure)
      // Javascript getDay() is 0=Sunday, 1=Monday...
      const jsDay = currentDate.getDay()
      const dbDay = jsDay === 0 ? 6 : jsDay - 1
      
      // Get availabilities for this day
      // 1. Check if there are specific availabilities for this exact date
      const spec = specificAvailabilities.filter(s => s.date === dateIso)
      let dayAvails: any[] = []
      
      if (spec.length > 0) {
        dayAvails = spec.map(s => ({ start_time: s.start_time, end_time: s.end_time, type: 'specific' }))
      } else {
        // Fallback to recurring availabilities
        dayAvails = availabilities.filter(a => a.day_of_week === dbDay).map(a => ({ start_time: a.start_time, end_time: a.end_time, type: 'recurring' }))
      }

      const dayAppointments = appointments.filter(a => a.start_time.startsWith(dateIso)).sort((a, b) => a.start_time.localeCompare(b.start_time))

      arr.push({
        date: currentDate,
        dateStr: dateIso,
        availabilities: dayAvails,
        appointments: dayAppointments
      })
    }
    return arr
  }, [weekStart, availabilities, specificAvailabilities, appointments])

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return (
    <div className="glass-panel p-6 rounded-3xl overflow-hidden border border-border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Mon Planning
        </h3>
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
          <Button variant="ghost" size="icon" onClick={prevWeek} className="h-8 w-8 hover:bg-muted">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
          <span className="font-bold text-muted-foreground text-sm cursor-default">
            Du {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au {weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </span>
          <Button variant="ghost" size="icon" onClick={nextWeek} className="h-8 w-8 hover:bg-muted">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className={`flex gap-4 overflow-x-auto pb-4 custom-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab snap-x'}`}
      >
        {days.map((day, i) => (
          <div key={i} className="min-w-[300px] flex-1 bg-card border border-border rounded-2xl flex flex-col shrink-0 snap-start">
            <div className="p-4 border-b border-border text-center bg-muted/50 rounded-t-2xl pointer-events-none flex justify-between items-center">
              <div className="flex flex-col items-start">
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {day.date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className="text-lg font-black text-foreground">
                  {day.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              
              <div className="pointer-events-auto">
                <CreateAppointmentModal 
                  clients={clients} 
                  clientAvailabilities={clientAvailabilities} 
                  defaultDate={day.dateStr} 
                  triggerButton={
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-500/10 hover:text-blue-500">
                      <Plus className="h-4 w-4" />
                    </Button>
                  } 
                />
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-4">
              {/* Mes disponibilités */}
              <div className="space-y-2 pointer-events-none">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Mes Dispos
                </div>
                {day.availabilities.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded-lg text-center">Aucune dispo</div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {day.availabilities.map((av, idx) => (
                      <span key={idx} className="text-xs bg-green-100/50 text-green-700 border border-green-200 px-2 py-1 rounded-md font-medium">
                        {av.start_time.substring(0,5)} - {av.end_time.substring(0,5)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rendez-vous du jour */}
              <div className="space-y-2 flex-1 pt-2 border-t border-border/50">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Rendez-vous
                </div>
                {day.appointments.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic text-center py-6 pointer-events-none">Rien de prévu</div>
                ) : (
                  <div className="space-y-2">
                    {day.appointments.map((apt: any, idx: number) => {
                      const isPast = new Date(apt.start_time) < new Date()
                      return (
                        <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-2 transition-opacity ${isPast ? 'bg-muted/50 border-border opacity-70' : 'bg-blue-500/5 border-blue-500/20'}`}>
                          <div className="flex items-start justify-between">
                            <span className={`font-bold text-sm ${isPast ? 'text-muted-foreground' : 'text-blue-400'}`}>{apt.title}</span>
                          </div>
                          
                          <div className="text-xs font-medium text-foreground flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                              </span>
                              <span className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-muted-foreground">
                                {apt.location_type === 'remote' ? 'Visio' : 'IRL'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                              {apt.profiles?.full_name}
                            </div>
                          </div>
                          
                          {!isPast && apt.meeting_url && apt.location_type === 'remote' && (
                            <div className="pt-2 mt-1 border-t border-border/50">
                              <a href={apt.meeting_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-green-500 hover:underline flex items-center gap-1">
                                <Video className="h-3 w-3" /> Rejoindre la visio
                              </a>
                            </div>
                          )}
                          {!isPast && apt.location_details && apt.location_type === 'in_person' && (
                            <div className="pt-2 mt-1 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {apt.location_details}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
