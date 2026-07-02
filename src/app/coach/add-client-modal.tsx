'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { PlusCircle, Loader2, Check, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AddClientModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const fullName = formData.get('fullName') as string

    try {
      const res = await fetch('/api/invite-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'invitation")
      }

      setInviteLink(data.link)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all rounded-xl">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un athlète
        </Button>
      } />
      <DialogContent className="sm:max-w-md border-border bg-muted/50 text-foreground shadow-2xl shadow-primary/10 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Inviter un nouvel athlète</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {inviteLink 
              ? "Le compte a été créé. Copiez ce lien et envoyez-le à votre athlète pour qu'il puisse se connecter."
              : "Générez un lien d'invitation pour votre athlète afin qu'il puisse rejoindre votre équipe."}
          </DialogDescription>
        </DialogHeader>
        {!inviteLink ? (
          <form onSubmit={onSubmit} className="space-y-5 mt-4">
            <div className="space-y-2 group">
              <Label htmlFor="fullName" className="text-muted-foreground group-focus-within:text-primary transition-colors">Nom complet</Label>
              <Input id="fullName" name="fullName" required placeholder="Ex: Teddy Riner" className="bg-card border-border h-11 rounded-xl focus:border-primary/50" />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-muted-foreground group-focus-within:text-primary transition-colors">Adresse e-mail</Label>
              <Input id="email" name="email" type="email" placeholder="athlete@example.com" required className="bg-card border-border h-11 rounded-xl focus:border-primary/50" />
            </div>
            {error && <p className="text-red-400 text-sm font-medium bg-red-400/10 p-2 rounded-lg">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Générer l'invitation"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Input 
                readOnly 
                value={inviteLink} 
                className="bg-card border-border h-11 rounded-xl text-primary font-mono text-sm"
              />
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="h-11 px-3 rounded-xl bg-muted hover:bg-muted text-foreground"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              onClick={() => {
                setOpen(false)
                setTimeout(() => setInviteLink(''), 300)
              }} 
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90"
            >
              Terminer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
