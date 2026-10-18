import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'
import { useVentasPorLocal, useLocales } from '@/hooks/useVentas'
import { useStockCritico } from '@/hooks/useInventario'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD, TEmpty } from '@/components/ui/table'
import { PageHeader, StatCard, EmptyState } from '@/components/ui/page'
import { ChartLegend, ChartTooltip } from '@/components/ChartTooltip'
import { Button } from '@/components/ui/button'
import { useChartTheme } from '@/lib/chart'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, Download, Wallet, Receipt, AlertTriangle, ShoppingCart } from 'lucide-react'

export default function ReportesPage() {
  const chart = useChartTheme()
  const { data: ventasLocal } = useVentasPorLocal()
  const { data: stockCritico } = useStockCritico()
  const { data: locales } = useLocales()

  const series = useMemo(
    () => (locales ?? []).map((l: any, idx: number) => ({ key: l.id_local, name: l.nombre as string, color: chart.series[idx % chart.series.length] })),
    [locales, chart.series]
  )

  const serieDiaria = useMemo(() => {
    if (!ventasLocal) return []
    const porDia: Record<string, any> = {}
    for (const v of ventasLocal) {
      const dia = v.dia.slice(0, 10)
      porDia[dia] = porDia[dia] || { dia }
      porDia[dia][v.local_nombre] = Number(v.total_vendido)
    }
    return Object.values(porDia).sort((a: any, b: any) => a.dia.localeCompare(b.dia))
  }, [ventasLocal])

  // Resumen por local (vista de tabla del gráfico)
  const porLocal = useMemo(() => {
    const acc: Record<string, { local: string; ventas: number; total: number }> = {}
    for (const v of ventasLocal ?? []) {
      acc[v.local_nombre] = acc[v.local_nombre] || { local: v.local_nombre, ventas: 0, total: 0 }
      acc[v.local_nombre].ventas += v.num_ventas
      acc[v.local_nombre].total += Number(v.total_vendido)
    }
    return Object.values(acc).sort((a, b) => b.total - a.total)
  }, [ventasLocal])

  const totalGeneral = porLocal.reduce((acc, l) => acc + l.total, 0)
  const numVentas = porLocal.reduce((acc, l) => acc + l.ventas, 0)

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
    <div className="page">
      <PageHeader
        title="Reportes"
        description="Histórico completo de ventas de los 4 locales."
        actions={<Button variant="outline" onClick={exportarCSV}><Download size={16} /> Exportar CSV</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard icon={Wallet} tone="primary" label="Ventas totales" value={<span className="num">{formatCurrency(totalGeneral)}</span>} hint="Histórico acumulado" />
        <StatCard icon={ShoppingCart} tone="info" label="Transacciones" value={<span className="num">{numVentas.toLocaleString('es-PE')}</span>} />
        <StatCard icon={Receipt} label="Ticket promedio" value={<span className="num">{formatCurrency(numVentas ? totalGeneral / numVentas : 0)}</span>} />
        <StatCard icon={AlertTriangle} tone={(stockCritico?.length ?? 0) > 0 ? 'danger' : 'neutral'} label="Alertas de stock" value={<span className="num">{stockCritico?.length ?? 0}</span>} />
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Evolución de ventas por local</CardTitle>
            <CardDescription>Total vendido por día, en soles</CardDescription>
          </div>
          <ChartLegend items={series} />
        </CardHeader>
        <CardContent className="pl-1 pr-4">
          {serieDiaria.length === 0 ? (
            <EmptyState icon={BarChart3} title="Sin datos de ventas" />
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={serieDiaria} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={chart.grid} />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: chart.tick }} tickLine={false} axisLine={{ stroke: chart.axis }} dy={6} minTickGap={24} />
                <YAxis
                  tick={{ fontSize: 12, fill: chart.tick }} tickLine={false} axisLine={false} width={64}
                  tickFormatter={(v) => `S/ ${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: chart.axis, strokeWidth: 1 }} />
                {series.map((s) => (
                  <Line key={s.key} type="monotone" dataKey={s.name} name={s.name} stroke={s.color} strokeWidth={2} isAnimationActive={chart.animate} dot={false}
                    activeDot={{ r: 4.5, strokeWidth: 2, stroke: chart.surface }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div>
        <p className="eyebrow mb-3">Resumen por local</p>
        <Table>
          <THead>
            <TR><TH>Local</TH><TH className="text-right">Transacciones</TH><TH className="text-right">Ticket promedio</TH><TH className="text-right">Total vendido</TH><TH className="text-right">Participación</TH></TR>
          </THead>
          <TBody>
            {porLocal.length === 0 ? (
              <TEmpty colSpan={5}>Sin datos.</TEmpty>
            ) : (
              porLocal.map((l) => (
                <TR key={l.local}>
                  <TD className="font-medium text-foreground">{l.local}</TD>
                  <TD className="num text-right">{l.ventas.toLocaleString('es-PE')}</TD>
                  <TD className="num text-right">{formatCurrency(l.ventas ? l.total / l.ventas : 0)}</TD>
                  <TD className="num text-right font-semibold">{formatCurrency(l.total)}</TD>
                  <TD className="num text-right text-muted-foreground">{totalGeneral ? ((l.total / totalGeneral) * 100).toFixed(1) : '0.0'}%</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </div>
  )
}
