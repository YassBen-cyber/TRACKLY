'use client'

import { TableRow, TableCell } from '@/components/ui/table'
import { Users, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ClientRow({ client }: { client: any }) {
  const router = useRouter()

  return (
    <TableRow 
      onClick={() => router.push(`/coach/client/${client.id}`)}
      className="border-border hover:bg-muted/50 transition-colors group cursor-pointer"
    >
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
          <div className="p-2 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
