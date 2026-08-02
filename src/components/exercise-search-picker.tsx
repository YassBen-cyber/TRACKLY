'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Video, FileText } from 'lucide-react'

export interface LibraryExercise {
  id: string
  name: string
  notes?: string
  video_url?: string
}

interface ExerciseSearchPickerProps {
  libraryExercises: LibraryExercise[]
  onSelect: (exercise: LibraryExercise) => void
}

export function ExerciseSearchPicker({ libraryExercises, onSelect }: ExerciseSearchPickerProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Filtre par nom et limite stricte à max 5 résultats
  const filtered = query.trim() === ''
    ? libraryExercises.slice(0, 5)
    : libraryExercises
        .filter(ex => ex.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[280px]">
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          placeholder="📚 Rechercher un exo..."
          className="h-8 pl-8 pr-2 text-xs bg-muted/60 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary w-full truncate placeholder:text-muted-foreground/70"
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden text-xs max-h-[240px] overflow-y-auto custom-scrollbar">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item)
                setQuery('')
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-primary/10 hover:text-primary flex items-center justify-between gap-2 border-b border-border/40 last:border-none transition-colors"
            >
              <span className="font-semibold truncate">{item.name}</span>
              <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                {item.video_url && <Video className="h-3 w-3 text-blue-400" />}
                {item.notes && <FileText className="h-3 w-3 text-emerald-400" />}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() !== '' && filtered.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl p-3 text-xs text-muted-foreground text-center">
          Aucun exercice trouvé dans la bibliothèque
        </div>
      )}
    </div>
  )
}
