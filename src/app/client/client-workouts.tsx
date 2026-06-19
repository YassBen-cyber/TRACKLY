'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, CheckCircle2, XCircle, AlertCircle, Loader2, Dumbbell, Clock } from 'lucide-react'
import { validateSession } from './actions'

export function ClientWorkouts({ sessions }: { sessions: any[] }) {
  const [validatingSession, setValidatingSession] = useState<any>(null)
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState<'completed' | 'missed'>('completed')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

  // Classification des séances
  const upcoming = sessions.filter(s => s.status === 'planned' && s.scheduled_date > todayStr)
  const pending = sessions.filter(s => s.status === 'planned' && s.scheduled_date <= todayStr)
  const history = sessions.filter(s => s.status === 'completed' || s.status === 'missed')

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await validateSession(validatingSession.id, status, feedback)
      setValidatingSession(null)
      setFeedback('')
      setStatus('completed')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderSessionCard = (session: any, type: 'upcoming' | 'pending' | 'history') => {
    const dateObj = new Date(session.scheduled_date)
    const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

    let bgColor = "bg-white border-zinc-300"
    let icon = <Calendar className="h-5 w-5 text-zinc-600" />
    
    if (type === 'pending') {
      bgColor = "bg-yellow-500/10 border-yellow-500/30"
      icon = <AlertCircle className="h-5 w-5 text-yellow-400" />
    } else if (session.status === 'completed') {
      bgColor = "bg-green-500/10 border-green-500/30"
      icon = <CheckCircle2 className="h-5 w-5 text-green-400" />
    } else if (session.status === 'missed') {
      bgColor = "bg-red-500/10 border-red-500/30"
      icon = <XCircle className="h-5 w-5 text-red-400" />
    }

    return (
      <div key={session.id} className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all hover:scale-[1.02] ${bgColor}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-zinc-700 capitalize">{formattedDate}</span>
          </div>
          {type === 'pending' && (
            <span className="text-xs font-bold text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-md animate-pulse">
              À Valider
            </span>
          )}
          {session.status === 'completed' && (
            <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded-md">
              Réalisée
            </span>
          )}
          {session.status === 'missed' && (
            <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-md">
              Ratée
            </span>
          )}
        </div>
        
        <div>
          <h4 className="text-lg font-bold text-zinc-900 leading-tight">{session.title}</h4>
          <div className="mt-3 space-y-2">
            {session.exercises && session.exercises.length > 0 ? (
              session.exercises.map((ex: any, idx: number) => (
                <div key={idx} className="bg-black/40 p-2.5 rounded-lg border border-zinc-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-zinc-900">{ex.name}</span>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {ex.sets}x{ex.reps}
                    </span>
                  </div>
                  {(ex.rest || ex.notes) && (
                    <div className="text-xs text-zinc-600 flex flex-wrap gap-2">
                      {ex.rest && <span>⏳ Repos: {ex.rest}</span>}
                      {ex.notes && <span className="italic truncate" title={ex.notes}>📝 {ex.notes}</span>}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 italic">Aucun exercice renseigné.</p>
            )}
          </div>
        </div>

        {type === 'pending' && (
          <Button 
            onClick={() => setValidatingSession(session)}
            className="mt-2 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold shadow-lg shadow-yellow-500/20"
          >
            Faire mon retour
          </Button>
        )}

        {type === 'history' && session.execution_feedback && (
          <div className="mt-2 text-sm text-zinc-700 bg-black/40 p-3 rounded-xl border border-zinc-200 italic">
            "{session.execution_feedback}"
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* En attente de validation */}
      {pending.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-yellow-500/20 shadow-2xl shadow-yellow-500/5">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2 mb-6">
            <AlertCircle className="h-6 w-6 text-yellow-400" />
            Séances en attente de retour
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pending.map(s => renderSessionCard(s, 'pending'))}
          </div>
        </div>
      )}

      {/* À venir */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2 mb-6">
          <Clock className="h-6 w-6 text-blue-400" />
          Prochains entraînements
        </h3>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 bg-white rounded-2xl border border-dashed border-zinc-300">
            Aucune séance planifiée dans le futur.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcoming.map(s => renderSessionCard(s, 'upcoming'))}
          </div>
        )}
      </div>

      {/* Historique */}
      {history.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200 opacity-80 hover:opacity-100 transition-opacity">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2 mb-6">
            <CheckCircle2 className="h-6 w-6 text-zinc-600" />
            Historique
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {history.map(s => renderSessionCard(s, 'history'))}
          </div>
        </div>
      )}

      {/* Modal de Validation */}
      <Dialog open={!!validatingSession} onOpenChange={(open) => !open && setValidatingSession(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white border-zinc-300 text-zinc-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Valider la séance</DialogTitle>
            <DialogDescription className="text-zinc-600">
              Avez-vous réalisé la séance "{validatingSession?.title}" prévue le {validatingSession ? new Date(validatingSession.scheduled_date).toLocaleDateString('fr-FR') : ''} ?
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleValidate} className="space-y-6 pt-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={status === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatus('completed')}
                className={`flex-1 h-12 rounded-xl ${status === 'completed' ? 'bg-green-600 hover:bg-green-700 text-zinc-900 border-none' : 'border-zinc-300 text-zinc-600 hover:text-zinc-900'}`}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> Oui, réalisée
              </Button>
              <Button
                type="button"
                variant={status === 'missed' ? 'default' : 'outline'}
                onClick={() => setStatus('missed')}
                className={`flex-1 h-12 rounded-xl ${status === 'missed' ? 'bg-red-600 hover:bg-red-700 text-zinc-900 border-none' : 'border-zinc-300 text-zinc-600 hover:text-zinc-900'}`}
              >
                <XCircle className="mr-2 h-5 w-5" /> Non, ratée
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-700">
                {status === 'completed' ? "Quels sont vos ressentis ? (Difficulté, douleurs, perfs...)" : "Une raison particulière ? (Optionnel)"}
              </label>
              <Textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={status === 'completed' ? "Ex: Bonne séance, mais le squat était lourd..." : "Ex: Manque de temps..."}
                className="bg-white border-zinc-300 text-zinc-900 rounded-xl min-h-[100px] focus:border-primary/50"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setValidatingSession(null)} className="rounded-xl hover:bg-zinc-100 text-zinc-900">
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-primary hover:bg-primary/90 text-white">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enregistrer mon retour'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
