'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Activity, Plus, Camera, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react'
import { addClientMetricValue } from './actions'
import { Pencil } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function ClientMetrics({ metricTypes, metricValues }: { metricTypes: any[], metricValues: any[] }) {
  const [selectedType, setSelectedType] = useState<any>(metricTypes[0] || null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingValue, setEditingValue] = useState<any>(null)
  const [editVal, setEditVal] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null)
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null)
  const [value, setValue] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  // Grouper les valeurs par type de métrique
  const groupedValues = metricTypes.reduce((acc: any, type: any) => {
    acc[type.id] = metricValues
      .filter((v: any) => v.metric_type_id === type.id)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((v: any) => ({
        ...v,
        formattedDate: new Date(v.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      }))
    return acc
  }, {})

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

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !value) return

    setIsSubmitting(true)
    try {
      let finalPhotoUrl = null

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `metrics/${fileName}`
        
        const { error: uploadError, data } = await supabase.storage
          .from('photos')
          .upload(filePath, photoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath)
          
        finalPhotoUrl = publicUrl
      }

      await addClientMetricValue(selectedType.id, parseFloat(value), finalPhotoUrl)
      setValue('')
      setPhotoFile(null)
      setPhotoPreview(null)
      setIsAdding(false)
    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'ajout de la métrique")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingValue || !editVal || !editDate) return

    setIsSubmitting(true)
    try {
      let finalPhotoUrl = editingValue.photo_url

      if (editPhotoFile) {
        const fileExt = editPhotoFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `metrics/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, editPhotoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath)
          
        finalPhotoUrl = publicUrl
      }

      await import('./actions').then(m => m.updateClientMetricValue(editingValue.id, parseFloat(editVal), finalPhotoUrl, editDate))
      setEditingValue(null)
      setEditPhotoFile(null)
      setEditPhotoPreview(null)
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la modification de la métrique")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentValues = selectedType ? groupedValues[selectedType.id] || [] : []

  if (metricTypes.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center border border-border">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Suivi de progression</h3>
        <p className="text-muted-foreground">Votre coach n'a pas encore défini d'objectifs de suivi pour vous.</p>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-xl shadow-foreground/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-black text-foreground tracking-tight">Ma Progression</h3>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Ajouter une mesure
            </Button>
          } />
          <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Nouvelle mesure</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label>Métrique</Label>
                <select 
                  className="w-full h-11 px-3 rounded-xl border border-border bg-card"
                  value={selectedType?.id || ''}
                  onChange={(e) => setSelectedType(metricTypes.find((t: any) => t.id === e.target.value))}
                >
                  {metricTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Valeur ({selectedType?.unit})</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  required 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="h-11 rounded-xl bg-card border-border" 
                  placeholder="Ex: 75.5"
                />
              </div>

              <div className="space-y-2">
                <Label>Photo de progression (Optionnel)</Label>
                <div className="flex items-center gap-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="h-24 object-cover rounded-lg" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground font-medium">Ajouter une photo</p>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg font-bold">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enregistrer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {metricTypes.map((type: any) => (
          <Button
            key={type.id}
            variant={selectedType?.id === type.id ? 'default' : 'outline'}
            onClick={() => setSelectedType(type)}
            className={`rounded-full px-6 transition-all ${
              selectedType?.id === type.id 
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md' 
                : 'border-border text-muted-foreground hover:text-foreground bg-card'
            }`}
          >
            {type.name}
          </Button>
        ))}
      </div>

      {currentValues.length > 0 ? (
        <div className="space-y-8">
          <div className="h-[300px] w-full bg-card p-4 rounded-2xl border border-border">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentValues}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="formattedDate" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#18181b', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#fb923c" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#fb923c', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentValues.map((v: any) => (
              <div key={v.id} className="bg-card p-4 rounded-2xl border border-border flex flex-col items-center text-center relative group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => {
                      setEditingValue(v)
                      setEditVal(v.value.toString())
                      setEditDate(v.date.split('T')[0])
                      setEditPhotoFile(null)
                      setEditPhotoPreview(v.photo_url || null)
                    }} 
                    className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={async () => {
                      if (confirm("Voulez-vous vraiment supprimer cette mesure ?")) {
                        await import('./actions').then(m => m.deleteClientMetricValue(v.id))
                      }
                    }} 
                    className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <span className="text-sm font-medium text-muted-foreground mb-1">{v.formattedDate}</span>
                <span className="text-2xl font-black text-foreground">{v.value} <span className="text-sm font-semibold text-muted-foreground">{selectedType.unit}</span></span>
                {v.photo_url && (
                  <Dialog>
                    <DialogTrigger render={
                      <button className="mt-3 text-primary hover:text-primary/80 transition-colors">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-border shadow-sm relative group/img">
                          <img src={v.photo_url} alt="Progression" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-muted/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-primary-foreground" />
                          </div>
                        </div>
                      </button>
                    } />
                    <DialogContent className="sm:max-w-xl bg-transparent border-none shadow-none p-0 overflow-hidden rounded-3xl">
                      <img src={v.photo_url} alt="Progression détaillée" className="w-full h-auto object-contain rounded-3xl" />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune donnée enregistrée pour cette métrique.</p>
        </div>
      )}

      {/* Modal d'édition */}
      <Dialog open={!!editingValue} onOpenChange={(open) => !open && setEditingValue(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Modifier la mesure</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date" 
                required 
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="h-11 rounded-xl bg-card border-border" 
              />
            </div>
            <div className="space-y-2">
              <Label>Valeur ({selectedType?.unit})</Label>
              <Input 
                type="number" 
                step="0.1" 
                required 
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                className="h-11 rounded-xl bg-card border-border" 
              />
            </div>
            <div className="space-y-2">
              <Label>Photo de progression (Optionnel)</Label>
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {editPhotoPreview ? (
                      <img src={editPhotoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground font-medium">Modifier la photo</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleEditPhotoUpload} />
                </label>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg font-bold">
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enregistrer les modifications"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
