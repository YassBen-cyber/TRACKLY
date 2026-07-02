'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'
import { simulatePayment } from './actions'

export function ClientPayments({ payments }: { payments: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handlePay = async (paymentId: string) => {
    setLoadingId(paymentId)
    try {
      await simulatePayment(paymentId)
      // Mimer un petit délai de traitement pour l'UX
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      console.error(err)
      alert("Erreur lors du paiement")
    } finally {
      setLoadingId(null)
    }
  }

  if (!payments || payments.length === 0) {
    return null
  }

  const pendingPayments = payments.filter(p => p.status === 'pending')
  const pastPayments = payments.filter(p => p.status !== 'pending')

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl mt-8">
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
        <CreditCard className="h-5 w-5 text-emerald-400" />
        Vos Paiements
      </h3>

      {pendingPayments.length > 0 && (
        <div className="mb-8 space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">En attente de paiement</h4>
          {pendingPayments.map(payment => (
            <div key={payment.id} className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div>
                  <div className="text-xl font-bold text-foreground flex items-center gap-2">
                    {payment.title}
                  </div>
                  <div className="text-sm text-emerald-300 mt-1 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> 
                    {payment.due_date ? `À régler avant le ${new Date(payment.due_date).toLocaleDateString('fr-FR')}` : 'À régler dès que possible'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto bg-card p-2 pl-4 rounded-xl border border-border">
                  <span className="text-2xl font-black text-foreground">{payment.amount} €</span>
                  <Button 
                    onClick={() => handlePay(payment.id)} 
                    disabled={loadingId === payment.id}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-primary-foreground shadow-lg shadow-emerald-600/20"
                  >
                    {loadingId === payment.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    Payer (Test)
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pastPayments.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Historique</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastPayments.map(payment => (
              <div key={payment.id} className="p-4 rounded-xl border border-border bg-card flex justify-between items-center">
                <div>
                  <div className="font-bold text-muted-foreground">{payment.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {payment.status === 'paid' && payment.paid_at 
                      ? `Payé le ${new Date(payment.paid_at).toLocaleDateString('fr-FR')}`
                      : 'Annulé'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-muted-foreground">{payment.amount} €</div>
                  {payment.status === 'paid' && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3" /> Validé
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
