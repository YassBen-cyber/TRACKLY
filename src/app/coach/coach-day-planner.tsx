'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar as CalendarIcon, Dumbbell, ChevronLeft, ChevronRight, Clock, Video, MapPin, CheckCircle2, AlertCircle, XCircle, Loader2, User } from 'lucide-react'
import { getCoachDayPlannerData } from './actions'
import Link from 'next/link'

interface CoachDayPlannerProps {
  initialDate: string
  initialAppointments: any[]
  initialSessions: any[]
}

export function CoachDayPlanner({ initialDate, initialAppointments, initialSessions }: CoachDayPlannerProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [sessions, setSessions] = useState(initialSessions)
  const [isPending, startTransition] = useTransition()

  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

  const handleDateChange = (newDateStr: string) => {
    if (!newDateStr) return
    setSelectedDate(newDateStr)
    
    startTransition(async () => {
      try {
        const data = await getCoachDayPlannerData(newDateStr)
        setAppointments(data.appointments)
        setSessions(data.sessions)
      } catch (err) {
        console.error(err)
      }
    })
  }

  const shiftDays = (days: number) => {
    const current = new Date(selectedDate)
    current.setDate(current.getDate() + days)
    const newDateStr = current.toISOString().split('T')[0]
    handleDateChange(newDateStr)
  }

  const formattedDateString = new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const isToday = selectedDate === todayStr

  return (
    <div className="space-y-6">
      {/* Barre de navigation temporelle */}
      <div className="bg-card border border-border rounded-3xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 text-primary rounded-2xl">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black capitalize text-foreground">{formattedDateString}</span>
              {isToday && (
                <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Aujourd'hui
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {appointments.length} rendez-vous • {sessions.length} séances au programme
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-muted/50 p-1 rounded-2xl border border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDays(-1)}
              title="Jour précédent"
              className="h-9 w-9 rounded-xl hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={isToday ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleDateChange(todayStr)}
              className="h-9 px-3 rounded-xl text-xs font-bold"
            >
              Aujourd'hui
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDays(1)}
              title="Jour suivant"
              className="h-9 w-9 rounded-xl hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="h-11 rounded-2xl bg-card border-border text-foreground text-sm cursor-pointer w-auto dark:[color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Content Grid */}
      <div className="relative min-h-[300px]">
        {isPending && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-3xl">
            <div className="flex items-center gap-2 bg-card px-4 py-2.5 rounded-full border border-border shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-foreground">Chargement de la journée...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Rendez-vous */}
          <div className="glass-panel p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Rendez-vous ({appointments.length})
              </h3>
              <Link href="/coach/calendar">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-orange-500">
                  Agenda complet
                </Button>
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 opacity-20" />
                <p className="text-sm">Aucun rendez-vous fixé pour ce jour.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => {
                  const startDate = new Date(apt.start_time)
                  const endDate = new Date(apt.end_time)
                  const timeRange = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

                  return (
                    <div key={apt.id} className="p-4 rounded-2xl bg-card border border-border hover:border-orange-500/30 transition-all flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border shrink-0">
                            {apt.client?.photo_url ? (
                              <img src={apt.client.photo_url} alt={apt.client.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{apt.client?.full_name || 'Athlète'}</p>
                            <p className="text-xs text-orange-500 font-semibold">{timeRange}</p>
                          </div>
                        </div>

                        <span className="text-xs bg-orange-500/10 text-orange-500 font-bold px-2.5 py-1 rounded-full uppercase">
                          {apt.status === 'scheduled' ? 'Confirmé' : apt.status}
                        </span>
                      </div>

                      <p className="text-sm text-foreground font-medium mt-1">{apt.title}</p>

                      {(apt.location_type || apt.meeting_url) && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2 border-t border-border">
                          {apt.location_type === 'remote' ? (
                            <>
                              <Video className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                              <span className="truncate">Visio</span>
                              {apt.meeting_url && (
                                <a href={apt.meeting_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1 truncate">
                                  Rejoindre
                                </a>
                              )}
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                              <span>Présentiel {apt.location_details ? `(${apt.location_details})` : ''}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section Entraînements */}
          <div className="glass-panel p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Séances Athlètes ({sessions.length})
              </h3>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border flex flex-col items-center gap-2">
                <Dumbbell className="h-8 w-8 opacity-20" />
                <p className="text-sm">Aucune séance programmée pour ce jour.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => {
                  let statusBadge = (
                    <span className="text-xs bg-muted text-muted-foreground font-bold px-2.5 py-1 rounded-full">
                      Planifié
                    </span>
                  )
                  if (s.status === 'completed') {
                    statusBadge = (
                      <span className="text-xs bg-green-500/10 text-green-500 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Réalisé
                      </span>
                    )
                  } else if (s.status === 'missed') {
                    statusBadge = (
                      <span className="text-xs bg-red-500/10 text-red-500 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Raté
                      </span>
                    )
                  }

                  return (
                    <div key={s.id} className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border shrink-0">
                            {s.client?.photo_url ? (
                              <img src={s.client.photo_url} alt={s.client.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <Link href={`/coach/client/${s.client_id}`} className="font-bold text-foreground text-sm hover:text-primary transition-colors">
                              {s.client?.full_name || 'Athlète'}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {s.exercises?.length || 0} exercice(s)
                            </p>
                          </div>
                        </div>

                        {statusBadge}
                      </div>

                      <p className="text-sm font-bold text-foreground mt-1">{s.title}</p>

                      {s.execution_feedback && (
                        <div className="mt-2 text-xs italic bg-muted/40 p-2.5 rounded-xl border border-border text-muted-foreground">
                          💬 "{s.execution_feedback}"
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
    </div>
  )
}
