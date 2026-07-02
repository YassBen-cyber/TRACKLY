'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Target, CheckCircle2 } from 'lucide-react'
import { applyTemplateToClient } from './actions'

export function AssignTemplateModal({ clientId, templates }: { clientId: string, templates: any[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplateId) {
      setError("Veuillez sélectionner un template.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await applyTemplateToClient(clientId, selectedTemplateId)
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setSelectedTemplateId('')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className=" h-11 rounded-xl bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-all">
          <Target className="mr-2 h-4 w-4" />
          Appliquer un template d'objectif
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl">
        <form onSubmit={onSubmit} className="flex flex-col h-full">
          <div className="p-6 pb-2 border-b border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Assigner un Objectif
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Sélectionnez un template pour initialiser automatiquement les métriques de cet athlète.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-green-400 space-y-3">
                <CheckCircle2 className="h-12 w-12" />
                <p className="font-medium">Template appliqué avec succès !</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {templates.length === 0 ? (
                  <div className="text-center p-6 border border-dashed border-border rounded-xl bg-card">
                    <p className="text-muted-foreground text-sm">Vous n'avez créé aucun template. Allez dans l'onglet "Templates" pour en créer un.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select value={selectedTemplateId} onValueChange={(val) => setSelectedTemplateId(val || '')}>
                      <SelectTrigger className="bg-card border-border h-11 rounded-xl text-foreground">
                        <SelectValue placeholder="Choisir un template..." />
                      </SelectTrigger>
                      <SelectContent className="bg-muted/50 border-border text-foreground">
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id} className="hover:bg-muted focus:bg-muted focus:text-foreground">
                            {t.name} ({Array.isArray(t.metrics) ? t.metrics.length : 0} métriques)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </div>

          {!success && (
            <div className="p-6 border-t border-border bg-card mt-auto">
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-muted text-foreground">
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading || templates.length === 0} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Appliquer'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
