import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import { CreatePaymentModal } from './create-payment-modal'
import { PaymentsListClient } from './payments-list-client'
import { StripeConnectCard } from './stripe-connect-card'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch coach's profile for Stripe status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch coach's clients for the modal
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('coach_id', user.id)
    .eq('role', 'client')

  // Fetch all payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*, profiles!payments_client_id_fkey(full_name)')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  const totalEarned = (payments || [])
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)

  return (
    <div className="space-y-8">
      {/* Stripe Connect Card Header */}
      <StripeConnectCard profile={profile} totalEarned={totalEarned} />

      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-400" />
            Demandes de Paiements & Factures
          </h2>
          <p className="text-muted-foreground mt-1">
            Gérez vos factures et demandes d'encaissement pour l'ensemble de vos athlètes.
          </p>
        </div>
        <CreatePaymentModal clients={clients || []} />
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <PaymentsListClient initialPayments={payments || []} />
      </div>
    </div>
  )
}
