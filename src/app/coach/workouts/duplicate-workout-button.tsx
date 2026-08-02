'use client'

import { useState } from 'react'
import { Loader2, Copy } from 'lucide-react'
import { duplicateWorkoutTemplate } from './actions'

export function DuplicateWorkoutButton({ id }: { id: string }) {
  const [isDuplicating, setIsDuplicating] = useState(false)

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      await duplicateWorkoutTemplate(id)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={isDuplicating}
      className="p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
      title="Dupliquer la séance"
    >
      {isDuplicating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Copy className="h-5 w-5" />}
    </button>
  )
}
