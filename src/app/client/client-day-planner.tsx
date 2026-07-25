'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar as CalendarIcon, Dumbbell, ChevronLeft, ChevronRight, Clock, Video, MapPin, CheckCircle2, AlertCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'
import { getClientDayPlannerData } from './actions'
import Link from 'next/link'

interface ClientDayPlannerProps {
  initialDate: string
  initialAppointments: any[]
  initialSessions: any[]
}

export function ClientDayPlanner({ initialDate, initialAppointments, initialSessions }: ClientDayPlannerProps) {
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
        const data = await getClientDayPlannerData(newDateStr)
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
      {/* Date Navigation Bar */}
      <div className="bg-card border border-border rounded-3xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
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
              {sessions.length} entraînement(s) • {appointments.length} rendez-vous
            </p>
          </div>
        </div>

        {/* Date Controls */}
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

          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="h-11 rounded-2xl bg-card border-border text-foreground text-sm cursor-pointer w-auto dark:[color-scheme:dark]"
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="relative min-h-[250px]">
        {isPending && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-3xl">
            <div className="flex items-center gap-2 bg-card px-4 py-2.5 rounded-full border border-border shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-foreground">Mise à jour...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entraînements du jour */}
          <div className="glass-panel p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Séances du jour ({sessions.length})
              </h3>
              <Link href="/client/workouts">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                  Voir tout
                </Button>
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border flex flex-col items-center gap-2">
                <Dumbbell className="h-8 w-8 opacity-20" />
                <p className="text-sm">Aucun entraînement prévu pour ce jour.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => {
                  let statusBadge = (
                    <span className="text-xs bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded-md">
                      Planifié
                    </span>
                  )
                  if (s.status === 'completed') {
                    statusBadge = (
                      <span className="text-xs bg-green-500/10 text-green-500 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Réalisée
                      </span>
                    )
                  } else if (s.status === 'missed') {
                    statusBadge = (
                      <span className="text-xs bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Ratée
                      </span>
                    )
                  }

                  return (
                    <div key={s.id} className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-foreground text-base">{s.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.exercises?.length || 0} exercice(s)</p>
                        </div>
                        {statusBadge}
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/client/workout/${s.id}`} className="flex-1">
                          <Button size="sm" className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-xl">
                            Aller à la séance <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Rendez-vous du jour */}
          <div className="glass-panel p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Rendez-vous du jour ({appointments.length})
              </h3>
              <Link href="/client/appointments">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-blue-500">
                  Voir tout
                </Button>
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 opacity-20" />
                <p className="text-sm">Aucun rendez-vous prévu pour ce jour.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => {
                  const startDate = new Date(apt.start_time)
                  const endDate = new Date(apt.end_time)
                  const timeRange = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

                  return (
                    <div key={apt.id} className="p-4 rounded-2xl bg-card border border-border hover:border-blue-500/30 transition-all flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground text-base">{apt.title}</p>
                          {apt.coach_name && <p className="text-xs text-muted-foreground">Avec {apt.coach_name}</p>}
                        </div>
                        <span className="text-xs bg-blue-500/10 text-blue-500 font-bold px-2.5 py-1 rounded-full uppercase">
                          {timeRange}
                        </span>
                      </div>

                      {(apt.location_type || apt.meeting_url) && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2 border-t border-border">
                          {apt.location_type === 'remote' ? (
                            <>
                              <Video className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                              <span>Visio</span>
                              {apt.meeting_url && (
                                <a href={apt.meeting_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold ml-1">
                                  Rejoindre le lien
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
        </div>
      </div>
    </div>
  )
}
