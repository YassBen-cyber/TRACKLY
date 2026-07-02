'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Camera, User, Lock, Save, CheckCircle2 } from 'lucide-react'
import { updateProfile } from '@/app/actions/profile'
import { createClient } from '@/utils/supabase/client'

export function ProfileSettings({ profile }: { profile: any }) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [password, setPassword] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo_url || null)
  
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth || '')
  const [address, setAddress] = useState(profile.address || '')
  const [medicalHistory, setMedicalHistory] = useState(profile.medical_history || '')
  
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
      formData.append('dateOfBirth', dateOfBirth)
      formData.append('address', address)
      formData.append('medicalHistory', medicalHistory)
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
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-xl shadow-foreground/5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30">
          <User className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-2xl font-black text-foreground tracking-tight">Profil & Paramètres</h3>
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
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-muted flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-primary-foreground text-xs font-semibold">
              <Camera className="w-5 h-5 mb-1" />
              Modifier
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          <div className="flex-1 space-y-2 w-full">
            <Label htmlFor="fullName" className="text-muted-foreground">Nom complet</Label>
            <Input 
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 rounded-xl bg-card border-border w-full"
              required
            />
          </div>
        </div>

        {profile.role === 'client' && (
          <div className="pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-muted-foreground">Date de naissance</Label>
              <Input 
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="h-11 rounded-xl bg-card border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-muted-foreground">Adresse (Optionnel)</Label>
              <Input 
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-11 rounded-xl bg-card border-border"
                placeholder="Votre adresse complète"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="medicalHistory" className="text-muted-foreground">Antécédents médicaux / Blessures</Label>
              <Textarea 
                id="medicalHistory"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                className="min-h-[100px] rounded-xl bg-card border-border"
                placeholder="Renseignez ici vos allergies, anciennes blessures ou conditions médicales dont le coach devrait être informé..."
              />
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-border">
          <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Sécurité
          </h4>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">Nouveau mot de passe (optionnel)</Label>
            <Input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl bg-card border-border"
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
