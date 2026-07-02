'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, CheckCircle2, X } from 'lucide-react'

export function SetPasswordCard() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    // Ne pas afficher si l'utilisateur a déjà choisi d'ignorer ou a réussi
    if (!localStorage.getItem('hide_password_card')) {
      setIsVisible(true)
    }
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)
      setPassword('')
      localStorage.setItem('hide_password_card', 'true')
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('hide_password_card', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl flex items-center gap-4 text-green-400 shadow-sm glass-panel">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
        <div>
          <h3 className="font-semibold text-lg text-foreground">Mot de passe défini avec succès !</h3>
          <p className="text-sm">Vous pourrez désormais utiliser votre adresse e-mail et ce mot de passe pour vous connecter.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <Lock className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold tracking-tight text-foreground">Sécuriser mon compte</h3>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="text-muted-foreground hover:text-foreground rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Vous avez été invité par votre coach. Définissez un mot de passe pour pouvoir vous reconnecter facilement à l'avenir via la page de connexion.
        </p>
        
        <form onSubmit={onSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2 group">
            <Label htmlFor="new-password" className="text-muted-foreground transition-colors group-focus-within:text-primary">Nouveau mot de passe</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••" 
              className="bg-card border-border text-foreground focus-visible:ring-primary h-11 rounded-xl"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
          
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isLoading} className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Enregistrer mon mot de passe
            </Button>
            <Button type="button" variant="ghost" onClick={handleDismiss} className="h-11 px-4 rounded-xl text-muted-foreground hover:text-foreground">
              Plus tard
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
