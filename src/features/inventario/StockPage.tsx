import { useMemo, useState } from 'react'
import { useInventarioLocal, estadoDe } from '@/hooks/useInventario'
import { Table, THead, TBody, TR, TH, TD, TEmpty } from '@/components/ui/table'
import { BadgeEstado } from '@/components/ui/badge-estado'
import { InputWithIcon } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PageHeader, Toolbar } from '@/components/ui/page'
import { cn, formatDate } from '@/lib/utils'
import { useLocales } from '@/hooks/useVentas'
import { useAuth } from '@/features/auth/AuthContext'
import { Search } from 'lucide-react'

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'OK', label: 'Normal' },
  { value: 'BAJO', label: 'Bajo' },
  { value: 'CRITICO', label: 'Crítico' },
]

export default function StockPage() {
  const { usuario } = useAuth()
  const { data: locales } = useLocales()
  const [idLocal, setIdLocal] = useState<string>('')
  const { data: inventario, isLoading } = useInventarioLocal(idLocal || undefined)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const conEstado = useMemo(
    () => (inventario ?? []).map((i) => ({ ...i, estado: estadoDe(i.stock_actual, i.producto?.stock_minimo ?? 0) })),
    [inventario]
  )

  const conteo = useMemo(() => {
    const c: Record<string, number> = { '': conEstado.length, OK: 0, BAJO: 0, CRITICO: 0 }
    for (const i of conEstado) c[i.estado]++
    return c
  }, [conEstado])

  const filtrado = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return conEstado.filter(
      (i) => (!q || i.producto?.nombre.toLowerCase().includes(q)) && (!filtroEstado || i.estado === filtroEstado)
    )
  }, [conEstado, busqueda, filtroEstado])

  const esGerente = usuario?.rol === 'gerente'

  return (
    <div className="page">
      <PageHeader title="Stock" description="Nivel de inventario por producto y local, con semáforo de reposición." />

      <Toolbar>
        <InputWithIcon icon={Search} wrapperClassName="sm:max-w-xs" placeholder="Buscar producto…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        {esGerente && (
          <Select className="sm:max-w-[220px]" value={idLocal} onChange={(e) => setIdLocal(e.target.value)}>
            <option value="">Todos los locales</option>
            {locales?.map((l: any) => <option key={l.id_local} value={l.id_local}>{l.nombre}</option>)}
          </Select>
        )}
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-xs sm:ml-auto">
          {ESTADOS.map((e) => (
            <button
              key={e.value}
              onClick={() => setFiltroEstado(e.value)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
                filtroEstado === e.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {e.label}
              <span className="num text-xs text-muted-foreground">{conteo[e.value] ?? 0}</span>
            </button>
          ))}
        </div>
      </Toolbar>

      <Table>
        <THead>
          <TR>
            <TH>Producto</TH>
            <TH>Categoría</TH>
            {esGerente && <TH>Local</TH>}
            <TH className="text-right">Stock actual</TH>
            <TH className="text-right">Mínimo</TH>
            <TH>Estado</TH>
            <TH>Actualizado</TH>
          </TR>
        </THead>
        <TBody>
          {isLoading ? (
            <TEmpty colSpan={7}>Cargando inventario…</TEmpty>
          ) : filtrado.length === 0 ? (
            <TEmpty colSpan={7}>No hay productos que coincidan con los filtros.</TEmpty>
          ) : (
            filtrado.map((item) => (
              <TR key={item.id_inventario}>
                <TD className="font-medium text-foreground">{item.producto?.nombre}</TD>
                <TD className="text-muted-foreground">{item.producto?.categoria?.nombre ?? '—'}</TD>
                {esGerente && <TD>{item.local?.nombre}</TD>}
                <TD className="num text-right font-semibold">{item.stock_actual}</TD>
                <TD className="num text-right text-muted-foreground">{item.producto?.stock_minimo}</TD>
                <TD><BadgeEstado estado={item.estado} /></TD>
                <TD className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(item.fecha_actualizacion)}</TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>
    </div>
  )
}
