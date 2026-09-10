import { useMemo, useState } from 'react'
import { useInventarioLocal, estadoDe, useRegistrarCompra } from '@/hooks/useInventario'
import { useProveedores, useProductos } from '@/hooks/useCatalogo'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { BadgeEstado } from '@/components/ui/badge-estado'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, PackagePlus, Plus, Trash2, X } from 'lucide-react'

export default function InventarioPage() {
  const { data: inventario, isLoading } = useInventarioLocal()
  const [busqueda, setBusqueda] = useState('')
  const [mostrarCompra, setMostrarCompra] = useState(false)

  const filtrado = useMemo(() => {
    if (!inventario) return []
    const q = busqueda.trim().toLowerCase()
    if (!q) return inventario
    return inventario.filter((i) => i.producto?.nombre.toLowerCase().includes(q))
  }, [inventario, busqueda])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-navy">Inventario</h1>
          <p className="text-sm text-muted-foreground">Stock del local, con alertas de reposición.</p>
        </div>
        <Button variant="accent" onClick={() => setMostrarCompra(true)}>
          <PackagePlus size={18} /> Registrar compra
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
        <Input placeholder="Buscar producto..." className="pl-9" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando inventario...</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Producto</TH>
              <TH>Categoría</TH>
              <TH>Stock actual</TH>
              <TH>Stock mínimo</TH>
              <TH>Estado</TH>
              <TH>Actualizado</TH>
            </TR>
          </THead>
          <TBody>
            {filtrado.map((item) => (
              <TR key={item.id_inventario}>
                <TD className="font-medium text-navy">{item.producto?.nombre}</TD>
                <TD>{item.producto?.categoria?.nombre}</TD>
                <TD>{item.stock_actual}</TD>
                <TD>{item.producto?.stock_minimo}</TD>
                <TD>
                  <BadgeEstado estado={estadoDe(item.stock_actual, item.producto?.stock_minimo ?? 0)} />
                </TD>
                <TD className="text-muted-foreground text-xs">{formatDate(item.fecha_actualizacion)}</TD>
              </TR>
            ))}
            {filtrado.length === 0 && (
              <TR><TD className="text-muted-foreground" colSpan={6}>Sin productos en inventario.</TD></TR>
            )}
          </TBody>
        </Table>
      )}

      {mostrarCompra && <ModalRegistrarCompra onClose={() => setMostrarCompra(false)} />}
    </div>
  )
}

function ModalRegistrarCompra({ onClose }: { onClose: () => void }) {
  const { data: proveedores } = useProveedores()
  const { data: productos } = useProductos()
  const registrarCompra = useRegistrarCompra()

  const [idProveedor, setIdProveedor] = useState('')
  const [items, setItems] = useState<{ id_producto: string; cantidad: number; costo_unitario: number }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  function agregarItem() {
    setItems((prev) => [...prev, { id_producto: '', cantidad: 1, costo_unitario: 0 }])
  }

  function actualizarItem(idx: number, campo: string, valor: any) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it)))
  }

  function quitarItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const total = items.reduce((acc, it) => acc + it.cantidad * it.costo_unitario, 0)

  async function guardar() {
    setError(null)
    if (!idProveedor || items.length === 0) {
      setError('Selecciona un proveedor y al menos un producto.')
      return
    }
    try {
      await registrarCompra.mutateAsync({ id_proveedor: idProveedor, items })
      setOk(true)
      setTimeout(onClose, 1200)
    } catch (e: any) {
      setError(e.message ?? 'No se pudo registrar la compra.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registrar ingreso de mercadería</CardTitle>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-navy mb-1 block">Proveedor</label>
            <Select value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)}>
              <option value="">Selecciona un proveedor</option>
              {proveedores?.map((p) => (
                <option key={p.id_proveedor} value={p.id_proveedor}>{p.razon_social}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Select className="flex-1" value={it.id_producto} onChange={(e) => actualizarItem(idx, 'id_producto', e.target.value)}>
                  <option value="">Producto</option>
                  {productos?.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                  ))}
                </Select>
                <Input type="number" min={1} className="w-20" value={it.cantidad}
                  onChange={(e) => actualizarItem(idx, 'cantidad', Number(e.target.value))} placeholder="Cant." />
                <Input type="number" min={0} step="0.01" className="w-28" value={it.costo_unitario}
                  onChange={(e) => actualizarItem(idx, 'costo_unitario', Number(e.target.value))} placeholder="Costo" />
                <button onClick={() => quitarItem(idx)}><Trash2 size={16} className="text-destructive" /></button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={agregarItem}><Plus size={14} /> Agregar producto</Button>
          </div>

          <div className="flex justify-between font-bold text-navy text-lg border-t border-border pt-3">
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>

          {error && <p className="text-sm text-destructive bg-red-50 rounded-lg p-2">{error}</p>}
          {ok && <p className="text-sm text-green-700 bg-green-50 rounded-lg p-2">Compra registrada correctamente.</p>}

          <Button variant="accent" className="w-full" onClick={guardar} disabled={registrarCompra.isPending}>
            {registrarCompra.isPending ? 'Guardando...' : 'Guardar compra'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
