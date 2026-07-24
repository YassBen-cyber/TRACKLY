'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Dumbbell } from 'lucide-react'
import { EditAssignedSessionModal } from './edit-assigned-session-modal'

export function AssignedSessionsList({ 
  clientId, 
  assignedSessions 
}: { 
  clientId: string, 
  assignedSessions: any[] 
}) {
  const [filter, setFilter] = useState<string>('all')

  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

  const filteredSessions = assignedSessions.filter(session => {
    const isPast = session.scheduled_date < todayStr
    
    if (filter === 'all') return true
    if (filter === 'upcoming') return session.status === 'planned' && !isPast
    if (filter === 'pending') return session.status === 'planned' && isPast
    if (filter === 'completed') return session.status === 'completed'
    if (filter === 'missed') return session.status === 'missed'
    return true
  })

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-blue-500" />
          Séances planifiées
        </h3>
        
        <div className="w-full sm:w-64" style={{ 
  display: 'flex', 
  position: 'relative', 
  justifyContent: 'end', 
  alignItems: 'end', 
  alignContent: 'end' 
}}>
          <Select value={filter} onValueChange={(val) => setFilter(val || '')}>
            <SelectTrigger className="bg-card border-border h-10 rounded-xl text-foreground">
              <SelectValue placeholder="Filtrer par statut..." />
            </SelectTrigger>
            <SelectContent className="bg-muted/50 border-border text-foreground">
              <SelectItem value="all" className="hover:bg-muted focus:bg-muted">Toutes les séances</SelectItem>
              <SelectItem value="upcoming" className="hover:bg-muted focus:bg-muted">À venir</SelectItem>
              <SelectItem value="pending" className="hover:bg-muted focus:bg-muted text-yellow-500">Retour à donner</SelectItem>
              <SelectItem value="completed" className="hover:bg-muted focus:bg-muted text-green-500">Réalisées</SelectItem>
              <SelectItem value="missed" className="hover:bg-muted focus:bg-muted text-red-500">Ratées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredSessions.length === 0 ? (
        <div className="text-center p-6 border border-dashed border-border rounded-xl bg-card text-muted-foreground">
          Aucune séance ne correspond à ce filtre.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredSessions.map(session => {
            const dateObj = new Date(session.scheduled_date)
            const isPast = session.scheduled_date < todayStr
            const isPending = session.status === 'planned' && isPast

            let bgColor = isPast ? 'bg-card border-border' : 'bg-blue-500/10 border-blue-500/20'
            let statusBadge = null

            if (session.status === 'completed') {
              statusBadge = <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Réalisée</span>
            } else if (session.status === 'missed') {
              statusBadge = <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">Ratée</span>
            } else if (isPending) {
              bgColor = 'bg-yellow-500/10 border-yellow-500/20'
              statusBadge = <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 animate-pulse">Retour en attente</span>
            } else {
              statusBadge = <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">À venir</span>
            }

            return (
              <div key={session.id} className={`p-4 rounded-2xl border ${bgColor}`}>
                <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                </div>
                <div className={`font-bold ${isPast ? 'text-muted-foreground' : 'text-blue-400'} flex items-start justify-between`}>
                  <span>{session.title}</span>
                  <EditAssignedSessionModal clientId={clientId} session={session} />
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {session.exercises?.length || 0} exercices
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {statusBadge}
                </div>
                {session.execution_feedback && (
                  <div className="mt-3 text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg italic border border-border line-clamp-2" title={session.execution_feedback}>
                    "{session.execution_feedback}"
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
