'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Target, Edit, Loader2, Trophy } from 'lucide-react'
import { updateClientGoal } from './actions'

export function ClientGoalCard({ clientId, mainGoal }: { clientId: string, mainGoal?: string | null }) {
  const [open, setOpen] = useState(false)
  const [goalText, setGoalText] = useState(mainGoal || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const res = await updateClientGoal(clientId, goalText)
    if (res?.error) {
      setError(res.error)
    } else {
      setOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <div className="glass-panel p-6 rounded-3xl border border-primary/30 bg-primary/5 shadow-md relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-2xl text-primary shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-base tracking-tight flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary" />
                Objectif Principal
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                Rappel Coach
              </span>
            </div>
            {mainGoal ? (
              <p className="text-foreground font-semibold text-lg mt-1 leading-snug">
                "{mainGoal}"
              </p>
            ) : (
              <p className="text-muted-foreground italic text-sm mt-1">
                Aucun objectif défini. Cliquez sur éditer pour fixer l'objectif de l'athlète.
              </p>
            )}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button variant="outline" size="sm" className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 font-semibold text-xs shrink-0 gap-1.5">
              <Edit className="h-3.5 w-3.5" />
              {mainGoal ? "Modifier l'objectif" : "Définir l'objectif"}
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground rounded-2xl p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Objectif principal de l'athlète
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-3">
              {error && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Rappeler l'objectif du coach
                </label>
                <Textarea
                  value={goalText}
                  onChange={e => setGoalText(e.target.value)}
                  placeholder="Ex: Prise de masse propre 82kg d'ici décembre, Prépa Marathon Sub 3h30..."
                  rows={4}
                  className="bg-muted/50 border-border rounded-xl text-sm leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground font-semibold rounded-xl">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
