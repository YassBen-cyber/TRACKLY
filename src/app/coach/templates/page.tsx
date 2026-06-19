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

  // Récupérer la liste des gabarits de métriques
  const { data: templates } = await supabase
    .from('metric_templates')
    .select('*')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Target className="text-primary h-6 w-6" />
            Gabarits d'Objectifs (Métriques)
          </h2>
          <p className="text-zinc-600 text-sm mt-1">Créez des ensembles de métriques (ex: Prise de masse, Basket) pour les assigner rapidement à vos athlètes.</p>
        </div>
        <CreateTemplateModal userId={user.id} />
      </div>

      <div className="rounded-2xl border border-zinc-300 overflow-hidden bg-white backdrop-blur-md shadow-2xl">
        <Table>
          <TableHeader className="bg-white">
            <TableRow className="border-zinc-300 hover:bg-transparent">
              <TableHead className="text-zinc-700 font-medium h-12 px-6">Nom de l'objectif</TableHead>
              <TableHead className="text-zinc-700 font-medium h-12 px-6">Description</TableHead>
              <TableHead className="text-zinc-700 font-medium h-12 px-6">Métriques incluses</TableHead>
              <TableHead className="text-right text-zinc-700 font-medium h-12 px-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!templates || templates.length === 0 ? (
              <TableRow className="border-zinc-200 hover:bg-transparent">
                <TableCell colSpan={4} className="text-center py-16 text-zinc-600">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                      <Target className="h-6 w-6 text-zinc-500" />
                    </div>
                    <p>Aucun gabarit configuré.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id} className="border-zinc-200 hover:bg-zinc-100 transition-colors group">
                  <TableCell className="font-semibold text-zinc-900 px-6 py-4">{template.name}</TableCell>
                  <TableCell className="text-zinc-600 px-6 py-4 max-w-xs truncate">
                    {template.description || <span className="italic opacity-50">Aucune description</span>}
                  </TableCell>
                  <TableCell className="text-zinc-600 px-6 py-4 flex flex-wrap gap-2">
                    {Array.isArray(template.metrics) ? (
                      template.metrics.map((m: any, idx: number) => (
                        <span key={idx} className="bg-zinc-100 px-2 py-1 rounded text-xs border border-zinc-300">
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
