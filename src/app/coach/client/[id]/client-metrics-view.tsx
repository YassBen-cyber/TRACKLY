'use client'

import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, Loader2, Plus, Pencil, Trash2, Activity } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { addMetricValue, updateCoachMetricValue, deleteCoachMetricValue } from './actions'

import jsPDF from 'jspdf'

type MetricValue = {
  id: string
  date: string
  value: number
  metric_type_id: string
  metric_types: {
    name: string
    unit: string
  }
}

export function ClientMetricsView({ values, clientName, clientId, metricTypes }: { values: MetricValue[], clientName: string, clientId: string, metricTypes: any[] }) {
  const [isExporting, setIsExporting] = useState(false)
  
  // Add Metric Modal State
  const [isAdding, setIsAdding] = useState(false)
  const [addTypeId, setAddTypeId] = useState(metricTypes[0]?.id || '')
  const [addVal, setAddVal] = useState('')
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit Metric Modal State
  const [editingValue, setEditingValue] = useState<any>(null)
  const [editVal, setEditVal] = useState('')
  const [editDate, setEditDate] = useState('')

  // Group values by metric type name
  const groupedMetrics = useMemo(() => {
    const groups: Record<string, { unit: string, data: any[] }> = {}
    
    values.forEach(v => {
      if (!v.metric_types) return
      const name = v.metric_types.name
      if (!groups[name]) {
        groups[name] = { unit: v.metric_types.unit, data: [] }
      }
      
      groups[name].data.push({
        id: v.id,
        date: new Date(v.date).toLocaleDateString('fr-FR'),
        value: Number(v.value),
        fullDate: new Date(v.date),
        rawDate: v.date
      })
    })

    // Sort by date ascending inside each group
    Object.keys(groups).forEach(name => {
      groups[name].data.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
    })

    return groups
  }, [values])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addTypeId || !addVal || !addDate) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('clientId', clientId)
      formData.append('metricTypeId', addTypeId)
      formData.append('value', addVal)
      formData.append('date', addDate)
      await addMetricValue(formData)
      
      setAddVal('')
      setAddDate(new Date().toISOString().split('T')[0])
      setIsAdding(false)
    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'ajout")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingValue || !editVal || !editDate) return

    setIsSubmitting(true)
    try {
      await updateCoachMetricValue(editingValue.id, clientId, parseFloat(editVal), editDate)
      setEditingValue(null)
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la modification")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function exportPDF() {
    setIsExporting(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      let yOffset = 20

      // Title
      pdf.setFontSize(22)
      pdf.setTextColor(40, 40, 40)
      const title = `Rapport de performances : ${clientName}`
      pdf.text(title, pageWidth / 2, yOffset, { align: 'center' })
      yOffset += 10

      // Date
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      const dateText = `Généré le ${new Date().toLocaleDateString('fr-FR')}`
      pdf.text(dateText, pageWidth / 2, yOffset, { align: 'center' })
      yOffset += 20

      const metricNames = Object.keys(groupedMetrics)

      if (metricNames.length === 0) {
        pdf.setFontSize(14)
        pdf.text("Aucune donnée enregistrée.", pageWidth / 2, yOffset, { align: 'center' })
      } else {
        const autoTable = (await import('jspdf-autotable')).default

        metricNames.forEach((name, index) => {
          const metricData = groupedMetrics[name]
          
          if (yOffset > 250) {
            pdf.addPage()
            yOffset = 20
          }

          // Metric Title
          pdf.setFontSize(16)
          pdf.setTextColor(0, 0, 0)
          pdf.text(`Métrique : ${name} (${metricData.unit})`, 14, yOffset)
          yOffset += 5

          // Calculate some stats
          const values = metricData.data.map(d => d.value)
          const min = Math.min(...values)
          const max = Math.max(...values)
          const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
          const latest = values[values.length - 1]
          const first = values[0]
          const diff = latest - first
          const diffText = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)

          // Stats summary
          pdf.setFontSize(11)
          pdf.setTextColor(80, 80, 80)
          yOffset += 5
          pdf.text(`Progression globale : ${diffText} ${metricData.unit}`, 14, yOffset)
          yOffset += 6
          pdf.text(`Moyenne : ${avg} ${metricData.unit} | Min : ${min} ${metricData.unit} | Max : ${max} ${metricData.unit}`, 14, yOffset)
          yOffset += 8

          // Table
          const tableData = metricData.data.map(d => [d.date, `${d.value} ${metricData.unit}`])
          
          autoTable(pdf, {
            startY: yOffset,
            head: [['Date', 'Valeur']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }, // blue-500
            margin: { left: 14, right: 14 },
          })
          
          // Re-adjust yOffset based on autoTable final Y
          yOffset = (pdf as any).lastAutoTable.finalY + 15
        })
      }

      pdf.save(`rapport-detaille-${clientName.replace(/\s+/g, '-')}.pdf`)
    } catch (error: any) {
      console.error("Erreur lors de l'export PDF", error)
      alert("Erreur lors de la génération du PDF : " + (error.message || error))
    } finally {
      setIsExporting(false)
    }
  }

  const metricNames = Object.keys(groupedMetrics)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-zinc-900">Évolution des métriques</h2>
        <div className="flex gap-2">
          {metricTypes.length > 0 && (
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger render={
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une mesure
                </Button>
              } />
              <DialogContent className="sm:max-w-md bg-white border-zinc-300 text-zinc-900 rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Nouvelle mesure</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubmit} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label>Métrique</Label>
                    <select 
                      className="w-full h-11 px-3 rounded-xl border border-zinc-300 bg-white"
                      value={addTypeId}
                      onChange={(e) => setAddTypeId(e.target.value)}
                      required
                    >
                      <option value="" disabled>Choisir une métrique...</option>
                      {metricTypes.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input 
                      type="date" 
                      required 
                      value={addDate}
                      onChange={(e) => setAddDate(e.target.value)}
                      className="h-11 rounded-xl bg-white border-zinc-300" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valeur</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      required 
                      value={addVal}
                      onChange={(e) => setAddVal(e.target.value)}
                      className="h-11 rounded-xl bg-white border-zinc-300" 
                      placeholder="Ex: 75.5"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg font-bold">
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enregistrer"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Button 
            onClick={exportPDF} 
            disabled={isExporting || metricNames.length === 0}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 rounded-xl"
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Exporter
          </Button>
        </div>
      </div>

      <div id="metrics-pdf-content" className="p-4 sm:p-6 bg-zinc-50 rounded-3xl border border-zinc-200 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Performances de {clientName}</h1>
          <p className="text-zinc-600 mt-1">Généré le {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        {metricNames.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl text-center border border-zinc-200">
            <p className="text-zinc-600">Aucune métrique enregistrée pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {metricNames.map(name => (
              <div key={name} className="glass-panel p-6 rounded-3xl border border-zinc-200 bg-white backdrop-blur-sm">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-zinc-900">{name}</h3>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {groupedMetrics[name].unit}
                  </span>
                </div>
                
                <div className="h-64 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={groupedMetrics[name].data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#a3a3a3" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="#a3a3a3" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dx={-10}
                        domain={[
                          (dataMin: number | string) => parseFloat((Number(dataMin) * 0.95).toFixed(2)),
                          (dataMax: number | string) => parseFloat((Number(dataMax) * 1.05).toFixed(2)),
                        ]}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5', borderRadius: '12px', color: '#0a0a0a', boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12)' }}
                        labelStyle={{ color: '#737373', fontSize: '12px', marginBottom: '4px' }}
                        itemStyle={{ color: '#2563eb', fontWeight: '600' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2563eb" 
                        strokeWidth={2.5} 
                        isAnimationActive={false}
                        dot={{ fill: '#ffffff', stroke: '#2563eb', strokeWidth: 2, r: 4 }} 
                        activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {groupedMetrics[name].data.map((v: any) => (
                    <div key={v.id} className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 flex flex-col items-center text-center relative group">
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {
                            setEditingValue(v)
                            setEditVal(v.value.toString())
                            setEditDate(v.rawDate.split('T')[0])
                          }} 
                          className="p-1.5 text-blue-500 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors" title="Modifier"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={async () => {
                            if (confirm("Voulez-vous vraiment supprimer cette mesure ?")) {
                              await deleteCoachMetricValue(v.id, clientId)
                            }
                          }} 
                          className="p-1.5 text-red-500 bg-red-100 hover:bg-red-200 rounded-lg transition-colors" title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-xs font-medium text-zinc-500 mb-1">{v.date}</span>
                      <span className="text-lg font-black text-zinc-900">{v.value}</span>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      <Dialog open={!!editingValue} onOpenChange={(open) => !open && setEditingValue(null)}>
        <DialogContent className="sm:max-w-md bg-white border-zinc-300 text-zinc-900 rounded-3xl">
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
                className="h-11 rounded-xl bg-white border-zinc-300" 
              />
            </div>
            <div className="space-y-2">
              <Label>Valeur</Label>
              <Input 
                type="number" 
                step="0.1" 
                required 
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                className="h-11 rounded-xl bg-white border-zinc-300" 
              />
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
