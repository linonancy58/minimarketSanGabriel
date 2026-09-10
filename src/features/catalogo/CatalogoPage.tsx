import { useState } from 'react'
import {
  useProductos, useCategorias, useProveedores, useGuardarProducto, useGuardarCategoria, useGuardarProveedor,
} from '@/hooks/useCatalogo'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Producto } from '@/lib/types'
import { Plus, Pencil, X, Package, Tag, Truck } from 'lucide-react'

type Tab = 'productos' | 'categorias' | 'proveedores'

export default function CatalogoPage() {
  const [tab, setTab] = useState<Tab>('productos')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy mb-1">Catálogo</h1>
      <p className="text-sm text-muted-foreground mb-5">Productos, categorías y proveedores de la cadena.</p>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'productos'} onClick={() => setTab('productos')} icon={Package}>Productos</TabButton>
        <TabButton active={tab === 'categorias'} onClick={() => setTab('categorias')} icon={Tag}>Categorías</TabButton>
        <TabButton active={tab === 'proveedores'} onClick={() => setTab('proveedores')} icon={Truck}>Proveedores</TabButton>
      </div>

      {tab === 'productos' && <ProductosTab />}
      {tab === 'categorias' && <CategoriasTab />}
      {tab === 'proveedores' && <ProveedoresTab />}
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-navy text-white' : 'bg-secondary text-navy hover:bg-secondary/70'
      }`}
    >
      <Icon size={16} /> {children}
    </button>
  )
}

function ProductosTab() {
  const { data: productos, isLoading } = useProductos()
  const [editando, setEditando] = useState<Partial<Producto> | null>(null)

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button variant="accent" onClick={() => setEditando({})}><Plus size={16} /> Nuevo producto</Button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Cargando...</p> : (
        <Table>
          <THead>
            <TR><TH>Nombre</TH><TH>Categoría</TH><TH>Proveedor</TH><TH>Precio</TH><TH>Stock min/max</TH><TH></TH></TR>
          </THead>
          <TBody>
            {productos?.map((p) => (
              <TR key={p.id_producto}>
                <TD className="font-medium text-navy">{p.nombre}</TD>
                <TD>{p.categoria?.nombre ?? '—'}</TD>
                <TD>{p.proveedor?.razon_social ?? '—'}</TD>
                <TD>{formatCurrency(p.precio_venta)}</TD>
                <TD>{p.stock_minimo} / {p.stock_maximo}</TD>
                <TD><button onClick={() => setEditando(p)}><Pencil size={16} className="text-navy" /></button></TD>
              </TR>
            ))}
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
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
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

function CategoriasTab() {
  const { data: categorias, isLoading } = useCategorias()
  const guardar = useGuardarCategoria()
  const [nombre, setNombre] = useState('')

  return (
    <div>
      <div className="flex gap-2 mb-4 max-w-md">
        <Input placeholder="Nueva categoría..." value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Button variant="accent" onClick={() => { if (nombre) { guardar.mutate({ nombre }); setNombre('') } }}>
          <Plus size={16} /> Agregar
        </Button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Cargando...</p> : (
        <Table>
          <THead><TR><TH>Nombre</TH><TH>Descripción</TH></TR></THead>
          <TBody>
            {categorias?.map((c) => (
              <TR key={c.id_categoria}><TD className="font-medium text-navy">{c.nombre}</TD><TD>{c.descripcion ?? '—'}</TD></TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}

function ProveedoresTab() {
  const { data: proveedores, isLoading } = useProveedores()
  const guardar = useGuardarProveedor()
  const [form, setForm] = useState({ razon_social: '', ruc: '', telefono: '' })

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <Input placeholder="Razón social" className="w-56" value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} />
        <Input placeholder="RUC" className="w-40" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
        <Input placeholder="Teléfono" className="w-40" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        <Button variant="accent" onClick={() => {
          if (form.razon_social && form.ruc) { guardar.mutate(form); setForm({ razon_social: '', ruc: '', telefono: '' }) }
        }}>
          <Plus size={16} /> Agregar
        </Button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Cargando...</p> : (
        <Table>
          <THead><TR><TH>Razón social</TH><TH>RUC</TH><TH>Teléfono</TH></TR></THead>
          <TBody>
            {proveedores?.map((p) => (
              <TR key={p.id_proveedor}>
                <TD className="font-medium text-navy">{p.razon_social}</TD><TD>{p.ruc}</TD><TD>{p.telefono ?? '—'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
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
