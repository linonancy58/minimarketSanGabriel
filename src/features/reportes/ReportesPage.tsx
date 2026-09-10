import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useMemo } from 'react'
import { useVentasPorLocal, useLocales } from '@/hooks/useVentas'
import { useStockCritico } from '@/hooks/useInventario'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COLORES_LOCAL = ['#082B4C', '#FF7900', '#22B573', '#F59E0B']

export default function ReportesPage() {
  const { data: ventasLocal } = useVentasPorLocal()
  const { data: stockCritico } = useStockCritico()
  const { data: locales } = useLocales()

  const serieDiaria = useMemo(() => {
    if (!ventasLocal) return []
    const porDia: Record<string, any> = {}
    for (const v of ventasLocal) {
      const dia = v.dia.slice(0, 10)
      porDia[dia] = porDia[dia] || { dia }
      porDia[dia][v.local_nombre] = Number(v.total_vendido)
    }
    return Object.values(porDia)
  }, [ventasLocal])

  const totalGeneral = (ventasLocal ?? []).reduce((acc, v) => acc + Number(v.total_vendido), 0)

  function exportarCSV() {
    if (!ventasLocal) return
    const filas = [
      ['Local', 'Día', 'N° Ventas', 'Total Vendido', 'Ticket Promedio'],
      ...ventasLocal.map((v) => [v.local_nombre, v.dia.slice(0, 10), v.num_ventas, v.total_vendido, v.ticket_promedio]),
    ]
    const csv = filas.map((f) => f.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reporte_ventas_san_gabriel.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <BarChart3 className="text-orange" size={24} /> Reportes
          </h1>
          <p className="text-sm text-text-secondary">Histórico completo de ventas de los 4 locales.</p>
        </div>
        <Button variant="outline" onClick={exportarCSV}><Download size={16} /> Exportar CSV</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-text-secondary">Ventas totales (histórico)</p>
          <p className="text-2xl font-bold text-navy">{formatCurrency(totalGeneral)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-text-secondary">Alertas de stock activas</p>
          <p className="text-2xl font-bold text-navy">{stockCritico?.length ?? 0}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Evolución de ventas por local</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={serieDiaria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {locales?.map((l: any, idx: number) => (
                <Line key={l.id_local} type="monotone" dataKey={l.nombre} stroke={COLORES_LOCAL[idx % COLORES_LOCAL.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}