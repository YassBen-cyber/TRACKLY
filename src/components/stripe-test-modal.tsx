'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Lock, CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react'
import { confirmPaymentSuccess } from '@/app/actions/stripe'

interface StripeTestModalProps {
  isOpen: boolean
  onClose: () => void
  payment: any
  onSuccess: () => void
}

export function StripeTestModal({ isOpen, onClose, payment, onSuccess }: StripeTestModalProps) {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/28')
  const [cvc, setCvc] = useState('123')
  const [nameOnCard, setNameOnCard] = useState('Jean Dupont')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!payment) return null

  const handleTestPay = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      // Simulation du délai du réseau de paiement
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Validation dans la base
      await confirmPaymentSuccess(payment.id, 'card')
      
      setIsProcessing(false)
      setIsSuccess(true)

      setTimeout(() => {
        setIsSuccess(false)
        onSuccess()
        onClose()
      }, 1200)
    } catch (err: any) {
      console.error(err)
      setIsProcessing(false)
      alert(err.message || "Erreur de paiement")
    }
  }

  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242')
    setExpiry('12/28')
    setCvc('123')
    setNameOnCard('Athlète Test')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card border border-border rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Paiement Sécurisé par Carte
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3 text-emerald-400" /> Sécurisé SSL
            </span>
          </div>
          <DialogTitle className="text-2xl font-black text-foreground mt-3 flex items-center gap-2">
            Paiement de {payment.amount} €
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {payment.title} — Règlement sécurisé pour votre coach.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-foreground">Paiement Réussi !</h3>
            <p className="text-muted-foreground text-sm">Le reçu a été transmis à votre coach.</p>
          </div>
        ) : (
          <form onSubmit={handleTestPay} className="space-y-5 mt-2">
            {/* Raccourci Carte Test */}
            <div className="bg-muted/40 p-3 rounded-2xl border border-border flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Carte de démonstration :</span> 4242...4242
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={fillTestCard}
                className="h-8 text-xs font-bold text-primary hover:bg-primary/10 rounded-xl"
              >
                Remplir
              </Button>
            </div>

            {/* Formulaire Carte */}
            <div className="space-y-4 bg-background/50 p-4 rounded-2xl border border-border/80">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Nom sur la carte</Label>
                <Input
                  id="name"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  className="h-11 rounded-xl bg-card border-border font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cardNumber" className="text-xs font-semibold text-muted-foreground">Numéro de carte</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="h-11 rounded-xl bg-card border-border font-mono tracking-wider pl-10"
                    placeholder="4242 4242 4242 4242"
                    required
                  />
                  <CreditCard className="w-5 h-5 text-muted-foreground absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="expiry" className="text-xs font-semibold text-muted-foreground">Expiration</Label>
                  <Input
                    id="expiry"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="h-11 rounded-xl bg-card border-border font-mono text-center"
                    placeholder="MM/AA"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cvc" className="text-xs font-semibold text-muted-foreground">CVC</Label>
                  <Input
                    id="cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="h-11 rounded-xl bg-card border-border font-mono text-center"
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Traitement instantané
              </span>
              <span className="font-semibold">Total : {payment.amount} €</span>
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Validation du paiement...</span>
                </div>
              ) : (
                `Payer ${payment.amount} € par carte bancaire`
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

