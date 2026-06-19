'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteTemplate } from './actions'

export function DeleteTemplateButton({ templateId, templateName }: { templateId: string, templateName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le gabarit "${templateName}" ?`)) {
      return
    }

    setIsDeleting(true)
    await deleteTemplate(templateId)
    setIsDeleting(false)
  }

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-full text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      title="Supprimer ce gabarit"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}
