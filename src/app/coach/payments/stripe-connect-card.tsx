'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, Zap, Loader2, CheckCircle2, Building2 } from 'lucide-react'
import { connectStripeAccount, disconnectStripeAccount } from '@/app/actions/stripe'

interface StripeConnectCardProps {
  profile: any
  totalEarned: number
}

export function StripeConnectCard({ profile, totalEarned }: StripeConnectCardProps) {
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState<boolean>(Boolean(profile?.stripe_connected))

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await connectStripeAccount()
      if (res && res.error) {
        alert(res.error)
        return
      }
      if (res && res.url) {
        window.location.href = res.url
      } else if (res && res.isMock) {
        setIsConnected(true)
        alert("Connecté en mode simulation avec succès.")
      }
    } catch (err: any) {
      console.error(err)
      alert("Erreur Stripe : " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm("Voulez-vous déconnecter le compte de virement ?")) return
    setLoading(true)
    try {
      await disconnectStripeAccount()
      setIsConnected(false)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card relative overflow-hidden shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Paiements en ligne activés
            </span>
            {isConnected ? (
              <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> IBAN Réception Connecté
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">
                IBAN Non Renseigné
              </span>
            )}
          </div>

          <h3 className="text-xl font-extrabold text-foreground tracking-tight">
            Virements Automatiques sur votre IBAN
          </h3>
          <p className="text-muted-foreground text-sm max-w-xl">
            Renseignez votre IBAN pour recevoir directement les encaissements de vos élèves. Les fonds réglés en ligne sont transférés directement sur votre compte bancaire.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleConnect}
                disabled={loading}
                variant="outline"
                className="rounded-xl border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Building2 className="w-4 h-4 mr-2" />}
                Gérer sur Stripe
              </Button>
              <Button
                type="button"
                onClick={handleDisconnect}
                disabled={loading}
                variant="ghost"
                className="rounded-xl text-xs text-muted-foreground hover:text-red-400"
              >
                Déconnecter
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleConnect}
              disabled={loading}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-6 shadow-lg shadow-emerald-600/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Building2 className="w-5 h-5 mr-2" />}
              Configurer mon compte bancaire
            </Button>
          )}
        </div>
      </div>


      {/* Résumé financier */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/60">
        <div className="p-4 rounded-2xl bg-card/60 border border-border">
          <div className="text-xs text-muted-foreground font-semibold uppercase">Total Encaissé</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{totalEarned} €</div>
        </div>
        <div className="p-4 rounded-2xl bg-card/60 border border-border">
          <div className="text-xs text-muted-foreground font-semibold uppercase">Frais Plateforme (Trackly)</div>
          <div className="text-2xl font-black text-foreground font-mono mt-1">2.0 %</div>
        </div>
        <div className="p-4 rounded-2xl bg-card/60 border border-border">
          <div className="text-xs text-muted-foreground font-semibold uppercase">Virement vers IBAN</div>
          <div className="text-2xl font-black text-foreground font-mono mt-1">Automatique</div>
        </div>
      </div>
    </div>
  )
}

