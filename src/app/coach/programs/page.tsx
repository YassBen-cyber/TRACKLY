import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarRange, ChevronRight } from 'lucide-react'
import { CreateProgramModal } from './create-program-modal'
import { DeleteProgramButton } from './delete-program-button'

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get programs
  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarRange className="text-primary h-6 w-6" />
            Programmes d'Entraînement
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Créez des programmes sur plusieurs jours et assignez-les en un clic.</p>
        </div>
        <CreateProgramModal />
      </div>

      <div className="rounded-2xl border border-border overflow-hidden bg-card backdrop-blur-md shadow-2xl">
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium h-12 px-6">Nom du programme</TableHead>
              <TableHead className="text-muted-foreground font-medium h-12 px-6">Description</TableHead>
              <TableHead className="text-muted-foreground font-medium h-12 px-6">Durée</TableHead>
              <TableHead className="text-right text-muted-foreground font-medium h-12 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!programs || programs.length === 0 ? (
              <TableRow className="border-border hover:bg-transparent">
                <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-card flex items-center justify-center">
                      <CalendarRange className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p>Aucun programme créé pour le moment.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => (
                <TableRow key={program.id} className="border-border hover:bg-muted transition-colors group">
                  <TableCell className="font-semibold text-foreground px-6 py-4">
                    <Link href={`/coach/programs/${program.id}`} className="hover:text-primary hover:underline transition-colors flex items-center gap-2">
                      {program.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground px-6 py-4 max-w-xs truncate">
                    {program.description || <span className="italic opacity-50">Aucune description</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground px-6 py-4">
                    <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium border border-border">
                      {program.duration_days} jours
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6 py-4 relative z-20">
                    <div className="flex justify-end items-center gap-2">
                      <DeleteProgramButton programId={program.id} programName={program.title} />
                      <Link href={`/coach/programs/${program.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl">
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
