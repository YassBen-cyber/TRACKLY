import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClientPayments } from '../client-payments'

export default async function ClientPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Facturation & Paiements</h1>
        <p className="text-muted-foreground mt-1">Gérez vos paiements et consultez vos factures.</p>
      </div>
      <ClientPayments payments={payments || []} />
    </div>
  )
}
