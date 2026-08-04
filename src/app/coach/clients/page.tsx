import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, ChevronRight } from 'lucide-react'
import { AddClientModal } from './add-client-modal'
import { ClientRow } from './client-row'

export default async function CoachClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer la liste des clients
  const { data: clients } = await supabase
    .from('profiles')
    .select('*')
    .eq('coach_id', user.id)
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Athlètes</h2>
          <p className="text-muted-foreground text-sm mt-1">Gérez la liste de vos athlètes et accédez à leurs profils.</p>
        </div>
        <AddClientModal />
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-border bg-card/50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-primary" />
            Liste des athlètes
          </h3>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium h-12 px-6">Nom</TableHead>
              <TableHead className="text-muted-foreground font-medium h-12 px-6">Inscrit le</TableHead>
              <TableHead className="text-right text-muted-foreground font-medium h-12 px-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!clients || clients.length === 0 ? (
              <TableRow className="border-border hover:bg-transparent">
                <TableCell colSpan={3} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p>Aucun athlète pour le moment.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <ClientRow key={client.id} client={client} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
