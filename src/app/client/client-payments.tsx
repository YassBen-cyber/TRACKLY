'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { createCheckoutSession } from '@/app/actions/stripe'
import { StripeTestModal } from '@/components/stripe-test-modal'

export function ClientPayments({ payments }: { payments: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedTestPayment, setSelectedTestPayment] = useState<any | null>(null)

  const handlePay = async (payment: any) => {
    setLoadingId(payment.id)
    try {
      const res = await createCheckoutSession(payment.id)
      
      if (res?.url) {
        // Redirection vers le guichet de paiement sécurisé
        window.location.href = res.url
      } else {
        // Ouverture du modal interactif de paiement sécurisé
        setSelectedTestPayment(payment)
      }
    } catch (err: any) {
      console.error(err)
      alert("Erreur lors de la préparation du paiement")
    } finally {
      setLoadingId(null)
    }
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center text-muted-foreground mt-8">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
        <p className="font-semibold text-lg">Aucun paiement enregistré</p>
        <p className="text-sm mt-1">Vous n'avez pas de facture en attente ou d'historique de paiement.</p>
      </div>
    )
  }

  const pendingPayments = payments.filter(p => p.status === 'pending')
  const pastPayments = payments.filter(p => p.status !== 'pending')

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-400" />
          Vos Paiements
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Paiement en ligne sécurisé
        </div>
      </div>

      {pendingPayments.length > 0 && (
        <div className="mb-8 space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">En attente de règlement</h4>
          {pendingPayments.map(payment => (
            <div key={payment.id} className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden group transition-all">
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
                
                <div className="flex items-center gap-4 w-full sm:w-auto bg-card p-2 pl-4 rounded-xl border border-border shadow-sm">
                  <span className="text-2xl font-black text-foreground">{payment.amount} €</span>
                  <Button 
                    onClick={() => handlePay(payment)} 
                    disabled={loadingId === payment.id}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                  >
                    {loadingId === payment.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Payer par carte
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pastPayments.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Historique des transactions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastPayments.map(payment => (
              <div key={payment.id} className="p-4 rounded-2xl border border-border bg-card/60 flex justify-between items-center hover:border-white/20 transition-colors">
                <div>
                  <div className="font-bold text-foreground">{payment.title}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {payment.status === 'paid' && payment.paid_at 
                      ? `Payé le ${new Date(payment.paid_at).toLocaleDateString('fr-FR')}`
                      : 'Annulé'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-foreground">{payment.amount} €</div>
                  {payment.status === 'paid' && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Payé
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de test interactif */}
      <StripeTestModal
        isOpen={!!selectedTestPayment}
        onClose={() => setSelectedTestPayment(null)}
        payment={selectedTestPayment}
        onSuccess={() => {
          window.location.reload()
        }}
      />
    </div>
  )
}

