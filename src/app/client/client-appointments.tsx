'use client'

import { Calendar, Clock, MapPin, Video } from 'lucide-react'

export function ClientAppointments({ appointments }: { appointments: any[] }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border rounded-3xl p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
        <Calendar className="h-8 w-8 opacity-20" />
        <p>Aucun rendez-vous prévu pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt: any) => {
        const startDate = new Date(apt.start_time)
        const endDate = new Date(apt.end_time)
        
        const dateStr = startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
        const timeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

        return (
          <div key={apt.id} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-3 transition-all hover:shadow-md hover:border-primary/30">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="font-bold text-foreground capitalize">{dateStr}</h4>
                <div className="flex items-center gap-2 text-sm text-primary font-medium mt-1">
                  <Clock className="h-4 w-4" />
                  {timeStr}
                </div>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Confirmé
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <p className="text-foreground font-medium text-lg">{apt.title}</p>
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
                      <span className="font-medium text-foreground">Visio</span>
                      {apt.meeting_url && (
                        <a href={apt.meeting_url} target="_blank" rel="noopener noreferrer" className="block text-blue-500 hover:underline mt-1 break-all">
                          {apt.meeting_url}
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground">Présentiel</span>
                      {apt.location_details && <p className="text-muted-foreground mt-0.5">{apt.location_details}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {apt.notes && (
              <div className="mt-2 p-3 bg-muted/40 rounded-xl border border-border/50 text-sm italic text-muted-foreground">
                "{apt.notes}"
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
