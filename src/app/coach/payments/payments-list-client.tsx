'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2, Clock, Trash2, Users, Edit2, AlertCircle, Lock, ShieldAlert, CreditCard, Banknote, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  const [showConfirmLockPopup, setShowConfirmLockPopup] = useState(false)

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
    if (payment.status === 'paid') return // Sécurité : impossible d'éditer un paiement payé
    setEditingPayment(payment)
    setNewStatus(payment.status)
    setShowConfirmLockPopup(false)
  }

  const handleSaveClick = () => {
    if (newStatus === 'paid') {
      // Afficher le popup de confirmation si le coach passe au statut payé
      setShowConfirmLockPopup(true)
    } else {
      executeStatusUpdate()
    }
  }

  const executeStatusUpdate = async () => {
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
      setShowConfirmLockPopup(false)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Erreur lors de la mise à jour")
      setPayments(previousPayments) // revert on error
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (payment: any) => {
    if (payment.status === 'paid') {
      alert("Ce paiement a été validé et réglé. Il est verrouillé et ne peut pas être supprimé.")
      return
    }

    if (!confirm("Voulez-vous vraiment supprimer cette demande de paiement ?")) return
    
    const previousPayments = [...payments]
    setPayments(payments.filter(p => p.id !== payment.id))
    try {
      await deletePayment(payment.id)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Erreur de suppression")
      setPayments(previousPayments)
    }
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20"><Banknote className="w-3.5 h-3.5" /> Espèces</span>
      case 'other':
        return <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20"><Landmark className="w-3.5 h-3.5" /> Virement / Autre</span>
      case 'online':
      case 'stripe':
      case 'stripe_card_test':
      case 'stripe_checkout':
      default:
        return <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20"><CreditCard className="w-3.5 h-3.5" /> Carte bancaire</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="flex-1 space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Filtrer par athlète</Label>
          <select 
            value={filterClient} 
            onChange={e => setFilterClient(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all" className="bg-muted/50">Tous les athlètes</option>
            {uniqueClients.map(c => (
              <option key={c.id} value={c.id} className="bg-muted/50">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Filtrer par statut</Label>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all" className="bg-muted/50">Tous les statuts</option>
            <option value="pending" className="bg-muted/50">En attente</option>
            <option value="paid" className="bg-muted/50">Validé (Payé & Verrouillé)</option>
            <option value="cancelled" className="bg-muted/50">Annulé</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-border rounded-xl bg-card text-muted-foreground">
          Aucun paiement ne correspond à ces critères.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map(payment => (
            <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-card border border-border rounded-2xl gap-4 hover:border-white/20 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-foreground text-lg">{payment.title}</span>
                  <span className="font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-lg">{payment.amount} €</span>
                  {getMethodBadge(payment.payment_method)}
                </div>
                <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <span className="flex items-center gap-1 text-muted-foreground font-medium">
                    <Users className="h-3.5 w-3.5 text-primary" /> {payment.profiles?.full_name}
                  </span>
                  {payment.due_date && <span>Échéance: {new Date(payment.due_date).toLocaleDateString('fr-FR')}</span>}
                  {payment.status === 'paid' && payment.paid_at && (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Payé le {new Date(payment.paid_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  {payment.status === 'cancelled' && (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Annulé
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {payment.status === 'paid' ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm cursor-default">
                    <Lock className="h-3.5 w-3.5" /> Validé & Verrouillé
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => openEditModal(payment)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        payment.status === 'cancelled'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30'
                      }`}
                    >
                      {payment.status === 'cancelled' ? <><AlertCircle className="h-4 w-4" /> Annulé</> : <><Clock className="h-4 w-4" /> En attente</>}
                      <Edit2 className="h-3 w-3 ml-1 opacity-50" />
                    </button>
                    <button 
                      onClick={() => handleDelete(payment)} 
                      className="p-2 text-muted-foreground hover:text-red-400 bg-card rounded-xl hover:bg-muted/40 transition-colors"
                      title="Supprimer la demande"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Status Modal */}
      <Dialog open={!!editingPayment && !showConfirmLockPopup} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Modifier le statut</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <p className="text-muted-foreground text-sm">
              Mettez à jour le statut du paiement <strong className="text-foreground">"{editingPayment?.title}"</strong> pour <strong className="text-foreground">{editingPayment?.profiles?.full_name}</strong>.
            </p>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nouveau Statut</Label>
              <select 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value as any)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="pending" className="bg-muted/50">En attente</option>
                <option value="paid" className="bg-muted/50">Validé (Payé & Verrouiller)</option>
                <option value="cancelled" className="bg-muted/50">Annulé</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setEditingPayment(null)} className="rounded-xl hover:bg-muted text-foreground">Annuler</Button>
            <Button type="button" onClick={handleSaveClick} disabled={isUpdating} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-primary-foreground">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup de confirmation d'action irréversible / verrouillage */}
      <Dialog open={showConfirmLockPopup} onOpenChange={setShowConfirmLockPopup}>
        <DialogContent className="sm:max-w-[440px] bg-card border border-amber-500/30 text-foreground rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold">Confirmer la validation du paiement ?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm pt-2">
              Attention : Une fois marqué comme <strong className="text-emerald-400 font-semibold">Payé</strong>, ce paiement sera définitivement <strong className="text-foreground font-semibold">verrouillé</strong> pour la comptabilité et <strong className="text-foreground font-semibold">ne pourra plus être ni modifié ni supprimé</strong>.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setShowConfirmLockPopup(false)} 
              className="rounded-xl hover:bg-muted text-foreground"
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={executeStatusUpdate} 
              disabled={isUpdating} 
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20"
            >
              {isUpdating ? "Validation..." : "Oui, valider & verrouiller"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

