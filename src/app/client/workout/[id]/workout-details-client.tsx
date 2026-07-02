'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Calendar, Clock, Activity, FileText } from 'lucide-react'
import Link from 'next/link'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function WorkoutDetailsClient({ session, coachName }: { session: any, coachName: string | null }) {
  const dateObj = new Date(session.scheduled_date)
  const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const handleDownloadPDF = () => {
    const doc = new jsPDF()

    // En-tête
    doc.setFontSize(24)
    doc.setTextColor(24, 24, 27) // zinc-900
    doc.text(session.title, 14, 22)
    
    doc.setFontSize(12)
    doc.setTextColor(113, 113, 122) // zinc-500
    doc.text(`Coach: ${coachName || 'Votre Coach'} | Date: ${formattedDate}`, 14, 32)

    if (session.description) {
      doc.setFontSize(11)
      doc.setTextColor(82, 82, 91) // zinc-600
      const splitText = doc.splitTextToSize(session.description, 180)
      doc.text(splitText, 14, 42)
    }

    // Tableau des exercices
    const tableData = session.exercises.map((ex: any) => [
      ex.name,
      `${ex.sets}x${ex.reps}`,
      ex.rest || '-',
      ex.target || '-',
      ex.notes || '-'
    ])

    const startY = session.description ? 55 : 45

    autoTable(doc, {
      startY: startY,
      head: [['Exercice', 'Séries x Rép.', 'Repos', 'Objectif', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [24, 24, 27], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [244, 244, 245] }
    })

    doc.save(`Seance_${session.title.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/client">
        <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour à l'espace
        </Button>
      </Link>

      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border shadow-2xl shadow-foreground/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-sm font-semibold text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" /> {formattedDate}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">{session.title}</h1>
            {coachName && <p className="text-muted-foreground font-medium mt-2">Préparé par {coachName}</p>}
          </div>

          <Button 
            onClick={handleDownloadPDF}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-xl h-12 px-6"
          >
            <Download className="mr-2 h-5 w-5" /> Télécharger (PDF)
          </Button>
        </div>

        {session.description && (
          <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl mb-10">
            <h3 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-primary" /> Consignes du coach
            </h3>
            <p className="text-muted-foreground leading-relaxed">{session.description}</p>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-foreground mb-6">Détails des Exercices</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {session.exercises && session.exercises.length > 0 ? (
              session.exercises.map((ex: any, idx: number) => (
                <div key={idx} className="group bg-card border border-border hover:border-primary/50 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-2">
                      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm">{idx + 1}</span>
                      {ex.name}
                    </h3>
                    {ex.notes && <p className="text-muted-foreground italic text-sm ml-10">"{ex.notes}"</p>}
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-4 ml-10 md:ml-0">
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">Séries</span>
                      <span className="text-lg font-black">{ex.sets}x{ex.reps}</span>
                    </div>
                    {ex.rest && (
                      <div className="bg-muted text-muted-foreground px-4 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Repos</span>
                        <span className="text-lg font-bold flex items-center gap-1"><Clock className="h-4 w-4"/> {ex.rest}</span>
                      </div>
                    )}
                    {ex.target && (
                      <div className="bg-muted text-muted-foreground px-4 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Objectif</span>
                        <span className="text-lg font-bold flex items-center gap-1"><Activity className="h-4 w-4"/> {ex.target}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic">Aucun exercice détaillé pour cette séance.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
