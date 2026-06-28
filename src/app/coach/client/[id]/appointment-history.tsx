'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Calendar, Clock, FileText, CheckCircle, Loader2 } from 'lucide-react'
import { saveTrainingReport } from './actions'

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function AppointmentHistory({ clientId, appointments }: { clientId: string, appointments: any[] }) {
  const [openModal, setOpenModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  
  const [publicSummary, setPublicSummary] = useState('')
  const [privateNotes, setPrivateNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openReportModal = (appointment: any) => {
    setSelectedAppointment(appointment)
    
    // Si un rapport existe déjà, on le pré-remplit
    const report = appointment.training_reports?.[0]
    setPublicSummary(report?.public_summary || '')
    setPrivateNotes(report?.private_notes || '')
    
    setError(null)
    setOpenModal(true)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await saveTrainingReport(selectedAppointment.id, publicSummary, privateNotes, clientId)
      setOpenModal(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const now = new Date()

  // On sépare en deux: à venir et passés
  const upcoming = appointments.filter(a => new Date(a.start_time) >= now).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  const past = appointments.filter(a => new Date(a.start_time) < now).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/20">
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-zinc-900">Historique des Rendez-vous</h2>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
            Aucun rendez-vous planifié.
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Rendez-vous à venir */}
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">À venir</h3>
                <div className="grid gap-4">
                  {upcoming.map(apt => (
                    <div key={apt.id} className="bg-blue-50/50 border border-blue-200/50 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="font-bold text-zinc-900 capitalize">{formatDate(apt.start_time)}</div>
                        <div className="text-sm text-zinc-600 flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4" /> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                          <span className="mx-2 text-zinc-300">•</span>
                          <span className="font-medium text-zinc-800">{apt.title}</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                        Planifié
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rendez-vous passés */}
            {past.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Passés</h3>
                <div className="grid gap-4">
                  {past.map(apt => {
                    const hasReport = apt.training_reports && apt.training_reports.length > 0
                    
                    return (
                      <div key={apt.id} className="bg-white border border-zinc-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:bg-zinc-50">
                        <div>
                          <div className="font-bold text-zinc-900 capitalize">{formatDate(apt.start_time)}</div>
                          <div className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4" /> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                            <span className="mx-2 text-zinc-300">•</span>
                            <span className="font-medium text-zinc-700">{apt.title}</span>
                          </div>
                        </div>
                        
                        <Button 
                          variant={hasReport ? "outline" : "default"}
                          className={`rounded-xl shadow-sm ${hasReport ? 'border-green-200 text-green-700 hover:bg-green-50' : 'bg-primary hover:bg-primary/90 text-white'}`}
                          onClick={() => openReportModal(apt)}
                        >
                          {hasReport ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Voir / Modifier le bilan
                            </>
                          ) : (
                            <>
                              <FileText className="mr-2 h-4 w-4" />
                              Rédiger un bilan
                            </>
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal pour rédiger le compte rendu */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[600px] bg-white border-zinc-300 text-zinc-900 rounded-2xl p-0 overflow-hidden shadow-2xl">
          <form onSubmit={onSubmit} className="flex flex-col h-full max-h-[90vh]">
            <div className="p-6 pb-4 border-b border-zinc-200 bg-white shrink-0">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Bilan de séance
                </DialogTitle>
                <DialogDescription className="text-zinc-600">
                  {selectedAppointment ? `${formatDate(selectedAppointment.start_time)} - ${selectedAppointment.title}` : ''}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-zinc-700 font-semibold text-base flex items-center gap-2">
                  Résumé public
                  <span className="text-xs font-normal text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">Visible par le client</span>
                </Label>
                <Textarea 
                  value={publicSummary} 
                  onChange={e => setPublicSummary(e.target.value)} 
                  placeholder="Points positifs de la séance, ressentis, encouragements..." 
                  className="bg-zinc-50 border-zinc-300 text-zinc-900 rounded-xl focus:border-primary/50 min-h-[100px]" 
                />
              </div>

              <div className="space-y-3">
                <Label className="text-zinc-700 font-semibold text-base flex items-center gap-2">
                  Notes privées
                  <span className="text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Seulement pour vous</span>
                </Label>
                <Textarea 
                  value={privateNotes} 
                  onChange={e => setPrivateNotes(e.target.value)} 
                  placeholder="Détails techniques, blessures, rappels pour la prochaine fois..." 
                  className="bg-amber-50/30 border-amber-200 text-zinc-900 rounded-xl focus:border-amber-400/50 min-h-[100px] placeholder:text-amber-900/30" 
                />
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 bg-white shrink-0">
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpenModal(false)} className="rounded-xl hover:bg-zinc-100 text-zinc-900">
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-bold">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enregistrer le bilan'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
