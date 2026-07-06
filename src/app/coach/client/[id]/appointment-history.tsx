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
import { saveTrainingReport, updateAppointmentStatus } from './actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    
    // Si un rapport existe déjà, on le pré-remplit (peut être un objet ou un tableau selon PostgREST)
    const report = Array.isArray(appointment.training_reports) 
      ? appointment.training_reports[0] 
      : appointment.training_reports
      
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
      const res = await saveTrainingReport(selectedAppointment.id, publicSummary, privateNotes, clientId)
      if (res?.error) {
        setError(res.error)
      } else {
        setOpenModal(false)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const [filter, setFilter] = useState('all')

  const handleStatusChange = async (appointmentId: string, status: string) => {
    await updateAppointmentStatus(appointmentId, status, clientId)
  }

  const now = new Date()

  // On filtre d'abord selon le statut sélectionné
  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true
    return (apt.status || 'scheduled') === filter
  })

  // On sépare en deux: à venir et passés
  const upcoming = filteredAppointments.filter(a => new Date(a.start_time) >= now).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  const past = filteredAppointments.filter(a => new Date(a.start_time) < now).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200'
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-blue-600 bg-blue-100 border-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-3xl border border-border shadow-xl shadow-foreground/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Historique des Rendez-vous</h2>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">Filtrer :</Label>
            <Select value={filter} onValueChange={(val) => setFilter(val || 'all')}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs font-semibold rounded-xl border-border bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-card">
                <SelectItem value="all">Tous les rdv</SelectItem>
                <SelectItem value="scheduled">En attente / À venir</SelectItem>
                <SelectItem value="completed">Réalisés</SelectItem>
                <SelectItem value="cancelled">Annulés / Ratés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/50">
            Aucun rendez-vous planifié.
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/50">
            Aucun rendez-vous ne correspond à ce filtre.
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Rendez-vous à venir */}
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">À venir</h3>
                <div className="grid gap-4">
                  {upcoming.map(apt => (
                    <div key={apt.id} className="bg-blue-50/50 border border-blue-200/50 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="font-bold text-foreground capitalize">{formatDate(apt.start_time)}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4" /> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                          <span className="mx-2 text-muted-foreground">•</span>
                          <span className="font-medium text-foreground">{apt.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Select 
                          defaultValue={apt.status || 'scheduled'}
                          onValueChange={(val) => handleStatusChange(apt.id, val)}
                        >
                          <SelectTrigger className={`w-[140px] h-9 text-xs font-semibold rounded-xl border ${getStatusColor(apt.status || 'scheduled')}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border">
                            <SelectItem value="scheduled">À venir</SelectItem>
                            <SelectItem value="completed">Réalisé</SelectItem>
                            <SelectItem value="cancelled">Annulé / Raté</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rendez-vous passés */}
            {past.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Passés</h3>
                <div className="grid gap-4">
                  {past.map(apt => {
                    const report = Array.isArray(apt.training_reports) ? apt.training_reports[0] : apt.training_reports;
                    const hasReport = !!report;
                    
                    return (
                      <div key={apt.id} className="bg-card border border-border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:bg-muted/50">
                        <div>
                          <div className="font-bold text-foreground capitalize">{formatDate(apt.start_time)}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4" /> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                            <span className="mx-2 text-muted-foreground">•</span>
                            <span className="font-medium text-muted-foreground">{apt.title}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                          <Select 
                            defaultValue={apt.status || 'scheduled'}
                            onValueChange={(val) => handleStatusChange(apt.id, val)}
                          >
                            <SelectTrigger className={`w-[140px] h-9 text-xs font-semibold rounded-xl border bg-card ${getStatusColor(apt.status || 'scheduled')}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-card">
                              <SelectItem value="scheduled">En attente</SelectItem>
                              <SelectItem value="completed">Réalisé</SelectItem>
                              <SelectItem value="cancelled">Raté / Annulé</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button 
                            variant={hasReport ? "outline" : "default"}
                            className={`rounded-xl shadow-sm ${hasReport ? 'border-green-200 text-green-700 hover:bg-green-50' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
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
        <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl">
          <form onSubmit={onSubmit} className="flex flex-col h-full max-h-[90vh]">
            <div className="p-6 pb-4 border-b border-border bg-card shrink-0">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Bilan de séance
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
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
                <Label className="text-muted-foreground font-semibold text-base flex items-center gap-2">
                  Résumé public
                  <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Visible par le client</span>
                </Label>
                <Textarea 
                  value={publicSummary} 
                  onChange={e => setPublicSummary(e.target.value)} 
                  placeholder="Points positifs de la séance, ressentis, encouragements..." 
                  className="bg-muted/50 border-border text-foreground rounded-xl focus:border-primary/50 min-h-[100px]" 
                />
              </div>

              <div className="space-y-3">
                <Label className="text-muted-foreground font-semibold text-base flex items-center gap-2">
                  Notes privées
                  <span className="text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Seulement pour vous</span>
                </Label>
                <Textarea 
                  value={privateNotes} 
                  onChange={e => setPrivateNotes(e.target.value)} 
                  placeholder="Détails techniques, blessures, rappels pour la prochaine fois..." 
                  className="bg-amber-50/30 border-amber-200 text-foreground rounded-xl focus:border-amber-400/50 min-h-[100px] placeholder:text-amber-900/30" 
                />
              </div>
            </div>

            <div className="p-6 border-t border-border bg-card shrink-0">
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpenModal(false)} className="rounded-xl hover:bg-muted text-foreground">
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold">
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
