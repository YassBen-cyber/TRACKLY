import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, ChevronRight, Calendar, Activity, TrendingUp } from 'lucide-react'
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

  // Fetch appointments for stats
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, start_time')
    .eq('coach_id', user.id)
    .gte('start_time', new Date().toISOString())
    
  const upcomingCount = appointments?.length || 0
  const activeClientsCount = clients?.length || 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Gérez vos clients et suivez votre activité.</p>
        </div>
        <AddClientModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Athlètes actifs</p>
              <h3 className="text-4xl font-display font-bold text-foreground">{activeClientsCount}</h3>
            </div>
            <div className="p-3 bg-muted rounded-2xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Rendez-vous à venir</p>
              <h3 className="text-4xl font-display font-bold text-foreground">{upcomingCount}</h3>
            </div>
            <div className="p-3 bg-muted rounded-2xl">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Engagement</p>
              <h3 className="text-4xl font-display font-bold text-foreground">Top</h3>
            </div>
            <div className="p-3 bg-muted rounded-2xl">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-border bg-card/50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Activity className="w-5 h-5 text-primary" />
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
                <TableRow key={client.id} className="border-border hover:bg-muted/50 transition-colors group cursor-pointer">
                  <TableCell className="font-semibold text-foreground px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border">
                        {client.photo_url ? (
                          <img src={client.photo_url} alt={client.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                            <Users className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <span>{client.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground px-6 py-4">
                    {new Date(client.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <div className="flex justify-end items-center gap-1">
                      <DeleteClientButton clientId={client.id} clientName={client.full_name} />
                      <Link href={`/coach/client/${client.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors">
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
