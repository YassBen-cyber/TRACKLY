import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, ChevronRight } from 'lucide-react'
import { AddClientModal } from './add-client-modal'
import { DeleteClientButton } from './delete-client-button'

export default async function CoachDashboard() {
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
    <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Users className="text-primary h-6 w-6" />
            Mes Athlètes
          </h2>
          <p className="text-zinc-600 text-sm mt-1">Gérez vos clients et suivez leur progression.</p>
        </div>
        <AddClientModal />
      </div>

      <div className="rounded-2xl border border-zinc-300 overflow-hidden bg-white backdrop-blur-md shadow-2xl">
        <Table>
          <TableHeader className="bg-white">
            <TableRow className="border-zinc-300 hover:bg-transparent">
              <TableHead className="text-zinc-700 font-medium h-12 px-6">Nom</TableHead>
              <TableHead className="text-zinc-700 font-medium h-12 px-6">Inscrit le</TableHead>
              <TableHead className="text-right text-zinc-700 font-medium h-12 px-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!clients || clients.length === 0 ? (
              <TableRow className="border-zinc-200 hover:bg-transparent">
                <TableCell colSpan={3} className="text-center py-16 text-zinc-600">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                      <Users className="h-6 w-6 text-zinc-500" />
                    </div>
                    <p>Aucun athlète pour le moment.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="border-zinc-200 hover:bg-zinc-100 transition-colors group cursor-pointer">
                  <TableCell className="font-semibold text-zinc-900 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 flex-shrink-0">
                        {client.photo_url ? (
                          <img src={client.photo_url} alt={client.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                            <Users className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <span>{client.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600 px-6 py-4">
                    {new Date(client.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <div className="flex justify-end items-center gap-1">
                      <DeleteClientButton clientId={client.id} clientName={client.full_name} />
                      <Link href={`/coach/client/${client.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/20 text-zinc-600 hover:text-primary transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
