'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, CalendarRange } from 'lucide-react'
import { assignProgramToClient } from '../../programs/actions'

export function AssignProgramModal({ 
  clientId,
  programs
}: { 
  clientId: string,
  programs: any[]
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Default start date to today
  const today = new Date().toISOString().split('T')[0]

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('client_id', clientId)

    const res = await assignProgramToClient(formData)
    
    setIsLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="border-border text-foreground rounded-xl shadow-sm hover:bg-muted/50 transition-all">
          <CalendarRange className="mr-2 h-4 w-4 text-primary" />
          Assigner un programme
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-2xl shadow-xl">
        <form onSubmit={onSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-primary" />
              Assigner un programme
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              Les séances de ce programme seront planifiées automatiquement à partir de la date choisie.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="program_id" className="text-sm font-medium text-foreground">Programme à assigner</label>
              {programs.length === 0 ? (
                <div className="p-3 bg-muted/30 rounded-xl border border-border text-sm text-muted-foreground">
                  Vous n'avez pas encore créé de programme.
                </div>
              ) : (
                <select 
                  id="program_id" 
                  name="program_id" 
                  required
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sélectionnez un programme...</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.duration_days} jours)</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="start_date" className="text-sm font-medium text-foreground">Date de début</label>
              <Input 
                id="start_date" 
                name="start_date" 
                type="date" 
                defaultValue={today}
                required 
                className="bg-card border-border h-11 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-muted text-foreground">
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || programs.length === 0} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Assigner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
