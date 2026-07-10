'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function MobileNav({ links, profileNode, logoutNode }: { 
  links: { href: string, label: string, icon: React.ReactNode }[],
  profileNode?: React.ReactNode,
  logoutNode?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <div className="bg-background border-b border-border p-4 flex justify-between items-center transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="mr-1">
            <Menu className="h-6 w-6" />
          </Button>
          <Link href={pathname?.startsWith('/coach') ? '/coach' : '/client'} className="flex items-center gap-2">
            <Image src="/TRACKLY_LOGO.webp" alt="Trackly logo" width={32} height={32} className="object-contain" priority />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">TRACKLY</span>
          </Link>
        </div>
        <ThemeToggle />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <span className="font-bold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
              {links.map((link, i) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
                return (
                  <Link key={i} href={link.href} onClick={() => setOpen(false)}>
                    <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
                      <span className="mr-3">{link.icon}</span>
                      {link.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
            <div className="p-4 border-t border-border flex flex-col gap-4">
              {profileNode}
              <div onClick={() => setOpen(false)}>
                {logoutNode}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
