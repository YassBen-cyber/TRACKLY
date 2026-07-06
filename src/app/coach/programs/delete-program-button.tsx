'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteProgram } from './actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteProgramButton({ programId, programName }: { programId: string, programName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const res = await deleteProgram(programId)
    setIsDeleting(false)
    if (res?.error) {
      alert(res.error)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      } />
      <AlertDialogContent className="bg-background border-border rounded-3xl p-6 sm:max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-medium text-foreground">Supprimer ce programme ?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer le programme <strong>{programName}</strong> ?<br/><br/>
            Cela supprimera définitivement toutes les séances associées dans ce programme. Les séances déjà assignées aux athlètes ne seront pas affectées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="rounded-xl border-border hover:bg-muted font-medium">Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium shadow-md"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
