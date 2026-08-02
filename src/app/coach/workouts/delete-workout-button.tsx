'use client'

import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { deleteWorkoutTemplate } from './actions'

export function DeleteWorkoutButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template de séance ?')) return

    setIsDeleting(true)
    try {
      await deleteWorkoutTemplate(id)
    } catch (err: any) {
      alert(err.message)
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
      title="Supprimer la séance"
    >
      {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
    </button>
  )
}
