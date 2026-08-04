'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DeleteClientModal({ 
  clientId, 
  clientName, 
  redirectTo = '/coach' 
}: { 
  clientId: string
  clientName: string
  redirectTo?: string
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleDelete() {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/delete-client?id=${clientId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      setOpen(false)
      if (redirectTo) {
        router.push(redirectTo)
        router.refresh()
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button 
          variant="outline" 
          className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all font-medium text-sm flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>Supprimer l'athlète</span>
        </Button>
      } />
      <DialogContent className="sm:max-w-md border-border bg-card text-foreground shadow-2xl shadow-red-950/20 rounded-3xl p-6">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold">Supprimer {clientName} ?</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            Êtes-vous sûr de vouloir supprimer définitivement cet athlète ? Cette action est <strong className="text-foreground">irréversible</strong> et supprimera tous ses entraînements, métriques, rendez-vous et données personnelles.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-xl mt-2">
            {error}
          </p>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="rounded-xl border border-border text-foreground hover:bg-muted"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-600/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer définitivement"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
