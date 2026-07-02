'use client'

import { useState, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Dumbbell, Calendar, Clock, Trash2 } from 'lucide-react'
import { EditAssignedSessionModal } from './edit-assigned-session-modal'
import { CreateAssignedSessionModal } from './create-assigned-session-modal'
import { assignWorkoutToClient, deleteAssignedSession } from './actions'
import { Loader2 } from 'lucide-react'

function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

export function WeeklyPlanner({ 
  clientId, 
  assignedSessions, 
  availabilities,
  templates,
  appointments
}: { 
  clientId: string, 
  assignedSessions: any[], 
  availabilities: any[],
  templates: any[],
  appointments?: any[]
}) {
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return getMonday(today)
  })

  const [loadingAssign, setLoadingAssign] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [creatingSessionDate, setCreatingSessionDate] = useState<string | null>(null)

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
  const onMouseLeave = () => {
    setIsDragging(false)
  }
  const onMouseUp = () => {
    setIsDragging(false)
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
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

  const handleAssign = async (dateStr: string, value: string) => {
    if (value === 'manual') {
      setCreatingSessionDate(dateStr)
      return
    }

    setLoadingAssign(dateStr)
    try {
      await assignWorkoutToClient(clientId, value, dateStr)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'assignation.")
    } finally {
      setLoadingAssign(null)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette séance ?")) return
    setDeletingId(sessionId)
    try {
      await deleteAssignedSession(sessionId, clientId)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la suppression.")
    } finally {
      setDeletingId(null)
    }
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
      
      const dayAvails = availabilities.filter(a => a.date === dateIso && (a.availability_type === 'workout' || a.availability_type === 'both'))
      const daySessions = assignedSessions.filter(s => s.scheduled_date === dateIso)
      const dayAppointments = (appointments || []).filter(a => a.start_time.startsWith(dateIso))

      arr.push({
        date: currentDate,
        dateStr: dateIso,
        availabilities: dayAvails,
        sessions: daySessions,
        appointments: dayAppointments
      })
    }
    return arr
  }, [weekStart, availabilities, assignedSessions, appointments])

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return (
    <div className="glass-panel p-6 rounded-3xl overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Planificateur Hebdomadaire
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
          <div key={i} className="min-w-[280px] flex-1 bg-card border border-border rounded-2xl flex flex-col shrink-0 snap-start">
            <div className="p-4 border-b border-border text-center bg-muted/50 rounded-t-2xl pointer-events-none">
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {day.date.toLocaleDateString('fr-FR', { weekday: 'short' })}
              </div>
              <div className="text-lg font-black text-foreground">
                {day.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-4">
              {/* Disponibilités */}
              <div className="space-y-2 pointer-events-none">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Disponibilités
                </div>
                {day.availabilities.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded-lg text-center">Aucune dispo</div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {day.availabilities.map((av, idx) => (
                      <span key={idx} className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-md font-medium">
                        {av.start_time.substring(0,5)} - {av.end_time.substring(0,5)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rendez-vous */}
              {day.appointments && day.appointments.length > 0 && (
                <div className="space-y-2 pointer-events-none">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Rendez-vous
                  </div>
                  <div className="space-y-2">
                    {day.appointments.map((apt: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-medium">
                        {new Date(apt.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {apt.location_type === 'remote' ? 'Visio' : 'Présentiel'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Séances Assignées */}
              <div className="space-y-2 flex-1">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" /> Séances
                </div>
                {day.sessions.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic text-center py-4 pointer-events-none">Jour de repos</div>
                ) : (
                  <div className="space-y-2">
                    {day.sessions.map((session, idx) => {
                      const isCompleted = session.status === 'completed'
                      return (
                        <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-2 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                          <div className="flex items-start justify-between">
                            <span className={`font-bold text-sm ${isCompleted ? 'text-green-700' : 'text-blue-700'}`}>{session.title}</span>
                            <div className="flex items-center gap-1">
                              <EditAssignedSessionModal clientId={clientId} session={session} />
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(session.id)
                                }} 
                                disabled={deletingId === session.id}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                              >
                                {deletingId === session.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          {isCompleted ? (
                            <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full self-start pointer-events-none">Terminée</span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full self-start pointer-events-none">À venir</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Assigner une séance */}
              <div className="mt-auto pt-4 border-t border-border relative">
                <select 
                  key={`select-${day.dateStr}-${loadingAssign === day.dateStr ? 'loading' : 'idle'}`}
                  disabled={loadingAssign === day.dateStr} 
                  onChange={(e) => handleAssign(day.dateStr, e.target.value)}
                  value=""
                  className="w-full bg-muted/50 border border-dashed border-border hover:border-blue-400 hover:bg-blue-50 transition-colors h-10 rounded-xl text-sm font-semibold text-muted-foreground px-3 appearance-none cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  style={{ textAlignLast: 'center' }}
                >
                  <option value="" disabled className="text-muted-foreground font-normal">{loadingAssign === day.dateStr ? "Création..." : "+ Ajouter"}</option>
                  <option value="manual" className="font-bold text-blue-600 bg-card text-left">Créer manuellement</option>
                  {templates.length > 0 && <optgroup label="Templates" className="font-semibold text-muted-foreground bg-muted/50 px-1 py-1 text-left">
                    {templates.map(t => <option key={t.id} value={t.id} className="text-foreground bg-card font-normal">{t.title}</option>)}
                  </optgroup>}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {creatingSessionDate && (
        <CreateAssignedSessionModal 
          clientId={clientId}
          date={creatingSessionDate}
          open={!!creatingSessionDate}
          onOpenChange={(open) => {
            if (!open) setCreatingSessionDate(null)
          }}
        />
      )}
    </div>
  )
}
