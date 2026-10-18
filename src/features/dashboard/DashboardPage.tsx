import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useVentasPorLocal, useLocales, useListaVentas } from '@/hooks/useVentas'
import { useStockCritico, useListaCompras } from '@/hooks/useInventario'
import { useProductos } from '@/hooks/useCatalogo'
import { useAuth } from '@/features/auth/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BadgeEstado } from '@/components/ui/badge-estado'
import { EmptyState, PageHeader, Skeleton, StatCard } from '@/components/ui/page'
import { ChartLegend, ChartTooltip } from '@/components/ChartTooltip'
import { useChartTheme } from '@/lib/chart'
import { accesosParaRol } from '@/lib/accesos'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StockCritico } from '@/lib/types'
import {
  Wallet, AlertTriangle, Receipt, Boxes, ArrowRight, Package, CalendarDays,
  ArrowDownLeft, ArrowUpRight, BarChart3, CheckCircle2,
} from 'lucide-react'

export default function DashboardPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const chart = useChartTheme()
  const { data: ventasLocal, isLoading: cargandoVentas } = useVentasPorLocal()
  const { data: stockCritico, isLoading: cargandoStock } = useStockCritico()
  const { data: locales } = useLocales()
  const { data: productos } = useProductos()
  const { data: ventas } = useListaVentas()
  const { data: compras } = useListaCompras()

  const saludo = useMemo(() => {
    const hora = new Date().getHours()
    if (hora < 12) return 'Buenos días'
    if (hora < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }, [])

  const fechaHoy = useMemo(() => {
    const f = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
    return f.charAt(0).toUpperCase() + f.slice(1)
  }, [])

  const kpis = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10)
    const ventasHoy = (ventasLocal ?? []).filter((v) => v.dia.slice(0, 10) === hoy)
    const totalHoy = ventasHoy.reduce((acc, v) => acc + Number(v.total_vendido), 0)
    const numVentasHoy = ventasHoy.reduce((acc, v) => acc + v.num_ventas, 0)
    const ticketProm = numVentasHoy > 0 ? totalHoy / numVentasHoy : 0
    const criticos = (stockCritico ?? []).filter((s: any) => s.estado === 'CRITICO').length
    return { totalHoy, numVentasHoy, ticketProm, alertas: (stockCritico ?? []).length, criticos, totalProductos: productos?.length ?? 0 }
  }, [ventasLocal, stockCritico, productos])

  const serieDiaria = useMemo(() => {
    if (!ventasLocal) return []
    const porDia: Record<string, any> = {}
    for (const v of ventasLocal) {
      const fecha = v.dia.slice(0, 10)
      porDia[fecha] = porDia[fecha] || {
        fecha,
        dia: new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(new Date(fecha + 'T12:00:00')),
      }
      porDia[fecha][v.local_nombre] = Number(v.total_vendido)
    }
    return Object.values(porDia).sort((a: any, b: any) => a.fecha.localeCompare(b.fecha)).slice(-7)
  }, [ventasLocal])

  // Color estable por local (posición en la lista de locales, no por ranking)
  const seriesLocales = useMemo(
    () => (locales ?? []).map((l: any, idx: number) => ({ key: l.id_local, name: l.nombre as string, color: chart.series[idx % chart.series.length] })),
    [locales, chart.series]
  )

  const porCategoria = useMemo(() => {
    if (!productos) return []
    const conteo: Record<string, number> = {}
    for (const p of productos) {
      const nombre = p.categoria?.nombre ?? 'Sin categoría'
      conteo[nombre] = (conteo[nombre] ?? 0) + 1
    }
    const ordenado = Object.entries(conteo).map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad)
    if (ordenado.length <= 6) return ordenado
    const otros = ordenado.slice(5).reduce((acc, c) => acc + c.cantidad, 0)
    return [...ordenado.slice(0, 5), { nombre: 'Otras', cantidad: otros }]
  }, [productos])
  const maxCategoria = Math.max(1, ...porCategoria.map((c) => c.cantidad))

  const stockBajoOrdenado = useMemo(
    () => ((stockCritico ?? []) as StockCritico[]).slice().sort((a, b) => a.stock_actual - b.stock_actual).slice(0, 5),
    [stockCritico]
  )

  const actividadReciente = useMemo(() => {
    const deVentas = (ventas ?? []).map((v: any) => ({
      tipo: 'venta' as const,
      fecha: v.fecha,
      quien: v.usuario?.nombre ?? 'Alguien',
      accion: 'registró una venta',
      detalle: v.local?.nombre,
      monto: Number(v.total),
    }))
    const deCompras = (compras ?? []).map((c: any) => ({
      tipo: 'compra' as const,
      fecha: c.fecha,
      quien: c.usuario?.nombre ?? 'Alguien',
      accion: 'registró una entrada',
      detalle: `${c.proveedor?.razon_social ?? ''} · ${c.local?.nombre ?? ''}`,
      monto: Number(c.total),
    }))
    return [...deVentas, ...deCompras]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 6)
  }, [ventas, compras])

  return (
    <div className="page">
      <PageHeader
        title={`${saludo}, ${usuario?.nombre?.split(' ')[0] ?? ''}`}
        description="Resumen de operación de los 4 locales en Los Olivos."
        actions={
          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-muted-foreground shadow-xs">
            <CalendarDays size={15} /> {fechaHoy}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard
          icon={Wallet} tone="primary" label="Ventas de hoy"
          value={cargandoVentas ? <Skeleton className="h-8 w-28" /> : <span className="num">{formatCurrency(kpis.totalHoy)}</span>}
          hint={`${kpis.numVentasHoy} transacciones`}
        />
        <StatCard
          icon={Receipt} tone="info" label="Ticket promedio"
          value={cargandoVentas ? <Skeleton className="h-8 w-24" /> : <span className="num">{formatCurrency(kpis.ticketProm)}</span>}
          hint="Por transacción, hoy"
        />
        <StatCard icon={Boxes} label="Productos en catálogo" value={<span className="num">{kpis.totalProductos}</span>} hint="Activos e inactivos" />
        <StatCard
          icon={AlertTriangle} tone={kpis.alertas > 0 ? 'danger' : 'neutral'} label="Alertas de stock"
          value={cargandoStock ? <Skeleton className="h-8 w-12" /> : <span className="num">{kpis.alertas}</span>}
          hint={kpis.criticos > 0 ? `${kpis.criticos} en estado crítico` : 'Sin productos críticos'}
        />
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Ventas por local</CardTitle>
              <CardDescription>Últimos 7 días con movimiento, en soles</CardDescription>
            </div>
            <ChartLegend items={seriesLocales} />
          </CardHeader>
          <CardContent className="pl-1 pr-4">
            {cargandoVentas ? (
              <Skeleton className="ml-4 h-[280px]" />
            ) : serieDiaria.length === 0 ? (
              <EmptyState icon={BarChart3} title="Aún no hay ventas" description="Las ventas registradas en el POS aparecerán aquí." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={serieDiaria} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={chart.grid} />
                  <XAxis dataKey="dia" tick={{ fontSize: 12, fill: chart.tick }} tickLine={false} axisLine={{ stroke: chart.axis }} dy={6} />
                  <YAxis
                    tick={{ fontSize: 12, fill: chart.tick }} tickLine={false} axisLine={false} width={64}
                    tickFormatter={(v) => `S/ ${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: chart.axis, strokeWidth: 1 }} />
                  {seriesLocales.map((s) => (
                    <Line
                      key={s.key} type="monotone" dataKey={s.name} name={s.name} stroke={s.color} strokeWidth={2} isAnimationActive={chart.animate}
                      dot={false} activeDot={{ r: 4.5, strokeWidth: 2, stroke: chart.surface }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catálogo por categoría</CardTitle>
            <CardDescription>{kpis.totalProductos} productos en total</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {porCategoria.length === 0 && <EmptyState title="Sin productos" />}
            {porCategoria.map((c) => (
              <div key={c.nombre}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="truncate font-medium">{c.nombre}</span>
                  <span className="num text-muted-foreground">{c.cantidad}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary/80" style={{ width: `${(c.cantidad / maxCategoria) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Productos por reponer</CardTitle>
              <CardDescription>Stock por debajo del mínimo</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inventario/stock')} className="text-primary">
              Ver todos <ArrowRight size={14} />
            </Button>
          </CardHeader>
          <div className="border-t border-border">
            {cargandoStock ? (
              <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : stockBajoOrdenado.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Todo en orden" description="Todos los locales están dentro de su stock mínimo." />
            ) : (
              <ul className="divide-y divide-border">
                {stockBajoOrdenado.map((s) => {
                  const pct = Math.min(100, (s.stock_actual / Math.max(1, s.stock_minimo)) * 100)
                  return (
                    <li key={`${s.id_producto}-${s.id_local}`} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Package size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{s.producto_nombre}</p>
                        <p className="text-xs text-muted-foreground">{s.local_nombre}</p>
                      </div>
                      <div className="hidden w-32 sm:block">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="num font-semibold">{s.stock_actual}</span>
                          <span className="num text-muted-foreground">mín. {s.stock_minimo}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className={s.estado === 'CRITICO' ? 'h-full rounded-full bg-destructive' : 'h-full rounded-full bg-warning'} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <BadgeEstado estado={s.estado} />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Actividad reciente</CardTitle>
              <CardDescription>Ventas y entradas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/movimientos/salidas')} className="text-primary">
              Ver todo <ArrowRight size={14} />
            </Button>
          </CardHeader>
          <div className="max-h-[320px] overflow-y-auto border-t border-border">
            {actividadReciente.length === 0 && <EmptyState title="Sin actividad reciente" />}
            <ul className="divide-y divide-border">
              {actividadReciente.map((a, idx) => (
                <li key={idx} className="flex items-start gap-3 px-5 py-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${a.tipo === 'venta' ? 'bg-info-soft text-info' : 'bg-success-soft text-success'}`}>
                    {a.tipo === 'venta' ? <ArrowUpRight size={15} /> : <ArrowDownLeft size={15} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug"><span className="font-semibold">{a.quien}</span> {a.accion}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.detalle}</p>
                    <p className="mt-0.5 text-2xs text-muted-foreground/80">{formatDate(a.fecha)}</p>
                  </div>
                  <span className="num shrink-0 text-[13px] font-semibold">{formatCurrency(a.monto)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div>
        <p className="eyebrow mb-3">Acceso rápido</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {accesosParaRol(usuario?.rol ?? '').map((a) => (
            <AccesoRapido key={a.to} icon={a.icon} label={a.label} desc={a.desc} onClick={() => navigate(a.to)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AccesoRapido({ icon: Icon, label, desc, onClick }: { icon: React.ElementType; label: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-pop"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{label}</span>
        <span className="hidden truncate text-xs text-muted-foreground sm:block">{desc}</span>
      </span>
    </button>
  )
}
