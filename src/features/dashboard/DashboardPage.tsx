import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useVentasPorLocal, useLocales, useListaVentas } from '@/hooks/useVentas'
import { useStockCritico, useListaCompras } from '@/hooks/useInventario'
import { useProductos } from '@/hooks/useCatalogo'
import { useAuth } from '@/features/auth/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BadgeEstado } from '@/components/ui/badge-estado'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StockCritico } from '@/lib/types'
import {
  DollarSign, AlertTriangle, Receipt, Boxes, Clock, ArrowRight, Package,
  ShoppingBag, ArrowDownCircle, ArrowUpCircle, PackagePlus, BarChart3, ClipboardList, Zap,
} from 'lucide-react'

const COLORES_LOCAL = ['#082B4C', '#FF7900', '#22B573', '#F59E0B']
const COLORES_DONA = ['#082B4C', '#FF7900', '#22B573', '#F59E0B', '#718096', '#0EA5E9']

export default function DashboardPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
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

  const fechaHoy = useMemo(
    () => new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
    []
  )

  const kpis = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10)
    const ventasHoy = (ventasLocal ?? []).filter((v) => v.dia.slice(0, 10) === hoy)
    const totalHoy = ventasHoy.reduce((acc, v) => acc + Number(v.total_vendido), 0)
    const numVentasHoy = ventasHoy.reduce((acc, v) => acc + v.num_ventas, 0)
    const ticketProm = numVentasHoy > 0 ? totalHoy / numVentasHoy : 0
    return { totalHoy, numVentasHoy, ticketProm, alertas: (stockCritico ?? []).length, totalProductos: productos?.length ?? 0 }
  }, [ventasLocal, stockCritico, productos])

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

  const porCategoria = useMemo(() => {
    if (!productos) return []
    const conteo: Record<string, number> = {}
    for (const p of productos) {
      const nombre = p.categoria?.nombre ?? 'Sin categoría'
      conteo[nombre] = (conteo[nombre] ?? 0) + 1
    }
    return Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
  }, [productos])

  const stockBajoOrdenado = useMemo(() => {
    return ((stockCritico ?? []) as StockCritico[])
      .slice()
      .sort((a, b) => a.stock_actual - b.stock_actual)
      .slice(0, 5)
  }, [stockCritico])

  const actividadReciente = useMemo(() => {
    const deVentas = (ventas ?? []).map((v: any) => ({
      tipo: 'venta' as const,
      fecha: v.fecha,
      texto: `${v.usuario?.nombre ?? 'Alguien'} registró una venta`,
      detalle: `${formatCurrency(Number(v.total))} · ${v.local?.nombre}`,
    }))
    const deCompras = (compras ?? []).map((c: any) => ({
      tipo: 'compra' as const,
      fecha: c.fecha,
      texto: `${c.usuario?.nombre ?? 'Alguien'} registró una entrada`,
      detalle: `${c.proveedor?.razon_social} · ${c.local?.nombre}`,
    }))
    return [...deVentas, ...deCompras]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 6)
  }, [ventas, compras])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">{saludo}, {usuario?.nombre?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-text-secondary">Aquí tienes el resumen de tus 4 locales en Los Olivos.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary bg-card border border-border rounded-xl px-4 py-2 capitalize">
          <Clock size={16} /> Hoy, {fechaHoy}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} bg="#082B4C" label="Ventas de hoy" value={cargandoVentas ? '—' : formatCurrency(kpis.totalHoy)} />
        <KpiCard icon={Receipt} bg="#FF7900" label="Ticket promedio" value={cargandoVentas ? '—' : formatCurrency(kpis.ticketProm)} />
        <KpiCard icon={Boxes} bg="#22B573" label="Productos activos" value={String(kpis.totalProductos)} />
        <KpiCard icon={AlertTriangle} bg="#EF4444" label="Alertas de stock" value={cargandoStock ? '—' : String(kpis.alertas)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
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
          <CardHeader><CardTitle>Inventario por categoría</CardTitle></CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={porCategoria} dataKey="cantidad" nameKey="nombre" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {porCategoria.map((_, idx) => <Cell key={idx} fill={COLORES_DONA[idx % COLORES_DONA.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: -20 }}>
                <p className="text-2xl font-bold text-navy">{kpis.totalProductos}</p>
                <p className="text-xs text-text-secondary">productos</p>
              </div>
            </div>
            <div className="space-y-1.5 mt-2">
              {porCategoria.slice(0, 5).map((c, idx) => (
                <div key={c.nombre} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-navy">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORES_DONA[idx % COLORES_DONA.length] }} />
                    {c.nombre}
                  </span>
                  <span className="text-text-secondary">{c.cantidad}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><AlertTriangle size={18} className="text-warning" /> Productos con stock bajo</CardTitle>
            <button onClick={() => navigate('/inventario/stock')} className="text-sm text-orange font-medium flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight size={14} />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {cargandoStock ? (
              <p className="text-text-secondary text-sm p-5">Cargando...</p>
            ) : stockBajoOrdenado.length === 0 ? (
              <p className="text-text-secondary text-sm p-5">Sin alertas activas. Todos los locales están dentro de su stock mínimo.</p>
            ) : (
              <div className="divide-y divide-border">
                {stockBajoOrdenado.map((s) => (
                  <div key={`${s.id_producto}-${s.id_local}`} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-navy shrink-0">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy">{s.producto_nombre}</p>
                        <p className="text-xs text-text-secondary">{s.local_nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-navy">{s.stock_actual} / {s.stock_minimo}</p>
                      </div>
                      <BadgeEstado estado={s.estado} />
                      <Button size="sm" variant="accent" onClick={() => navigate('/compras')}>Ver</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Clock size={18} className="text-navy" /> Actividad reciente</CardTitle>
            <button onClick={() => navigate('/movimientos/salidas')} className="text-sm text-orange font-medium flex items-center gap-1 hover:underline">
              Ver todas <ArrowRight size={14} />
            </button>
          </CardHeader>
          <CardContent className="p-0 max-h-[280px] overflow-y-auto divide-y divide-border">
            {actividadReciente.length === 0 && <p className="text-text-secondary text-sm p-5">Sin actividad reciente.</p>}
            {actividadReciente.map((a, idx) => (
              <div key={idx} className="flex items-start gap-3 px-5 py-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${a.tipo === 'venta' ? 'bg-red-50 text-destructive' : 'bg-green-50 text-success'}`}>
                  {a.tipo === 'venta' ? <ArrowUpCircle size={15} /> : <ArrowDownCircle size={15} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-navy leading-snug">{a.texto}</p>
                  <p className="text-xs text-text-secondary">{a.detalle}</p>
                  <p className="text-[11px] text-text-secondary/70">{formatDate(a.fecha)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap size={18} className="text-orange" /> Acceso rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AccesoRapido icon={PackagePlus} label="Nuevo producto" onClick={() => navigate('/inventario/productos')} />
            <AccesoRapido icon={ShoppingBag} label="Registrar compra" onClick={() => navigate('/compras')} />
            <AccesoRapido icon={BarChart3} label="Ver reportes" onClick={() => navigate('/reportes')} />
            <AccesoRapido icon={ClipboardList} label="Ver inventario" onClick={() => navigate('/inventario/stock')} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function KpiCard({ icon: Icon, bg, label, value }: any) {
  return (
    <div className="stat-card">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-2" style={{ backgroundColor: bg }}>
        <Icon size={20} />
      </div>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-2xl font-bold text-navy">{value}</p>
    </div>
  )
}

function AccesoRapido({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-orange hover:bg-orange/5 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center text-navy shrink-0">
        <Icon size={17} />
      </div>
      <span className="text-sm font-medium text-navy">{label}</span>
    </button>
  )
}