import { useState } from 'react'
import { useProductos, useCategorias, useProveedores, useGuardarProducto } from '@/hooks/useCatalogo'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Producto } from '@/lib/types'
import { Plus, Pencil, X, Search, Package } from 'lucide-react'

export default function ProductosPage() {
  const { data: productos, isLoading } = useProductos()
  const [editando, setEditando] = useState<Partial<Producto> | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const filtrados = (productos ?? []).filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Package className="text-orange" size={24} /> Productos
          </h1>
          <p className="text-sm text-text-secondary">Catálogo maestro de productos de la cadena.</p>
        </div>
        <Button variant="accent" onClick={() => setEditando({})}><Plus size={16} /> Nuevo producto</Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-2.5 text-text-secondary" size={18} />
        <Input placeholder="Buscar producto..." className="pl-9" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      {isLoading ? <p className="text-text-secondary">Cargando...</p> : (
        <Table>
          <THead>
            <TR><TH>Nombre</TH><TH>Categoría</TH><TH>Proveedor</TH><TH>Precio</TH><TH>Stock min/max</TH><TH></TH></TR>
          </THead>
          <TBody>
            {filtrados.map((p) => (
              <TR key={p.id_producto}>
                <TD className="font-medium text-navy">{p.nombre}</TD>
                <TD>{p.categoria?.nombre ?? '—'}</TD>
                <TD>{p.proveedor?.razon_social ?? '—'}</TD>
                <TD>{formatCurrency(p.precio_venta)}</TD>
                <TD>{p.stock_minimo} / {p.stock_maximo}</TD>
                <TD><button onClick={() => setEditando(p)}><Pencil size={16} className="text-navy" /></button></TD>
              </TR>
            ))}
            {filtrados.length === 0 && <TR><TD colSpan={6} className="text-text-secondary">Sin resultados.</TD></TR>}
          </TBody>
        </Table>
      )}
      {editando && <ModalProducto producto={editando} onClose={() => setEditando(null)} />}
    </div>
  )
}

function ModalProducto({ producto, onClose }: { producto: Partial<Producto>; onClose: () => void }) {
  const { data: categorias } = useCategorias()
  const { data: proveedores } = useProveedores()
  const guardar = useGuardarProducto()
  const [form, setForm] = useState<Partial<Producto>>(producto)
  const [error, setError] = useState<string | null>(null)

  function set(campo: keyof Producto, valor: any) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function onGuardar() {
    setError(null)
    if (!form.nombre || !form.precio_venta || form.stock_maximo == null) {
      setError('Completa nombre, precio y stock máximo.')
      return
    }
    try {
      await guardar.mutateAsync(form)
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'No se pudo guardar el producto.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{form.id_producto ? 'Editar producto' : 'Nuevo producto'}</CardTitle>
          <button onClick={onClose}><X size={20} className="text-text-secondary" /></button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Nombre"><Input value={form.nombre ?? ''} onChange={(e) => set('nombre', e.target.value)} /></Field>
          <Field label="Código de barras"><Input value={form.codigo_barras ?? ''} onChange={(e) => set('codigo_barras', e.target.value)} /></Field>
          <Field label="Categoría">
            <Select value={form.id_categoria ?? ''} onChange={(e) => set('id_categoria', e.target.value)}>
              <option value="">Sin categoría</option>
              {categorias?.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Proveedor">
            <Select value={form.id_proveedor ?? ''} onChange={(e) => set('id_proveedor', e.target.value)}>
              <option value="">Sin proveedor</option>
              {proveedores?.map((p) => <option key={p.id_proveedor} value={p.id_proveedor}>{p.razon_social}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Precio venta"><Input type="number" step="0.01" value={form.precio_venta ?? ''} onChange={(e) => set('precio_venta', Number(e.target.value))} /></Field>
            <Field label="Stock mínimo"><Input type="number" value={form.stock_minimo ?? 0} onChange={(e) => set('stock_minimo', Number(e.target.value))} /></Field>
            <Field label="Stock máximo"><Input type="number" value={form.stock_maximo ?? ''} onChange={(e) => set('stock_maximo', Number(e.target.value))} /></Field>
          </div>
          {error && <p className="text-sm text-destructive bg-red-50 rounded-lg p-2">{error}</p>}
          <Button variant="accent" className="w-full" onClick={onGuardar} disabled={guardar.isPending}>
            {guardar.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-navy mb-1 block">{label}</label>
      {children}
    </div>
  )
}