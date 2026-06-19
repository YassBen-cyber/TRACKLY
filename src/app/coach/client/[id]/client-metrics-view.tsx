'use client'

import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

import jsPDF from 'jspdf'

type MetricValue = {
  id: string
  date: string
  value: number
  metric_types: {
    name: string
    unit: string
  }
}

export function ClientMetricsView({ values, clientName }: { values: MetricValue[], clientName: string }) {
  const [isExporting, setIsExporting] = useState(false)

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
        date: new Date(v.date).toLocaleDateString('fr-FR'),
        value: Number(v.value),
        fullDate: new Date(v.date)
      })
    })

    // Sort by date ascending inside each group
    Object.keys(groups).forEach(name => {
      groups[name].data.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
    })

    return groups
  }, [values])

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
        // Dynamically import autoTable to avoid SSR issues or global pollution if needed,
        // but normally we can just import it. Since we didn't import it at the top,
        // we require it here.
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
        <Button 
          onClick={exportPDF} 
          disabled={isExporting || metricNames.length === 0}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 rounded-xl"
        >
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Exporter en PDF
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metricNames.map(name => (
              <div key={name} className="glass-panel p-6 rounded-3xl border border-zinc-200 bg-white backdrop-blur-sm">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-zinc-900">{name}</h3>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {groupedMetrics[name].unit}
                  </span>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={groupedMetrics[name].data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#ffffff50" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="#ffffff50" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dx={-10}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        isAnimationActive={false}
                        dot={{ fill: '#09090b', stroke: '#3b82f6', strokeWidth: 2, r: 5 }} 
                        activeDot={{ r: 7, fill: '#60a5fa', stroke: '#1d4ed8', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
