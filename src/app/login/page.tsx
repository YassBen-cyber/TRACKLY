import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, Dumbbell } from 'lucide-react'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      
    if (profile?.role === 'coach') {
      redirect('/coach')
    } else {
      redirect('/client')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D2A26] font-sans flex flex-col">
      {/* Header */}
      <header className="w-full px-4 py-6 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#2D2A26] transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-10">
            <div className="mx-auto bg-white border border-zinc-200 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-yellow-400/40">
              <Dumbbell className="h-6 w-6 text-[#2D2A26]" />
            </div>
            <h1 className="font-serif font-extralight text-4xl tracking-tight text-[#2D2A26] mb-2">
              Bon retour
            </h1>
            <p className="text-zinc-600 text-sm">
              Connectez-vous à votre espace personnel.
            </p>
          </div>

          <form action={login} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 font-medium">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="h-12 bg-white border-zinc-200 text-[#2D2A26] placeholder:text-zinc-400 focus-visible:ring-zinc-900 rounded-xl"
                placeholder="vous@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-700 font-medium">Mot de passe</Label>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="h-12 bg-white border-zinc-200 text-[#2D2A26] placeholder:text-zinc-400 focus-visible:ring-zinc-900 rounded-xl"
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit"
              className="w-full h-12 rounded-xl bg-[#2D2A26] hover:bg-[#1A1816] text-white font-bold text-base transition-all shadow-lg shadow-xl shadow-zinc-900/10 active:scale-[0.98]"
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500">
            Vous n'avez pas de compte ?{' '}
            <Link href="/register" className="text-[#2D2A26] font-semibold hover:underline">
              Créer un compte coach
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
