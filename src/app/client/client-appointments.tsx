'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Video, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ClientAppointmentsProps {
  upcomingAppointments?: any[]
  pastAppointments?: any[]
  // Retro-compatibilité si un seul tableau est fourni
  appointments?: any[]
}

export function ClientAppointments({ upcomingAppointments, pastAppointments, appointments }: ClientAppointmentsProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const upcoming = upcomingAppointments || appointments || []
  const past = pastAppointments || []

  return (
    <div className="space-y-6">
      {/* Dynamic Tab Switcher */}
      <div className="flex gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border w-fit">
        <Button
          variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('upcoming')}
          className={`rounded-xl text-sm font-bold ${activeTab === 'upcoming' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
        >
          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
          À venir ({upcoming.length})
        </Button>
        <Button
          variant={activeTab === 'past' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('past')}
          className={`rounded-xl text-sm font-bold ${activeTab === 'past' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
        >
          <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
          Passés & Bilans ({past.length})
        </Button>
      </div>

      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-3xl p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
              <Calendar className="h-8 w-8 opacity-20" />
              <p className="text-sm">Aucun rendez-vous prévu pour le moment.</p>
            </div>
          ) : (
            upcoming.map((apt: any) => {
              const startDate = new Date(apt.start_time)
              const endDate = new Date(apt.end_time)
              
              const dateStr = startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              const timeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

              return (
                <div key={apt.id} className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-3 transition-all hover:shadow-md hover:border-blue-500/30">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-foreground capitalize text-lg">{dateStr}</h4>
                      <div className="flex items-center gap-2 text-sm text-blue-500 font-semibold mt-1">
                        <Clock className="h-4 w-4" />
                        {timeStr}
                      </div>
                    </div>
                    <div className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      Confirmé
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-foreground font-bold text-xl">{apt.title}</p>
                    {apt.coach_name && (
                      <p className="text-sm text-muted-foreground">Avec {apt.coach_name}</p>
                    )}
                  </div>

                  {(apt.location_type || apt.location_details || apt.meeting_url) && (
                    <div className="mt-2 pt-3 border-t border-border flex flex-col gap-2">
                      {apt.location_type === 'remote' ? (
                        <div className="flex items-start gap-2 text-sm">
                          <Video className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-semibold text-foreground">Visio</span>
                            {apt.meeting_url && (
                              <a href={apt.meeting_url} target="_blank" rel="noopener noreferrer" className="block text-blue-500 hover:underline mt-1 break-all font-medium">
                                {apt.meeting_url}
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">Présentiel</span>
                            {apt.location_details && <p className="text-muted-foreground mt-0.5">{apt.location_details}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {apt.notes && (
                    <div className="mt-2 p-3 bg-muted/40 rounded-2xl border border-border/50 text-sm italic text-muted-foreground">
                      "{apt.notes}"
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-4">
          {past.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-3xl p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
              <CheckCircle2 className="h-8 w-8 opacity-20" />
              <p className="text-sm">Aucun rendez-vous passé enregistré.</p>
            </div>
          ) : (
            past.map((apt: any) => {
              const startDate = new Date(apt.start_time)
              const dateStr = startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              const summary = apt.training_reports?.[0]?.public_summary

              return (
                <div key={apt.id} className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-foreground capitalize text-lg">{dateStr}</h4>
                      <p className="text-sm text-muted-foreground font-medium">{apt.title}</p>
                    </div>
                    <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-bold uppercase">
                      Terminé
                    </span>
                  </div>

                  {summary ? (
                    <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-blue-500">
                        <FileText className="h-4 w-4" />
                        Bilan de la séance par votre coach
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{summary}</p>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-xl border border-border">
                      Aucun bilan écrit pour ce rendez-vous.
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
