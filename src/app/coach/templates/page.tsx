import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Target, List } from 'lucide-react'
import { CreateTemplateModal } from './create-template-modal'
import { DeleteTemplateButton } from './delete-template-button'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer la liste des templates de métriques
  const { data: templates } = await supabase
    .from('metric_templates')
    .select('*')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="text-primary h-6 w-6" />
            Templates d'Objectifs (Métriques)
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Créez des ensembles de métriques (ex: Prise de masse, Basket) pour les assigner rapidement à vos athlètes.</p>
        </div>
        <CreateTemplateModal userId={user.id} />
      </div>

      <div className="rounded-2xl border border-border overflow-hidden bg-card backdrop-blur-md shadow-2xl">
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium h-12 px-6">Nom de l'objectif</TableHead>
              <TableHead className="text-muted-foreground font-medium h-12 px-6">Description</TableHead>
              <TableHead className="text-muted-foreground font-medium h-12 px-6">Métriques incluses</TableHead>
              <TableHead className="text-right text-muted-foreground font-medium h-12 px-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!templates || templates.length === 0 ? (
              <TableRow className="border-border hover:bg-transparent">
                <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-card flex items-center justify-center">
                      <Target className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p>Aucun template configuré.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id} className="border-border hover:bg-muted transition-colors group">
                  <TableCell className="font-semibold text-foreground px-6 py-4">{template.name}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-4 max-w-xs truncate">
                    {template.description || <span className="italic opacity-50">Aucune description</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground px-6 py-4 flex flex-wrap gap-2">
                    {Array.isArray(template.metrics) ? (
                      template.metrics.map((m: any, idx: number) => (
                        <span key={idx} className="bg-muted px-2 py-1 rounded text-xs border border-border">
                          {m.name} {m.unit ? `(${m.unit})` : ''}
                        </span>
                      ))
                    ) : (
                      '0 métrique'
                    )}
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <div className="flex justify-end items-center gap-1">
                      <DeleteTemplateButton templateId={template.id} templateName={template.name} />
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
