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
    const isPast = session.scheduled_date <= todayStr
    
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
        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-blue-500" />
          Séances planifiées
        </h3>
        
        <div className="w-full sm:w-64">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="bg-white border-zinc-300 h-10 rounded-xl text-zinc-900">
              <SelectValue placeholder="Filtrer par statut..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-50 border-zinc-300 text-zinc-900">
              <SelectItem value="all" className="hover:bg-zinc-100 focus:bg-zinc-100">Toutes les séances</SelectItem>
              <SelectItem value="upcoming" className="hover:bg-zinc-100 focus:bg-zinc-100">À venir</SelectItem>
              <SelectItem value="pending" className="hover:bg-zinc-100 focus:bg-zinc-100 text-yellow-500">Retour à donner</SelectItem>
              <SelectItem value="completed" className="hover:bg-zinc-100 focus:bg-zinc-100 text-green-500">Réalisées</SelectItem>
              <SelectItem value="missed" className="hover:bg-zinc-100 focus:bg-zinc-100 text-red-500">Ratées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredSessions.length === 0 ? (
        <div className="text-center p-6 border border-dashed border-zinc-300 rounded-xl bg-white text-zinc-600">
          Aucune séance ne correspond à ce filtre.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredSessions.map(session => {
            const dateObj = new Date(session.scheduled_date)
            const isPast = session.scheduled_date <= todayStr
            const isPending = session.status === 'planned' && isPast

            let bgColor = isPast ? 'bg-white border-zinc-200' : 'bg-blue-500/10 border-blue-500/20'
            let statusBadge = null

            if (session.status === 'completed') {
              statusBadge = <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Réalisée</span>
            } else if (session.status === 'missed') {
              statusBadge = <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">Ratée</span>
            } else if (isPending) {
              bgColor = 'bg-yellow-500/10 border-yellow-500/20'
              statusBadge = <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 animate-pulse">Retour en attente</span>
            } else {
              statusBadge = <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-700">À venir</span>
            }

            return (
              <div key={session.id} className={`p-4 rounded-2xl border ${bgColor}`}>
                <div className="text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                </div>
                <div className={`font-bold ${isPast ? 'text-zinc-700' : 'text-blue-400'} flex items-start justify-between`}>
                  <span>{session.title}</span>
                  <EditAssignedSessionModal clientId={clientId} session={session} />
                </div>
                <div className="text-sm text-zinc-600 mt-2">
                  {session.exercises?.length || 0} exercices
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {statusBadge}
                </div>
                {session.execution_feedback && (
                  <div className="mt-3 text-xs text-zinc-600 bg-black/40 p-2 rounded-lg italic border border-zinc-200 line-clamp-2" title={session.execution_feedback}>
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
