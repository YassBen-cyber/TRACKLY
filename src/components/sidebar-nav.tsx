'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'

export function SidebarNav({ links }: { links: { href: string, label: string, icon: React.ReactNode }[] }) {
  const pathname = usePathname()

  return (
    <>
      {links.map((link, i) => {
        // Pour les pages d'accueil (/client ou /coach), on demande une correspondance exacte.
        // Sinon, on accepte les sous-pages (ex: /client/workouts/1)
        const isExactOnly = link.href === '/client' || link.href === '/coach'
        const isActive = isExactOnly 
          ? pathname === link.href 
          : pathname === link.href || pathname?.startsWith(link.href + '/')

        return (
          <Link key={i} href={link.href}>
            <Button 
              variant={isActive ? "secondary" : "ghost"} 
              className={`w-full justify-start ${isActive ? 'font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <span className="mr-3">{link.icon}</span>
              {link.label}
            </Button>
          </Link>
        )
      })}
    </>
  )
}
