import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar as CalendarIcon, Clock, Video, Users, Trash2, Info } from 'lucide-react'
import { AvailabilitiesModal } from './availabilities-modal'
import { SpecificAvailabilitiesManager } from './specific-availabilities-manager'
import { CreateAppointmentModal } from './create-appointment-modal'
import { Button } from '@/components/ui/button'

// Helper for formatting time
function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch coach's clients
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('coach_id', user.id)
    .eq('role', 'client')

  // Fetch coach availabilities
  const { data: availabilities } = await supabase
    .from('coach_availabilities')
    .select('*')
    .eq('coach_id', user.id)
    .order('day_of_week')
    .order('start_time')

  // Fetch coach specific availabilities
  const { data: specificAvailabilities } = await supabase
    .from('coach_specific_availabilities')
    .select('*')
    .eq('coach_id', user.id)
    .order('date', { ascending: true })

  // Fetch client availabilities
  const clientIds = clients?.map(c => c.id) || []
  const { data: clientAvailabilities } = await supabase
    .from('client_availabilities')
    .select('*')
    .in('client_id', clientIds)
    .in('availability_type', ['appointment', 'both'])
    .order('date')

  // Fetch appointments (upcoming & recent)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, profiles!appointments_client_id_fkey(full_name)')
    .eq('coach_id', user.id)
    .gte('start_time', thirtyDaysAgo.toISOString())
    .order('start_time', { ascending: true })

  // Split appointments into upcoming and past
  const now = new Date()
  const upcoming = appointments?.filter(a => new Date(a.start_time) >= now) || []
  const past = appointments?.filter(a => new Date(a.start_time) < now).reverse() || [] // Most recent past first

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Calendrier & Rendez-vous
          </h2>
          <p className="text-muted-foreground mt-1">
            Gérez vos disponibilités et vos séances en direct avec vos athlètes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <AvailabilitiesModal initialAvailabilities={availabilities || []} />
          <CreateAppointmentModal clients={clients || []} clientAvailabilities={clientAvailabilities || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne de gauche : Prochains RDV */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Prochains rendez-vous
          </h3>
          
          {upcoming.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-border border-dashed">
              <CalendarIcon className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun rendez-vous à venir.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map(apt => (
                <div key={apt.id} className="glass-panel p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 relative group">
                  {/* Status Badge */}
                  <span className="absolute top-4 right-4 text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-md">
                    À venir
                  </span>

                  <div className="text-sm font-medium text-muted-foreground mb-1 capitalize">
                    {new Date(apt.start_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">{apt.title}</div>
                  <div className="text-sm text-blue-300 font-medium flex items-center gap-1 mb-4">
                    <Clock className="h-3 w-3" /> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                  </div>
                  
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {apt.profiles?.full_name}
                    </div>
                    {apt.meeting_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-green-400" />
                        <a href={apt.meeting_url} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline truncate">
                          Rejoindre la visio
                        </a>
                      </div>
                    )}
                    {apt.notes && (
                      <div className="text-xs text-muted-foreground mt-2 italic bg-black/30 p-2 rounded-lg">
                        "{apt.notes}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Historique récent */}
          {past.length > 0 && (
            <div className="pt-8">
              <h3 className="text-lg font-bold text-muted-foreground flex items-center gap-2 mb-4">
                Historique récent
              </h3>
              <div className="space-y-3">
                {past.slice(0, 5).map(apt => (
                  <div key={apt.id} className="glass-panel p-4 rounded-2xl border border-border opacity-70 hover:opacity-100 transition-opacity flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="font-bold text-muted-foreground">{apt.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {new Date(apt.start_time).toLocaleDateString('fr-FR')} • {formatTime(apt.start_time)} 
                        <span>({apt.profiles?.full_name})</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Passé
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne de droite : Rappel des dispos */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-3xl border border-border sticky top-8">
            <h3 className="text-lg font-bold text-foreground mb-6">Vos disponibilités</h3>
            {(!availabilities || availabilities.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4 bg-card rounded-xl">
                Vous n'avez pas encore défini vos horaires.
              </p>
            ) : (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 0].map(dayId => {
                  const dayName = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][dayId]
                  const slots = availabilities.filter(a => a.day_of_week === dayId)
                  
                  if (slots.length === 0) return null

                  return (
                    <div key={dayId} className="flex flex-col gap-1 border-b border-border pb-2 last:border-0 last:pb-0">
                      <span className="text-sm font-bold text-muted-foreground">{dayName}</span>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot, idx) => (
                          <span key={idx} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md">
                            {slot.start_time.substring(0,5)} - {slot.end_time.substring(0,5)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="pt-4 border-t border-border">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6 text-sm text-blue-800 flex gap-3">
            <Info className="h-5 w-5 shrink-0" />
            <p>Vos "Horaires types" sont vos disponibilités générales (gérées via le bouton en haut). Pour ouvrir la réservation aux clients, générez vos créneaux spécifiques pour une semaine donnée, ou ajoutez-les manuellement ci-dessous. Le client verra uniquement les créneaux générés ci-dessous.</p>
          </div>

          <SpecificAvailabilitiesManager specificAvailabilities={specificAvailabilities || []} />
        </div>
      </div>
    </div>
  )
}
