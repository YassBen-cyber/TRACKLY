'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2, Clock, Trash2, Users, Edit2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { updatePaymentStatus, deletePayment } from './actions'

export function PaymentsListClient({ initialPayments }: { initialPayments: any[] }) {
  const [payments, setPayments] = useState(initialPayments)
  
  // Filters
  const [filterClient, setFilterClient] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Edit Status Modal
  const [editingPayment, setEditingPayment] = useState<any>(null)
  const [newStatus, setNewStatus] = useState<'pending' | 'paid' | 'cancelled'>('pending')
  const [isUpdating, setIsUpdating] = useState(false)

  // Derived unique clients for the filter
  const uniqueClients = useMemo(() => {
    const clientsMap = new Map()
    initialPayments.forEach(p => {
      if (p.profiles?.full_name) {
        clientsMap.set(p.client_id, p.profiles.full_name)
      }
    })
    return Array.from(clientsMap.entries()).map(([id, name]) => ({ id, name }))
  }, [initialPayments])

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchClient = filterClient === 'all' || p.client_id === filterClient
      const matchStatus = filterStatus === 'all' || p.status === filterStatus
      return matchClient && matchStatus
    })
  }, [payments, filterClient, filterStatus])

  const openEditModal = (payment: any) => {
    setEditingPayment(payment)
    setNewStatus(payment.status)
  }

  const handleUpdateStatus = async () => {
    if (!editingPayment) return
    setIsUpdating(true)
    
    // Optimistic update
    const previousPayments = [...payments]
    setPayments(payments.map(p => 
      p.id === editingPayment.id 
        ? { ...p, status: newStatus, paid_at: newStatus === 'paid' ? new Date().toISOString() : null } 
        : p
    ))
    
    try {
      await updatePaymentStatus(editingPayment.id, newStatus)
      setEditingPayment(null)
    } catch (err) {
      console.error(err)
      setPayments(previousPayments) // revert on error
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (paymentId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette demande de paiement ?")) return
    
    const previousPayments = [...payments]
    setPayments(payments.filter(p => p.id !== paymentId))
    try {
      await deletePayment(paymentId)
    } catch (err) {
      console.error(err)
      setPayments(previousPayments)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-zinc-200">
        <div className="flex-1 space-y-2">
          <Label className="text-zinc-600 text-xs uppercase tracking-wider">Filtrer par athlète</Label>
          <select 
            value={filterClient} 
            onChange={e => setFilterClient(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all" className="bg-zinc-50">Tous les athlètes</option>
            {uniqueClients.map(c => (
              <option key={c.id} value={c.id} className="bg-zinc-50">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-2">
          <Label className="text-zinc-600 text-xs uppercase tracking-wider">Filtrer par statut</Label>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all" className="bg-zinc-50">Tous les statuts</option>
            <option value="pending" className="bg-zinc-50">En attente</option>
            <option value="paid" className="bg-zinc-50">Validé (Payé)</option>
            <option value="cancelled" className="bg-zinc-50">Annulé</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-zinc-300 rounded-xl bg-white text-zinc-600">
          Aucun paiement ne correspond à ces critères.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map(payment => (
            <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-zinc-300 rounded-2xl gap-4 hover:border-white/20 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-zinc-900 text-lg">{payment.title}</span>
                  <span className="font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-lg">{payment.amount} €</span>
                </div>
                <div className="text-sm text-zinc-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1 text-zinc-700">
                    <Users className="h-3 w-3" /> {payment.profiles?.full_name}
                  </span>
                  {payment.due_date && <span>Échéance: {new Date(payment.due_date).toLocaleDateString('fr-FR')}</span>}
                  {payment.status === 'paid' && payment.paid_at && (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Payé le {new Date(payment.paid_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  {payment.status === 'cancelled' && (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Annulé
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => openEditModal(payment)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    payment.status === 'paid' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                    : payment.status === 'cancelled'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30'
                  }`}
                >
                  {payment.status === 'paid' ? <><CheckCircle2 className="h-4 w-4" /> Validé</> : 
                   payment.status === 'cancelled' ? <><AlertCircle className="h-4 w-4" /> Annulé</> :
                   <><Clock className="h-4 w-4" /> En attente</>}
                  <Edit2 className="h-3 w-3 ml-1 opacity-50" />
                </button>
                <button onClick={() => handleDelete(payment.id)} className="p-2 text-zinc-500 hover:text-red-400 bg-white rounded-xl hover:bg-black/40 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Status Modal */}
      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white border-zinc-300 text-zinc-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Modifier le statut</DialogTitle>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <p className="text-zinc-600 text-sm">
              Mettez à jour le statut du paiement <strong className="text-zinc-900">"{editingPayment?.title}"</strong> pour <strong className="text-zinc-900">{editingPayment?.profiles?.full_name}</strong>.
            </p>
            
            <div className="space-y-2">
              <Label className="text-zinc-700">Nouveau Statut</Label>
              <select 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value as any)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="pending" className="bg-zinc-50">En attente</option>
                <option value="paid" className="bg-zinc-50">Validé (Payé)</option>
                <option value="cancelled" className="bg-zinc-50">Annulé</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setEditingPayment(null)} className="rounded-xl hover:bg-zinc-100 text-zinc-900">Annuler</Button>
            <Button type="button" onClick={handleUpdateStatus} disabled={isUpdating} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
