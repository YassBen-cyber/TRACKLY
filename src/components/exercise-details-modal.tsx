'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info, Video, FileText, Dumbbell, Clock, ExternalLink, Play } from 'lucide-react'

type MediaEmbedInfo =
  | { type: 'video'; url: string }
  | { type: 'iframe'; url: string }

function getEmbedMediaInfo(url?: string): MediaEmbedInfo | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // 1. Direct Video files (.mp4, .webm, .mov, .ogg)
  if (/\.(mp4|webm|mov|ogg)($|\?)/i.test(trimmed)) {
    return { type: 'video', url: trimmed }
  }

  // 2. YouTube (watch, shorts, embed, youtu.be)
  const ytMatch = trimmed.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/)
  if (ytMatch && ytMatch[2].length === 11) {
    return { type: 'iframe', url: `https://www.youtube-nocookie.com/embed/${ytMatch[2]}?autoplay=0&rel=0` }
  }

  // 3. Vimeo
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/)
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: 'iframe', url: `https://player.vimeo.com/video/${vimeoMatch[1]}` }
  }

  // 4. Google Drive video preview
  const gdriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^\/]+)/)
  if (gdriveMatch && gdriveMatch[1]) {
    return { type: 'iframe', url: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview` }
  }

  // 5. DailyMotion
  const dmMatch = trimmed.match(/dailymotion\.com\/video\/([^_]+)/)
  if (dmMatch && dmMatch[1]) {
    return { type: 'iframe', url: `https://www.dailymotion.com/embed/video/${dmMatch[1]}` }
  }

  // 6. Generic web URL -> iframe embed fallback
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { type: 'iframe', url: trimmed }
  }

  return null
}

export function ExerciseDetailsModal({ exercise }: { exercise: any }) {
  const [open, setOpen] = useState(false)
  const mediaInfo = getEmbedMediaInfo(exercise.video_url)
  const hasDetails = Boolean(exercise.video_url || exercise.notes)

  if (!hasDetails) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 font-medium text-xs flex items-center gap-1.5 shadow-sm">
          <Info className="h-3.5 w-3.5" />
          Détails & Consignes
        </Button>
      } />
      <DialogContent className="sm:max-w-[620px] bg-card border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-2xl">
        <div className="p-6 pb-4 border-b border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              {exercise.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground flex flex-wrap gap-2 pt-2">
              <span className="bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-lg text-xs">
                {exercise.sets} séries x {exercise.reps} reps
              </span>
              {exercise.rest && (
                <span className="bg-muted text-muted-foreground font-semibold px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Repos: {exercise.rest}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Vidéo de Démonstration Embarquée */}
          {exercise.video_url && mediaInfo && (
            <div className="space-y-3 min-w-0">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Video className="h-4 w-4 text-blue-400" />
                Vidéo de démonstration (Intégrée)
              </h4>

              {mediaInfo.type === 'video' ? (
                <div className="relative rounded-2xl overflow-hidden border border-border bg-black shadow-lg">
                  <video
                    controls
                    playsInline
                    className="w-full max-h-[320px] rounded-2xl object-contain bg-black"
                  >
                    <source src={mediaInfo.url} />
                    Votre navigateur ne prend pas en charge la lecture de cette vidéo.
                  </video>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-lg">
                    <iframe
                      src={mediaInfo.url}
                      title={`Vidéo ${exercise.name}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                  <a
                    href={exercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors pt-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ouvrir dans un nouvel onglet
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Consignes du coach */}
          {exercise.notes && (
            <div className="space-y-2 min-w-0">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                Consignes du coach & exécution
              </h4>
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden max-w-full">
                {exercise.notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
