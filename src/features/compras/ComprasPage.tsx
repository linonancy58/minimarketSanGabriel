import { useState } from 'react'
import { useProveedores, useProductos } from '@/hooks/useCatalogo'
import { useRegistrarCompra, useListaCompras } from '@/hooks/useInventario'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShoppingBag, Plus, Trash2, X } from 'lucide-react'

export default function ComprasPage() {
  const { data: compras, isLoading } = useListaCompras()
  const [mostrarModal, setMostrarModal] = useState(false)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <ShoppingBag className="text-orange" size={24} /> Compras
          </h1>
          <p className="text-sm text-text-secondary">Ingresos de mercadería registrados por proveedor.</p>
        </div>
        <Button variant="accent" onClick={() => setMostrarModal(true)}><Plus size={16} /> Registrar compra</Button>
      </div>

      {isLoading ? <p className="text-text-secondary">Cargando...</p> : (
        <Table>
          <THead><TR><TH>Fecha</TH><TH>Proveedor</TH><TH>Local</TH><TH>Registrado por</TH><TH>Ítems</TH><TH>Total</TH></TR></THead>
          <TBody>
            {compras?.map((c: any) => (
              <TR key={c.id_compra}>
                <TD className="text-text-secondary text-xs">{formatDate(c.fecha)}</TD>
                <TD className="font-medium text-navy">{c.proveedor?.razon_social}</TD>
                <TD>{c.local?.nombre}</TD>
                <TD>{c.usuario?.nombre}</TD>
                <TD>{c.detalle_compra?.length ?? 0}</TD>
                <TD className="font-semibold">{formatCurrency(Number(c.total))}</TD>
              </TR>
            ))}
            {(!compras || compras.length === 0) && <TR><TD colSpan={6} className="text-text-secondary">Sin compras registradas.</TD></TR>}
          </TBody>
        </Table>
      )}

      {mostrarModal && <ModalRegistrarCompra onClose={() => setMostrarModal(false)} />}
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

  function agregarItem() { setItems((prev) => [...prev, { id_producto: '', cantidad: 1, costo_unitario: 0 }]) }
  function actualizarItem(idx: number, campo: string, valor: any) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it)))
  }
  function quitarItem(idx: number) { setItems((prev) => prev.filter((_, i) => i !== idx)) }

  const total = items.reduce((acc, it) => acc + it.cantidad * it.costo_unitario, 0)

  async function guardar() {
    setError(null)
    if (!idProveedor || items.length === 0) { setError('Selecciona un proveedor y al menos un producto.'); return }
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
          <button onClick={onClose}><X size={20} className="text-text-secondary" /></button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-navy mb-1 block">Proveedor</label>
            <Select value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)}>
              <option value="">Selecciona un proveedor</option>
              {proveedores?.map((p) => <option key={p.id_proveedor} value={p.id_proveedor}>{p.razon_social}</option>)}
            </Select>
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Select className="flex-1" value={it.id_producto} onChange={(e) => actualizarItem(idx, 'id_producto', e.target.value)}>
                  <option value="">Producto</option>
                  {productos?.map((p) => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
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

          {error && <p className="text-sm text-destructive bg-red-50 rounded-md p-2">{error}</p>}
          {ok && <p className="text-sm text-white bg-success rounded-md p-2">Compra registrada correctamente.</p>}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button variant="accent" onClick={guardar} disabled={registrarCompra.isPending}>
              {registrarCompra.isPending ? 'Guardando...' : 'Guardar compra'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}