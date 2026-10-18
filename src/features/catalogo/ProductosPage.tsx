import { useMemo, useRef, useState } from 'react'
import { useAbrirSiNuevo } from '@/lib/accesos'
import { useProductos, useCategorias, useProveedores, useGuardarProducto, subirImagenProducto } from '@/hooks/useCatalogo'
import { ProductoImagen } from '@/components/ProductoImagen'
import { Table, THead, TBody, TR, TH, TD, TEmpty } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input, InputWithIcon } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/label'
import { Modal } from '@/components/ui/dialog'
import { Alert, PageHeader, Toolbar } from '@/components/ui/page'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Producto } from '@/lib/types'
import { Plus, Pencil, Search, X, ImagePlus, Loader2, Trash2 } from 'lucide-react'

export default function ProductosPage() {
  const { data: productos, isLoading } = useProductos()
  const { data: categorias } = useCategorias()
  const { data: proveedores } = useProveedores()
  const [editando, setEditando] = useState<Partial<Producto> | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [idCategoria, setIdCategoria] = useState('')
  const [idProveedor, setIdProveedor] = useState('')
  const [estado, setEstado] = useState('')
  useAbrirSiNuevo(() => setEditando({}))

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return (productos ?? []).filter(
      (p) =>
        (!q || p.nombre.toLowerCase().includes(q) || p.codigo_barras?.includes(q)) &&
        (!idCategoria || (idCategoria === 'ninguna' ? !p.id_categoria : p.id_categoria === idCategoria)) &&
        (!idProveedor || (idProveedor === 'ninguno' ? !p.id_proveedor : p.id_proveedor === idProveedor)) &&
        (!estado || (estado === 'activo' ? p.activo : !p.activo))
    )
  }, [productos, busqueda, idCategoria, idProveedor, estado])

  const hayFiltros = !!(busqueda || idCategoria || idProveedor || estado)
  function limpiarFiltros() {
    setBusqueda('')
    setIdCategoria('')
    setIdProveedor('')
    setEstado('')
  }

  return (
    <div className="page">
      <PageHeader
        title="Productos"
        description="Catálogo maestro de productos de la cadena."
        actions={<Button onClick={() => setEditando({})}><Plus size={16} /> Nuevo producto</Button>}
      />

      <Toolbar>
        <InputWithIcon icon={Search} wrapperClassName="sm:max-w-[260px]" placeholder="Buscar por nombre o código…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <Select className="sm:max-w-[190px]" value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {categorias?.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
          <option value="ninguna">Sin categoría</option>
        </Select>
        <Select className="sm:max-w-[210px]" value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)} aria-label="Filtrar por proveedor">
          <option value="">Todos los proveedores</option>
          {proveedores?.map((p) => <option key={p.id_proveedor} value={p.id_proveedor}>{p.razon_social}</option>)}
          <option value="ninguno">Sin proveedor</option>
        </Select>
        <Select className="sm:max-w-[175px]" value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </Select>
        {hayFiltros && (
          <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="text-muted-foreground">
            <X size={14} /> Limpiar
          </Button>
        )}
        <p className="text-[13px] text-muted-foreground sm:ml-auto">
          <span className="num font-semibold text-foreground">{filtrados.length}</span> de {productos?.length ?? 0} productos
        </p>
      </Toolbar>

      <Table>
        <THead>
          <TR>
            <TH>Producto</TH><TH>Categoría</TH><TH>Proveedor</TH>
            <TH className="text-right">Precio</TH><TH className="text-right">Stock mín / máx</TH><TH>Estado</TH><TH className="w-12" />
          </TR>
        </THead>
        <TBody>
          {isLoading ? (
            <TEmpty colSpan={7}>Cargando productos…</TEmpty>
          ) : filtrados.length === 0 ? (
            <TEmpty colSpan={7}>Sin resultados.</TEmpty>
          ) : (
            filtrados.map((p) => (
              <TR key={p.id_producto} className="group">
                <TD>
                  <div className="flex items-center gap-3">
                    <ProductoImagen url={p.imagen_url} nombre={p.nombre} className="h-10 w-10" />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{p.nombre}</p>
                      {p.codigo_barras && <p className="num text-xs text-muted-foreground">{p.codigo_barras}</p>}
                    </div>
                  </div>
                </TD>
                <TD className="text-muted-foreground">{p.categoria?.nombre ?? '—'}</TD>
                <TD className="text-muted-foreground">{p.proveedor?.razon_social ?? '—'}</TD>
                <TD className="num text-right font-semibold">{formatCurrency(p.precio_venta)}</TD>
                <TD className="num text-right text-muted-foreground">{p.stock_minimo} / {p.stock_maximo}</TD>
                <TD>{p.activo ? <Badge tone="success" dot>Activo</Badge> : <Badge dot>Inactivo</Badge>}</TD>
                <TD>
                  <Button variant="ghost" size="icon" onClick={() => setEditando(p)} aria-label={`Editar ${p.nombre}`} className="text-muted-foreground">
                    <Pencil size={15} />
                  </Button>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

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
  const [subiendo, setSubiendo] = useState(false)
  const inputImagen = useRef<HTMLInputElement>(null)

  function set(campo: keyof Producto, valor: any) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function onElegirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setSubiendo(true)
    try {
      set('imagen_url', await subirImagenProducto(file))
    } catch (err: any) {
      setError(err.message ?? 'No se pudo subir la imagen.')
    } finally {
      setSubiendo(false)
    }
  }

  async function onGuardar() {
    setError(null)
    if (!form.nombre || !form.precio_venta || form.stock_maximo == null) {
      setError('Completa nombre, precio y stock máximo.')
      return
    }
    try {
      // Los selects vacíos deben guardarse como NULL (son columnas uuid)
      await guardar.mutateAsync({ ...form, id_categoria: form.id_categoria || null, id_proveedor: form.id_proveedor || null })
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'No se pudo guardar el producto.')
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={form.id_producto ? 'Editar producto' : 'Nuevo producto'}
      description="Los cambios se aplican a los 4 locales."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onGuardar} disabled={guardar.isPending || subiendo}>{guardar.isPending ? 'Guardando…' : 'Guardar producto'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => inputImagen.current?.click()}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
            aria-label="Elegir imagen del producto"
          >
            <ProductoImagen url={form.imagen_url} nombre={form.nombre ?? 'Producto'} className="h-full w-full rounded-xl" iconSize={28} />
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ImagePlus size={22} />
            </span>
            {subiendo && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white">
                <Loader2 size={22} className="animate-spin" />
              </span>
            )}
          </button>
          <div className="space-y-2">
            <p className="text-[13px] font-medium">Imagen del producto</p>
            <p className="text-xs text-muted-foreground">JPG, PNG o WebP, máximo 3 MB.</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => inputImagen.current?.click()} disabled={subiendo}>
                <ImagePlus size={14} /> {form.imagen_url ? 'Cambiar' : 'Subir imagen'}
              </Button>
              {form.imagen_url && (
                <Button type="button" variant="ghost" size="sm" onClick={() => set('imagen_url', null)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} /> Quitar
                </Button>
              )}
            </div>
          </div>
          <input ref={inputImagen} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onElegirImagen} />
        </div>
        <Field label="Nombre"><Input value={form.nombre ?? ''} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej. Arroz Costeño 5 kg" /></Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <Field label="Código de barras"><Input className="num" value={form.codigo_barras ?? ''} onChange={(e) => set('codigo_barras', e.target.value)} /></Field>
          <Field label="Estado">
            <Select value={form.activo === false ? 'inactivo' : 'activo'} onChange={(e) => set('activo', e.target.value === 'activo')}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Precio (S/)"><Input type="number" step="0.01" className="num" value={form.precio_venta ?? ''} onChange={(e) => set('precio_venta', Number(e.target.value))} /></Field>
          <Field label="Stock mín."><Input type="number" className="num" value={form.stock_minimo ?? 0} onChange={(e) => set('stock_minimo', Number(e.target.value))} /></Field>
          <Field label="Stock máx."><Input type="number" className="num" value={form.stock_maximo ?? ''} onChange={(e) => set('stock_maximo', Number(e.target.value))} /></Field>
        </div>
        {error && <Alert tone="error">{error}</Alert>}
      </div>
    </Modal>
  )
}
