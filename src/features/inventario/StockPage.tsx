import { useMemo, useState } from 'react'
import { useInventarioLocal, estadoDe } from '@/hooks/useInventario'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { BadgeEstado } from '@/components/ui/badge-estado'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import { useLocales } from '@/hooks/useVentas'
import { useAuth } from '@/features/auth/AuthContext'
import { Search, Boxes } from 'lucide-react'

export default function StockPage() {
  const { usuario } = useAuth()
  const { data: locales } = useLocales()
  const [idLocal, setIdLocal] = useState<string>('')
  const { data: inventario, isLoading } = useInventarioLocal(idLocal || undefined)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const filtrado = useMemo(() => {
    if (!inventario) return []
    let lista = inventario
    const q = busqueda.trim().toLowerCase()
    if (q) lista = lista.filter((i) => i.producto?.nombre.toLowerCase().includes(q))
    if (filtroEstado) {
      lista = lista.filter((i) => estadoDe(i.stock_actual, i.producto?.stock_minimo ?? 0) === filtroEstado)
    }
    return lista
  }, [inventario, busqueda, filtroEstado])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy flex items-center gap-2 mb-1">
        <Boxes className="text-orange" size={24} /> Stock
      </h1>
      <p className="text-sm text-text-secondary mb-5">Nivel de inventario por producto y local, con semáforo de reposición.</p>

      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 text-text-secondary" size={18} />
          <Input placeholder="Buscar producto..." className="pl-9" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        {usuario?.rol === 'gerente' && (
          <Select className="max-w-xs" value={idLocal} onChange={(e) => setIdLocal(e.target.value)}>
            <option value="">Todos los locales</option>
            {locales?.map((l: any) => <option key={l.id_local} value={l.id_local}>{l.nombre}</option>)}
          </Select>
        )}
        <Select className="max-w-[160px]" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="OK">OK</option>
          <option value="BAJO">Bajo</option>
          <option value="CRITICO">Crítico</option>
        </Select>
      </div>

      {isLoading ? <p className="text-text-secondary">Cargando inventario...</p> : (
        <Table>
          <THead>
            <TR>
              <TH>Producto</TH><TH>Categoría</TH>
              {usuario?.rol === 'gerente' && <TH>Local</TH>}
              <TH>Stock actual</TH><TH>Stock mínimo</TH><TH>Estado</TH><TH>Actualizado</TH>
            </TR>
          </THead>
          <TBody>
            {filtrado.map((item) => (
              <TR key={item.id_inventario}>
                <TD className="font-medium text-navy">{item.producto?.nombre}</TD>
                <TD>{item.producto?.categoria?.nombre}</TD>
                {usuario?.rol === 'gerente' && <TD>{item.local?.nombre}</TD>}
                <TD>{item.stock_actual}</TD>
                <TD>{item.producto?.stock_minimo}</TD>
                <TD><BadgeEstado estado={estadoDe(item.stock_actual, item.producto?.stock_minimo ?? 0)} /></TD>
                <TD className="text-text-secondary text-xs">{formatDate(item.fecha_actualizacion)}</TD>
              </TR>
            ))}
            {filtrado.length === 0 && <TR><TD colSpan={7} className="text-text-secondary">Sin productos.</TD></TR>}
          </TBody>
        </Table>
      )}
    </div>
  )
}