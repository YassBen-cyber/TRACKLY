'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Camera, User, Lock, Save, CheckCircle2 } from 'lucide-react'
import { updateProfile } from '@/app/actions/profile'
import { createClient } from '@/utils/supabase/client'

export function ProfileSettings({ profile }: { profile: any }) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [password, setPassword] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo_url || null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      let finalPhotoUrl = profile.photo_url

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `avatars/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, photoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath)
          
        finalPhotoUrl = publicUrl
      }

      const formData = new FormData()
      formData.append('fullName', fullName)
      if (finalPhotoUrl) {
        formData.append('photoUrl', finalPhotoUrl)
      }
      if (password) {
        formData.append('password', password)
      }

      await updateProfile(formData)
      setSuccess(true)
      setPassword('')
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/20 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30">
          <User className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Profil & Paramètres</h3>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5" />
          <span>Profil mis à jour avec succès !</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          <label className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-zinc-100 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-zinc-300" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold">
              <Camera className="w-5 h-5 mb-1" />
              Modifier
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          <div className="flex-1 space-y-2 w-full">
            <Label htmlFor="fullName" className="text-zinc-700">Nom complet</Label>
            <Input 
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 rounded-xl bg-white border-zinc-300 w-full"
              required
            />
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200">
          <h4 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-zinc-500" />
            Sécurité
          </h4>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-700">Nouveau mot de passe (optionnel)</Label>
            <Input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl bg-white border-zinc-300"
              placeholder="Laissez vide pour conserver l'actuel"
              minLength={6}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20">
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </form>
    </div>
  )
}
