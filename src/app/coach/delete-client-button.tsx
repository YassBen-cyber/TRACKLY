'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DeleteClientButton({ clientId, clientName }: { clientId: string, clientName: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${clientName} ? Toutes ses données seront perdues.`)) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/delete-client?id=${clientId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      router.refresh()
    } catch (err: any) {
      alert(err.message)
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={(e) => {
        e.preventDefault()
        handleDelete()
      }}
      disabled={isLoading}
      className="rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors mr-1"
      title="Supprimer le client"
    >
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
    </Button>
  )
}
