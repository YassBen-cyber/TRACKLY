import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard, CheckCircle2, Clock, Trash2, Users } from 'lucide-react'
import { CreatePaymentModal } from './create-payment-modal'
import { PaymentsListClient } from './payments-list-client'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-400" />
            Paiements & Facturation
          </h2>
          <p className="text-zinc-600 mt-1">
            Gérez vos demandes de paiements pour l'ensemble de vos athlètes.
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
