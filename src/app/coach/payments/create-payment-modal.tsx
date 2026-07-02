'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Plus, CreditCard } from 'lucide-react'
import { createPayment } from './actions'

export function CreatePaymentModal({ clients }: { clients: any[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!clientId || !title || !amount) {
      setError("Le client, le titre et le montant sont obligatoires.")
      setIsLoading(false)
      return
    }

    try {
      await createPayment(clientId, title, parseFloat(amount), dueDate)
      setOpen(false)
      setClientId('')
      setTitle('')
      setAmount('')
      setDueDate('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-primary-foreground shadow-lg shadow-emerald-600/20">
          <Plus className="h-4 w-4 mr-2" /> Demander un paiement
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-400" />
            Nouveau Paiement
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          {error && <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-sm">{error}</div>}
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Client</Label>
            <select 
              value={clientId} 
              onChange={e => setClientId(e.target.value)}
              required
              className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="" disabled className="bg-muted/50 text-muted-foreground">Sélectionner un athlète...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-muted/50 text-foreground py-2">
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Titre (Ex: Coaching Juin)</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required className="bg-card border-border h-11 rounded-xl text-foreground focus:border-emerald-500/50" />
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Montant (€)</Label>
            <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="bg-card border-border h-11 rounded-xl text-foreground focus:border-emerald-500/50" />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Date d'échéance (Optionnel)</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-card border-border h-11 rounded-xl text-foreground focus:border-emerald-500/50 dark:[color-scheme:dark]" />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl hover:bg-muted text-foreground">Annuler</Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-primary-foreground">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
