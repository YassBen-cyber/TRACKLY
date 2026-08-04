'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogoutButton } from '@/components/logout-button'
import { User, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SidebarLink {
  href: string
  label: string
  icon: React.ReactNode
}

export interface SidebarProfile {
  full_name?: string | null
  photo_url?: string | null
}

export function CollapsibleSidebar({
  links,
  profile,
  homeHref = '/coach'
}: {
  links: SidebarLink[]
  profile?: SidebarProfile | null
  homeHref?: string
}) {
  const pathname = usePathname()
  // Default to false (collapsed / small icon-only mode) as requested
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const savedState = localStorage.getItem('trackly_sidebar_expanded')
    if (savedState !== null) {
      setIsExpanded(savedState === 'true')
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    localStorage.setItem('trackly_sidebar_expanded', String(newState))
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-background border-r border-border transition-all duration-300 relative z-30 shrink-0 h-screen select-none",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      {/* Floating Expand/Collapse Toggle Button on Sidebar Border */}
      <button
        onClick={toggleSidebar}
        type="button"
        title={isExpanded ? "Réduire le menu" : "Agrandir le menu"}
        className="absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground shadow-md flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Header : Always visible Logo */}
      <div className={cn("h-16 flex items-center border-b border-border transition-all px-4 shrink-0", isExpanded ? "justify-start gap-3" : "justify-center")}>
        <Link href={homeHref} className="flex items-center gap-3 overflow-hidden" title="Accueil Trackly">
          <div className="flex items-center justify-center shrink-0">
            <Image 
              src="/TRACKLY_LOGO.webp" 
              alt="Trackly logo" 
              width={isExpanded ? 38 : 42} 
              height={isExpanded ? 38 : 42} 
              className="object-contain transition-all" 
              priority 
            />
          </div>
          {isExpanded && (
            <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 whitespace-nowrap animate-in fade-in duration-200">
              TRACKLY
            </span>
          )}
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 flex flex-col gap-1.5 no-scrollbar">
        {links.map((link, i) => {
          const isExactOnly = link.href === '/client' || link.href === '/coach'
          const isActive = isExactOnly 
            ? pathname === link.href 
            : pathname === link.href || pathname?.startsWith(link.href + '/')

          return (
            <Link key={i} href={link.href} title={!isExpanded ? link.label : undefined}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full transition-all duration-200 rounded-xl relative group",
                  isActive 
                    ? "font-bold bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                  isExpanded 
                    ? "justify-start px-3 py-2.5 h-11" 
                    : "justify-center p-0 h-11 w-11 mx-auto"
                )}
              >
                <span className={cn("flex items-center justify-center shrink-0", isExpanded ? "mr-3" : "mr-0")}>
                  {link.icon}
                </span>
                
                {isExpanded && (
                  <span className="truncate text-sm whitespace-nowrap animate-in fade-in duration-150">
                    {link.label}
                  </span>
                )}
              </Button>
            </Link>
          )
        })}
      </div>

      {/* Footer Profile & Controls */}
      <div className="p-3 border-t border-border bg-background flex flex-col gap-3">
        {isExpanded ? (
          <>
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/20">
                  {profile?.photo_url ? (
                    <img src={profile.photo_url} alt={profile.full_name || 'Utilisateur'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="text-sm font-bold text-foreground truncate max-w-[110px]">
                  {profile?.full_name || 'Utilisateur'}
                </div>
              </div>
              <ThemeToggle />
            </div>
            <LogoutButton />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-1">
            <div 
              className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/20"
              title={profile?.full_name || 'Utilisateur'}
            >
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt={profile.full_name || 'Utilisateur'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
            <ThemeToggle />
            <LogoutButton iconOnly />
          </div>
        )}
      </div>
    </aside>
  )
}
