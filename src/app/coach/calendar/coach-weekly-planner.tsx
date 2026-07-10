'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Calendar, Clock, Video, MapPin, User, Plus } from 'lucide-react'
import { CreateAppointmentModal } from './create-appointment-modal'
import { EditAppointmentModal } from './edit-appointment-modal'

function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

const HOUR_HEIGHT = 60 // px

const COLORS = [
  'bg-blue-500 border-blue-600 text-white shadow-blue-500/20',
  'bg-purple-500 border-purple-600 text-white shadow-purple-500/20',
  'bg-pink-500 border-pink-600 text-white shadow-pink-500/20',
  'bg-amber-500 border-amber-600 text-white shadow-amber-500/20',
  'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/20',
  'bg-rose-500 border-rose-600 text-white shadow-rose-500/20',
  'bg-indigo-500 border-indigo-600 text-white shadow-indigo-500/20',
  'bg-cyan-500 border-cyan-600 text-white shadow-cyan-500/20'
]

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

function getTimeStrFromIso(isoString: string) {
  const d = new Date(isoString)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function getTop(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  return (h + (m || 0) / 60) * HOUR_HEIGHT
}

function getHeight(startStr: string, endStr: string) {
  return getTop(endStr) - getTop(startStr)
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

  const [filterClient, setFilterClient] = useState('all')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to 8 AM on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 8 * HOUR_HEIGHT
    }
  }, [])

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
      
      const jsDay = currentDate.getDay()
      const dbDay = jsDay === 0 ? 6 : jsDay - 1
      
      // Coach availabilities
      const spec = specificAvailabilities.filter(s => s.date === dateIso)
      let coachAvails: any[] = []
      if (spec.length > 0) {
        coachAvails = spec.map(s => ({ start_time: s.start_time, end_time: s.end_time, type: 'specific' }))
      } else {
        coachAvails = availabilities.filter(a => a.day_of_week === dbDay).map(a => ({ start_time: a.start_time, end_time: a.end_time, type: 'recurring' }))
      }

      // Client availabilities
      const cAvails = clientAvailabilities.filter(ca => ca.date === dateIso && (filterClient === 'all' || ca.client_id === filterClient))

      // Appointments
      const dayAppointments = appointments.filter(a => {
        const d = new Date(a.start_time)
        return d.getFullYear() === year && d.getMonth() + 1 === parseInt(month) && d.getDate() === parseInt(dayStr)
      })

      arr.push({
        date: currentDate,
        dateStr: dateIso,
        coachAvails,
        clientAvails: cAvails,
        appointments: dayAppointments
      })
    }
    return arr
  }, [weekStart, availabilities, specificAvailabilities, clientAvailabilities, appointments, filterClient])

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const hoursArray = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-3xl overflow-hidden border border-border flex flex-col h-[800px] max-h-[85vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shrink-0">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Agenda Global
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos rendez-vous et croisez vos dispos avec celles des athlètes.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Select value={filterClient} onValueChange={(val) => setFilterClient(val || 'all')}>
            <SelectTrigger className="w-full sm:w-[220px] h-10 rounded-xl border-border bg-card font-medium">
              <SelectValue placeholder="Dispos d'un athlète..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-card">
              <SelectItem value="all">Tous les athlètes</SelectItem>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border shadow-sm">
            <Button variant="ghost" size="icon" onClick={prevWeek} className="h-8 w-8 hover:bg-muted rounded-lg">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
            <span className="font-bold text-foreground text-sm cursor-default px-2">
              {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
            <Button variant="ghost" size="icon" onClick={nextWeek} className="h-8 w-8 hover:bg-muted rounded-lg">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-inner">
        {/* En-tête des jours */}
        <div className="flex border-b border-border bg-muted/30 shrink-0">
          <div className="w-16 shrink-0 border-r border-border"></div>
          <div className="flex-1 grid grid-cols-7">
            {days.map((day, i) => (
              <div key={i} className={`p-3 text-center border-border ${i !== 6 ? 'border-r' : ''}`}>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {day.date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-black mt-1 ${day.date.toDateString() === new Date().toDateString() ? 'text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mx-auto' : 'text-foreground'}`}>
                  {day.date.getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grille défilante */}
        <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollContainerRef}>
          <div className="flex relative" style={{ height: 24 * HOUR_HEIGHT }}>
            
            {/* Colonne des heures */}
            <div className="w-16 shrink-0 border-r border-border bg-card relative">
              {hoursArray.map(hour => (
                <div key={hour} className="absolute w-full text-right pr-2 text-xs text-muted-foreground font-medium -translate-y-1/2" style={{ top: hour * HOUR_HEIGHT }}>
                  {hour === 0 ? '' : `${hour}:00`}
                </div>
              ))}
            </div>

            {/* Grille des jours */}
            <div className="flex-1 grid grid-cols-7 relative">
              {/* Lignes horizontales pour les heures */}
              {hoursArray.map(hour => (
                <div key={hour} className="absolute w-full border-t border-border/50 pointer-events-none" style={{ top: hour * HOUR_HEIGHT }}></div>
              ))}

              {days.map((day, dayIndex) => (
                <div key={dayIndex} className={`relative border-border ${dayIndex !== 6 ? 'border-r' : ''}`}>
                  
                  {/* Grille interactive pour créer un RDV sur une case vide */}
                  {hoursArray.map(hour => {
                    const slotStartVal = hour * 60
                    const slotEndVal = (hour + 1) * 60
                    
                    const isOccupied = day.appointments.some((apt: any) => {
                       const dStart = new Date(apt.start_time)
                       const dEnd = new Date(apt.end_time)
                       const aptStartVal = dStart.getHours() * 60 + dStart.getMinutes()
                       const aptEndVal = dEnd.getHours() * 60 + dEnd.getMinutes()
                       return (aptStartVal < slotEndVal && aptEndVal > slotStartVal)
                    })

                    if (isOccupied) return null; // Cache le slot vide si déjà pris

                    return (
                      <CreateAppointmentModal 
                        key={`empty-${hour}`}
                        clients={clients}
                        coachAppointments={appointments}
                        clientAvailabilities={clientAvailabilities}
                        defaultDate={day.dateStr}
                        defaultStartTime={`${hour.toString().padStart(2, '0')}:00`}
                        defaultEndTime={`${(hour + 1).toString().padStart(2, '0')}:00`}
                        triggerButton={
                          <div 
                            className="absolute w-full cursor-pointer transition-all flex items-center justify-center opacity-0 hover:opacity-100 hover:bg-primary/10 z-0"
                            style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                            title={`Créer un RDV à ${hour}h00`}
                          >
                            <Plus className="h-6 w-6 text-primary drop-shadow-sm bg-background/80 rounded-full p-0.5" />
                          </div>
                        }
                      />
                    )
                  })}

                  {/* Dispos du coach (Gris transparent) */}
                  {day.coachAvails.map((av, i) => {
                    const top = getTop(av.start_time)
                    const h = getHeight(av.start_time, av.end_time)
                    return (
                      <div 
                        key={`coach-${i}`} 
                        className="absolute inset-x-0 bg-muted/30 border-l-2 border-primary/20 pointer-events-none"
                        style={{ top, height: h }}
                        title="Ma disponibilité"
                      />
                    )
                  })}

                  {/* Dispos du client (Zone hachurée verte) */}
                  {day.clientAvails.map((ca, i) => {
                    const top = getTop(ca.start_time)
                    const h = Math.max(getHeight(ca.start_time, ca.end_time), 20) // min height
                    const clientName = clients.find(c => c.id === ca.client_id)?.full_name || 'Client'
                    
                    return (
                      <div 
                        key={`client-${i}`} 
                        className="absolute inset-x-1 sm:inset-x-2 border-2 border-dashed border-green-500/50 bg-green-500/5 rounded-xl group transition-all hover:bg-green-500/10 z-0 flex flex-col items-center justify-center overflow-hidden"
                        style={{ top, height: h }}
                      >
                        {/* Hachures en CSS */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #22c55e 10px, #22c55e 20px)' }}></div>
                        
                        <div className="relative z-10 flex flex-col items-center justify-center p-1 w-full h-full">
                          {h >= 40 && <span className="text-[10px] font-bold text-green-700/70 uppercase text-center leading-tight hidden sm:block">{clientName}</span>}
                          
                          <div className="mt-auto mb-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <CreateAppointmentModal 
                              clients={clients} 
                              coachAppointments={appointments}
                              clientAvailabilities={clientAvailabilities} 
                              defaultDate={day.dateStr}
                              defaultStartTime={ca.start_time.substring(0,5)}
                              defaultEndTime={ca.end_time.substring(0,5)}
                              defaultClientId={ca.client_id}
                              triggerButton={
                                <Button size="sm" className="h-6 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs rounded-lg shadow-md bg-green-600 hover:bg-green-700 text-white">
                                  <Plus className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Planifier</span>
                                </Button>
                              } 
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Rendez-vous (Blocs solides) */}
                  {day.appointments.map((apt: any, i: number) => {
                    const top = getTop(getTimeStrFromIso(apt.start_time))
                    const rawHeight = getHeight(getTimeStrFromIso(apt.start_time), getTimeStrFromIso(apt.end_time))
                    const h = Math.max(rawHeight, 20) // Minimum 20px pour rester lisible
                    const isPast = new Date(apt.start_time) < new Date()
                    
                    const colorIndex = apt.client_id ? hashString(apt.client_id) % COLORS.length : i % COLORS.length
                    const aptColor = COLORS[colorIndex]
                    const isShort = h <= 35 // Si <= 35px (~30 mins), on change de disposition

                    return (
                      <EditAppointmentModal
                        key={`apt-${i}`}
                        clients={clients}
                        coachAppointments={appointments}
                        appointment={apt}
                        triggerButton={
                          <div 
                            className={`absolute inset-x-1 sm:inset-x-2 rounded-xl overflow-hidden shadow-sm border z-10 transition-all hover:shadow-md hover:z-20 flex cursor-pointer ${isShort ? 'flex-row items-center justify-between p-1 px-2 gap-2' : 'flex-col p-2 sm:p-3 gap-1'} ${isPast ? 'bg-muted border-border opacity-70 text-muted-foreground' : aptColor}`}
                            style={{ top, height: h }}
                            title={`${apt.title}\n${getTimeStrFromIso(apt.start_time)} - ${getTimeStrFromIso(apt.end_time)}`}
                          >
                            <div className="font-bold text-[10px] sm:text-xs leading-tight line-clamp-1 truncate">{apt.title}</div>
                            <div className={`text-[9px] sm:text-[10px] flex items-center gap-1 opacity-90 shrink-0`}>
                              <Clock className={`h-2.5 w-2.5 shrink-0 ${isShort ? 'hidden sm:block' : ''}`} />
                              {getTimeStrFromIso(apt.start_time)} - {getTimeStrFromIso(apt.end_time)}
                            </div>
                            {!isShort && h >= 60 && apt.profiles?.full_name && (
                              <div className="mt-1 text-[10px] sm:text-xs font-medium truncate flex items-center gap-1">
                                <User className="h-3 w-3 shrink-0" />
                                {apt.profiles.full_name}
                              </div>
                            )}
                          </div>
                        }
                      />
                    )
                  })}

                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
