'use client'

import { useState } from 'react'
import { ProgramSessionModal } from './program-session-modal'
import { Plus, Dumbbell, Trash2, Loader2 } from 'lucide-react'
import { deleteProgramSession } from '../actions'
import { Button } from '@/components/ui/button'

export function ProgramGrid({ 
  program, 
  programSessions, 
  sessionTemplates 
}: { 
  program: any, 
  programSessions: any[], 
  sessionTemplates: any[] 
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [deletingDay, setDeletingDay] = useState<number | null>(null)

  const handleOpenModal = (dayNumber: number) => {
    setSelectedDay(dayNumber)
    setModalOpen(true)
  }

  const handleDeleteSession = async (e: React.MouseEvent, dayNumber: number) => {
    e.stopPropagation()
    if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      setDeletingDay(dayNumber)
      await deleteProgramSession(program.id, dayNumber)
      setDeletingDay(null)
    }
  }

  // Create an array of days from 1 to duration_days
  const days = Array.from({ length: program.duration_days }, (_, i) => i + 1)

  // Find the session for the selected day
  const selectedSession = selectedDay ? programSessions.find(s => s.day_number === selectedDay) : null

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {days.map((day) => {
          const session = programSessions.find(s => s.day_number === day)

          return (
            <div 
              key={day}
              onClick={() => handleOpenModal(day)}
              className={`relative flex flex-col rounded-2xl border transition-all cursor-pointer overflow-hidden min-h-[160px] ${
                session 
                  ? 'bg-card border-primary/30 hover:border-primary/60 shadow-sm hover:shadow-md' 
                  : 'bg-muted/10 border-dashed border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <div className="px-4 py-3 border-b border-border/50 flex justify-between items-center bg-card/50">
                <span className="font-medium text-sm text-foreground">Jour {day}</span>
                {session && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive z-10"
                    onClick={(e) => handleDeleteSession(e, day)}
                    disabled={deletingDay === day}
                  >
                    {deletingDay === day ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </Button>
                )}
              </div>
              
              <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                {session ? (
                  <div className="space-y-2 w-full">
                    <div className="flex justify-center mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground line-clamp-2 text-sm">{session.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {session.exercises?.length || 0} exercice(s)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Repos / Ajouter</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedDay && (
        <ProgramSessionModal
          programId={program.id}
          dayNumber={selectedDay}
          existingSession={selectedSession}
          sessionTemplates={sessionTemplates}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </>
  )
}
