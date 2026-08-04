'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'

export function LogoutButton({ 
  className,
  onLogout,
  iconOnly = false
}: { 
  className?: string
  onLogout?: () => void 
  iconOnly?: boolean
}) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    if (isLoading) return
    setIsLoading(true)
    
    if (onLogout) {
      onLogout()
    }

    try {
      // 1. Déconnexion côté client Supabase
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Client logout error:', e)
    }

    try {
      // 2. Déconnexion côté serveur (nettoyage des cookies HTTP Supabase SSR)
      await logoutAction()
    } catch (e) {
      console.error('Server logout action error:', e)
    }

    // 3. Suppression manuelle de secours des cookies Supabase dans le navigateur
    try {
      if (typeof document !== 'undefined') {
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=")
          const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim()
          if (name.startsWith("sb-") || name.includes("auth-token")) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          }
        })
      }
    } catch (e) {
      console.error('Cookie clearing error:', e)
    }

    // 4. Redirection forcée vers la page de connexion
    window.location.href = '/login'
  }

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        disabled={isLoading}
        title="Déconnexion"
        className={className || "w-10 h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <LogOut className="h-5 w-5 text-red-500" />
        )}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleLogout}
      disabled={isLoading}
      className={className || "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"}
    >
      {isLoading ? (
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
      ) : (
        <LogOut className="mr-3 h-5 w-5 text-red-500" />
      )}
      Déconnexion
    </Button>
  )
}

