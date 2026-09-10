import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts'
import { useVentasPorLocal, useLocales } from '@/hooks/useVentas'
import { useStockCritico } from '@/hooks/useInventario'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { StockCritico } from '@/lib/types'
import {
  DollarSign, AlertTriangle, Receipt, TrendingUp, Store,
} from 'lucide-react'

const COLORES_LOCAL = ['#0b2545', '#ff7a00', '#2f6690', '#d99a3d']

export default function DashboardPage() {
  const { data: ventasLocal, isLoading: cargandoVentas } = useVentasPorLocal()
  const { data: stockCritico, isLoading: cargandoStock } = useStockCritico()
  const { data: locales } = useLocales()

  const kpis = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10)
    const ventasHoy = (ventasLocal ?? []).filter((v) => v.dia.slice(0, 10) === hoy)
    const totalHoy = ventasHoy.reduce((acc, v) => acc + Number(v.total_vendido), 0)
    const numVentasHoy = ventasHoy.reduce((acc, v) => acc + v.num_ventas, 0)
    const ticketProm = numVentasHoy > 0 ? totalHoy / numVentasHoy : 0
    return { totalHoy, numVentasHoy, ticketProm, alertas: (stockCritico ?? []).length }
  }, [ventasLocal, stockCritico])

  const serieDiaria = useMemo(() => {
    if (!ventasLocal) return []
    const porDia: Record<string, any> = {}
    for (const v of ventasLocal) {
      const dia = v.dia.slice(5, 10)
      porDia[dia] = porDia[dia] || { dia }
      porDia[dia][v.local_nombre] = Number(v.total_vendido)
    }
    return Object.values(porDia).slice(-7)
  }, [ventasLocal])

  const rankingCritico = useMemo(() => {
    return (stockCritico as StockCritico[] | undefined)
      ?.slice()
      .sort((a, b) => a.stock_actual - b.stock_actual)
      .slice(0, 8)
      .map((s) => ({ nombre: `${s.producto_nombre} (${s.local_nombre.split(' - ')[1] ?? s.local_nombre})`, stock: s.stock_actual, minimo: s.stock_minimo }))
  }, [stockCritico])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Dashboard Gerencial</h1>
        <p className="text-sm text-muted-foreground">Vista consolidada de los 4 locales de San Gabriel — Los Olivos.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} color="bg-navy" label="Ventas de hoy" value={formatCurrency(kpis.totalHoy)} loading={cargandoVentas} />
        <KpiCard icon={Receipt} color="bg-orange" label="Ticket promedio" value={formatCurrency(kpis.ticketProm)} loading={cargandoVentas} />
        <KpiCard icon={TrendingUp} color="bg-navy-light" label="N° de ventas hoy" value={String(kpis.numVentasHoy)} loading={cargandoVentas} />
        <KpiCard icon={AlertTriangle} color="bg-destructive" label="Alertas de stock" value={String(kpis.alertas)} loading={cargandoStock} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Ventas por local — últimos 7 días</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={serieDiaria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
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

        <Card>
          <CardHeader><CardTitle>Ranking de productos con menor stock</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={rankingCritico} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="nombre" width={160} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="stock" fill="#ff7a00" radius={[0, 4, 4, 0]} name="Stock actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Store size={18} className="text-navy" />
          <CardTitle>Alertas de reposición activas</CardTitle>
        </CardHeader>
        <CardContent>
          {cargandoStock ? (
            <p className="text-muted-foreground">Cargando alertas...</p>
          ) : (stockCritico as StockCritico[] | undefined)?.length ? (
            <div className="grid md:grid-cols-2 gap-3">
              {(stockCritico as StockCritico[]).map((s) => (
                <div key={`${s.id_producto}-${s.id_local}`} className="flex items-center justify-between border border-border rounded-lg px-4 py-2.5">
                  <div>
                    <p className="font-medium text-navy text-sm">{s.producto_nombre}</p>
                    <p className="text-xs text-muted-foreground">{s.local_nombre}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${s.estado === 'CRITICO' ? 'text-destructive' : 'text-amber-600'}`}>
                      {s.stock_actual} / {s.stock_minimo}
                    </p>
                    <span className={s.estado === 'CRITICO' ? 'badge-critico' : 'badge-bajo'}>{s.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Sin alertas activas. Todos los locales están dentro de su stock mínimo.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function KpiCard({ icon: Icon, color, label, value, loading }: any) {
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white mb-2`}>
        <Icon size={20} />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-navy">{loading ? '—' : value}</p>
    </div>
  )
}
