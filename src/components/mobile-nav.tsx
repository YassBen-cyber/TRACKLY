'use client'

import { useState } from 'react'
import Link from 'next/link'
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
      {/* Floating Pill Glass Navbar */}
      <header className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-lg rounded-full bg-card/50 dark:bg-card/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.18)] px-4 py-2 flex items-center justify-between transition-all duration-300">
          {/* Logo & Brand */}
          <Link href={pathname?.startsWith('/coach') ? '/coach' : '/client'} className="flex items-center gap-2.5 group">
            <Image src="/TRACKLY_LOGO.webp" alt="Trackly logo" width={32} height={32} className="object-contain" priority />
            <span className="font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
              TRACKLY
            </span>
          </Link>

          {/* Right Controls: Theme Toggle & 2-bar Thin Hamburger */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="relative w-9 h-9 flex flex-col justify-center items-center rounded-full bg-muted/60 hover:bg-muted border border-border/40 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="w-4.5 flex flex-col gap-[5px] items-center justify-center">
                <span
                  className={`h-[1.5px] w-4.5 bg-foreground rounded-full transition-all duration-300 transform origin-center ${
                    open ? 'rotate-45 translate-y-[3.25px]' : ''
                  }`}
                />
                <span
                  className={`h-[1.5px] w-4.5 bg-foreground rounded-full transition-all duration-300 transform origin-center ${
                    open ? '-rotate-45 -translate-y-[3.25px]' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Spacer to prevent content overlap on mobile */}
      <div className="h-16 md:hidden" />

      {/* Dropdown Glass Menu (Appears right underneath the floating pill) */}
      {open && (
        <div className="fixed top-16 inset-x-4 z-40 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-3xl bg-card/75 dark:bg-card/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-5 flex flex-col gap-3 max-h-[78vh] overflow-y-auto custom-scrollbar">
            {/* Links list */}
            <div className="flex flex-col gap-1">
              {links.map((link, i) => {
                const isExactOnly = link.href === '/client' || link.href === '/coach'
                const isActive = isExactOnly 
                  ? pathname === link.href 
                  : pathname === link.href || pathname?.startsWith(link.href + '/')
                  
                return (
                  <Link key={i} href={link.href} onClick={() => setOpen(false)}>
                    <Button 
                      variant={isActive ? "secondary" : "ghost"} 
                      className={`w-full justify-start rounded-2xl h-11 text-sm ${
                        isActive 
                          ? 'font-bold bg-primary/10 text-primary border border-primary/20' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="mr-3 shrink-0">{link.icon}</span>
                      {link.label}
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* Profile & Logout section at bottom */}
            {(profileNode || logoutNode) && (
              <div className="pt-3 border-t border-border/60 flex flex-col gap-3">
                {profileNode && (
                  <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                    {profileNode}
                  </div>
                )}
                {logoutNode && (
                  <div onClick={() => setOpen(false)}>
                    {logoutNode}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
