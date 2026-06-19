import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dumbbell, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; success?: string }>
}) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D2A26] font-sans flex flex-col">
      {/* Header */}
      <header className="w-full px-4 py-6 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#2D2A26] transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-10">
            <div className="mx-auto bg-white border border-zinc-200 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-yellow-400/40">
              <Dumbbell className="h-6 w-6 text-[#2D2A26]" />
            </div>
            <h1 className="font-serif font-extralight text-4xl tracking-tight text-[#2D2A26] mb-2">
              Créer un compte
            </h1>
            <p className="text-zinc-600 text-sm">
              Rejoignez l'élite des préparateurs.
            </p>
          </div>

          {params?.success ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-8">
              <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-[#2D2A26]" />
              </div>
              <h2 className="text-xl font-bold text-[#2D2A26]">Vérifiez vos e-mails</h2>
              <p className="text-zinc-600">{params.success}</p>
              <Link href="/login" className="mt-4 w-full">
                <Button className="w-full bg-[#2D2A26] hover:bg-[#1A1816] text-white rounded-xl h-12">
                  Aller à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <form action={signup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-zinc-700 font-medium">Nom complet</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  type="text" 
                  placeholder="Ex: John Doe" 
                  required
                  className="h-12 bg-white border-zinc-200 text-[#2D2A26] placeholder:text-zinc-400 focus-visible:ring-zinc-900 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-700 font-medium">Adresse Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="coach@example.com" 
                  required 
                  className="h-12 bg-white border-zinc-200 text-[#2D2A26] placeholder:text-zinc-400 focus-visible:ring-zinc-900 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-700 font-medium">Mot de passe</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  className="h-12 bg-white border-zinc-200 text-[#2D2A26] placeholder:text-zinc-400 focus-visible:ring-zinc-900 rounded-xl"
                />
              </div>
              
              {params?.message && (
                <div className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {params.message}
                </div>
              )}
              
              <div className="pt-2">
                <Button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#2D2A26] hover:bg-[#1A1816] text-white font-medium text-base transition-all active:scale-[0.98]"
                >
                  S'inscrire
                </Button>
              </div>

              <div className="mt-8 text-center text-sm text-zinc-500">
                Déjà inscrit ?{' '}
                <Link href="/login" className="text-[#2D2A26] font-semibold hover:underline">
                  Se connecter
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
