'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Trash2, Dumbbell, Library } from 'lucide-react'
import { saveProgramSession } from '../actions'

type Exercise = {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
}

export function ProgramSessionModal({ 
  programId,
  dayNumber,
  existingSession,
  sessionTemplates,
  open,
  onOpenChange,
}: { 
  programId: string, 
  dayNumber: number,
  existingSession: any,
  sessionTemplates: any[],
  open: boolean,
  onOpenChange: (open: boolean) => void,
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Tab state: 'template' or 'manual'
  const [tab, setTab] = useState('template')
  
  // Template state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  
  // Manual state
  const [title, setTitle] = useState("Nouvelle séance")
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: '', reps: '', rest: '', notes: '' }])

  useEffect(() => {
    if (open) {
      if (existingSession) {
        if (existingSession.session_template_id) {
          setTab('template')
          setSelectedTemplateId(existingSession.session_template_id)
        } else {
          setTab('manual')
          setTitle(existingSession.title)
          setExercises(existingSession.exercises?.length ? existingSession.exercises : [{ name: '', sets: '', reps: '', rest: '', notes: '' }])
        }
      } else {
        setTab('template')
        setSelectedTemplateId('')
        setTitle("Nouvelle séance")
        setExercises([{ name: '', sets: '', reps: '', rest: '', notes: '' }])
      }
      setError(null)
    }
  }, [open, existingSession])

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', rest: '', notes: '' }])
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises]
    newExercises[index][field] = value
    setExercises(newExercises)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    let finalData = {
      session_template_id: null as string | null,
      title: '',
      exercises: [] as Exercise[]
    }

    if (tab === 'template') {
      if (!selectedTemplateId) {
        setError("Veuillez sélectionner un gabarit de séance.")
        setIsLoading(false)
        return
      }
      const template = sessionTemplates.find(t => t.id === selectedTemplateId)
      finalData.session_template_id = selectedTemplateId
      finalData.title = template?.title || 'Séance'
      finalData.exercises = template?.exercises || []
    } else {
      const validExercises = exercises.filter(ex => ex.name.trim() !== '')
      if (!title.trim()) {
        setError("Veuillez donner un nom à la séance.")
        setIsLoading(false)
        return
      }
      finalData.title = title
      finalData.exercises = validExercises
    }

    const res = await saveProgramSession(programId, dayNumber, finalData)
    
    setIsLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 border-b border-border bg-card shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Configurer le Jour {dayNumber}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Assignez une séance existante ou créez-en une spécifiquement pour ce jour.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1 mb-6">
                <TabsTrigger value="template" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  <Library className="h-4 w-4 mr-2" /> Gabarit existant
                </TabsTrigger>
                <TabsTrigger value="manual" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  <Plus className="h-4 w-4 mr-2" /> Création manuelle
                </TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="space-y-4 outline-none">
                <Label className="text-muted-foreground">Sélectionnez une séance dans votre bibliothèque</Label>
                {sessionTemplates.length === 0 ? (
                  <div className="p-4 bg-muted/30 rounded-xl border border-border text-center text-sm text-muted-foreground">
                    Vous n'avez pas encore créé de gabarit de séance dans l'onglet "Workouts".
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                    {sessionTemplates.map((template) => (
                      <div 
                        key={template.id}
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedTemplateId === template.id 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                            : 'border-border bg-card hover:bg-muted/50'
                        }`}
                      >
                        <div className="font-medium text-foreground">{template.title}</div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{template.description || `${template.exercises?.length || 0} exercices`}</div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4 outline-none">
                <div className="space-y-2 group">
                  <Label className="text-muted-foreground group-focus-within:text-primary transition-colors">Nom de la séance</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} required={tab==='manual'} className="bg-card border-border h-11 rounded-xl text-foreground focus:border-primary/50" />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-foreground">Exercices</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addExercise} className="rounded-lg border-border text-primary hover:bg-primary/10 hover:text-primary">
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {exercises.length === 0 && <p className="text-sm text-muted-foreground italic">Aucun exercice.</p>}
                    {exercises.map((ex, idx) => (
                      <div key={idx} className="bg-card border border-border rounded-xl p-4 space-y-3 relative group transition-all">
                        <button type="button" onClick={() => removeExercise(idx)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-xs text-muted-foreground">Nom de l'exercice</Label>
                            <Input value={ex.name} onChange={(e) => updateExercise(idx, 'name', e.target.value)} required={tab==='manual'} placeholder="Ex: Squat" className="h-9 bg-muted/40 border-border text-foreground rounded-lg" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Séries & Répétitions</Label>
                            <div className="flex gap-2">
                              <Input value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', e.target.value)} placeholder="Séries" className="h-9 bg-muted/40 border-border text-foreground rounded-lg w-1/2" />
                              <Input value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', e.target.value)} placeholder="Reps" className="h-9 bg-muted/40 border-border text-foreground rounded-lg w-1/2" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Repos & Notes</Label>
                            <div className="flex gap-2">
                              <Input value={ex.rest} onChange={(e) => updateExercise(idx, 'rest', e.target.value)} placeholder="Repos" className="h-9 bg-muted/40 border-border text-foreground rounded-lg w-1/3" />
                              <Input value={ex.notes} onChange={(e) => updateExercise(idx, 'notes', e.target.value)} placeholder="Consignes" className="h-9 bg-muted/40 border-border text-foreground rounded-lg flex-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="p-6 border-t border-border bg-card shrink-0">
            <DialogFooter className="flex justify-end w-full">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl hover:bg-muted text-foreground">
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enregistrer la séance'}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
