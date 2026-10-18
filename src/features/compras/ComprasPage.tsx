import { useState } from 'react'
import { useProveedores, useProductos } from '@/hooks/useCatalogo'
import { useRegistrarCompra, useListaCompras } from '@/hooks/useInventario'
import { useLocales } from '@/hooks/useVentas'
import { useAuth } from '@/features/auth/AuthContext'
import { Table, THead, TBody, TR, TH, TD, TEmpty } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field, Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/dialog'
import { Alert, PageHeader } from '@/components/ui/page'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import { useAbrirSiNuevo } from '@/lib/accesos'

export default function ComprasPage() {
  const { data: compras, isLoading } = useListaCompras()
  const [mostrarModal, setMostrarModal] = useState(false)
  useAbrirSiNuevo(() => setMostrarModal(true))

  return (
    <div className="page">
      <PageHeader
        title="Compras"
        description="Ingresos de mercadería registrados por proveedor."
        actions={<Button onClick={() => setMostrarModal(true)}><Plus size={16} /> Registrar compra</Button>}
      />

      <Table>
        <THead>
          <TR>
            <TH>Fecha</TH><TH>Proveedor</TH><TH>Local</TH><TH>Registrado por</TH>
            <TH className="text-right">Ítems</TH><TH className="text-right">Total</TH>
          </TR>
        </THead>
        <TBody>
          {isLoading ? (
            <TEmpty colSpan={6}>Cargando…</TEmpty>
          ) : !compras?.length ? (
            <TEmpty colSpan={6}>Sin compras registradas.</TEmpty>
          ) : (
            compras.map((c: any) => (
              <TR key={c.id_compra}>
                <TD className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(c.fecha)}</TD>
                <TD className="font-medium text-foreground">{c.proveedor?.razon_social}</TD>
                <TD className="text-muted-foreground">{c.local?.nombre}</TD>
                <TD>{c.usuario?.nombre}</TD>
                <TD className="num text-right">{c.detalle_compra?.length ?? 0}</TD>
                <TD className="num text-right font-semibold">{formatCurrency(Number(c.total))}</TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      {mostrarModal && <ModalRegistrarCompra onClose={() => setMostrarModal(false)} />}
    </div>
  )
}

function ModalRegistrarCompra({ onClose }: { onClose: () => void }) {
  const { data: proveedores } = useProveedores()
  const { data: productos } = useProductos()
  const { data: locales } = useLocales()
  const { usuario } = useAuth()
  const registrarCompra = useRegistrarCompra()
  // Gerente: no tiene local fijo, elige dónde ingresa la mercadería
  const eligeLocal = !usuario?.id_local

  const [idProveedor, setIdProveedor] = useState('')
  const [idLocal, setIdLocal] = useState('')
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
    if (eligeLocal && !idLocal) { setError('Selecciona el local donde ingresa la mercadería.'); return }
    if (!idProveedor || items.length === 0) { setError('Selecciona un proveedor y al menos un producto.'); return }
    if (items.some((it) => !it.id_producto || it.cantidad <= 0)) { setError('Completa el producto y una cantidad mayor a 0 en cada fila.'); return }
    try {
      await registrarCompra.mutateAsync({ id_proveedor: idProveedor, items, id_local: idLocal || undefined })
      setOk(true)
      setTimeout(onClose, 1200)
    } catch (e: any) {
      setError(e.message ?? 'No se pudo registrar la compra.')
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Registrar ingreso de mercadería"
      description="El stock del local se actualiza al guardar."
      className="sm:max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} disabled={registrarCompra.isPending || ok}>
            {registrarCompra.isPending ? 'Guardando…' : 'Guardar compra'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className={eligeLocal ? 'grid gap-4 sm:grid-cols-2' : ''}>
          {eligeLocal && (
            <Field label="Local de destino">
              <Select value={idLocal} onChange={(e) => setIdLocal(e.target.value)}>
                <option value="">Selecciona un local</option>
                {locales?.map((l: any) => <option key={l.id_local} value={l.id_local}>{l.nombre}</option>)}
              </Select>
            </Field>
          )}
          <Field label="Proveedor">
            <Select value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)}>
              <option value="">Selecciona un proveedor</option>
              {proveedores?.map((p) => <option key={p.id_proveedor} value={p.id_proveedor}>{p.razon_social}</option>)}
            </Select>
          </Field>
        </div>

        <div>
          <Label>Productos</Label>
          <div className="overflow-hidden rounded-lg border border-border">
            {items.length > 0 && (
              <div className="hidden grid-cols-[1fr_80px_110px_36px] gap-2 bg-muted/60 px-3 py-2 text-2xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                <span>Producto</span><span>Cant.</span><span>Costo unit.</span><span />
              </div>
            )}
            <div className="divide-y divide-border">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_auto] gap-2 p-3 sm:grid-cols-[1fr_80px_110px_36px] sm:items-center">
                  <Select className="col-span-2 sm:col-span-1" value={it.id_producto} onChange={(e) => actualizarItem(idx, 'id_producto', e.target.value)}>
                    <option value="">Selecciona producto</option>
                    {productos?.map((p) => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
                  </Select>
                  <div className="col-span-2 grid grid-cols-[1fr_1fr_36px] gap-2 sm:contents">
                    <Input type="number" min={1} className="num" value={it.cantidad} aria-label="Cantidad"
                      onChange={(e) => actualizarItem(idx, 'cantidad', Number(e.target.value))} />
                    <Input type="number" min={0} step="0.01" className="num" value={it.costo_unitario} aria-label="Costo unitario"
                      onChange={(e) => actualizarItem(idx, 'costo_unitario', Number(e.target.value))} />
                    <Button variant="ghost" size="icon" onClick={() => quitarItem(idx)} aria-label="Quitar" className="text-muted-foreground hover:bg-destructive-soft hover:text-destructive">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={agregarItem}
              className="flex w-full items-center justify-center gap-2 border-t border-dashed border-border px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary-soft first:border-t-0"
            >
              <Plus size={15} /> Agregar producto
            </button>
          </div>
        </div>

        <div className="flex items-baseline justify-between rounded-lg bg-muted/60 px-4 py-3">
          <span className="text-sm font-medium text-muted-foreground">Total de la compra</span>
          <span className="num text-xl font-bold">{formatCurrency(total)}</span>
        </div>

        {error && <Alert tone="error">{error}</Alert>}
        {ok && <Alert tone="success">Compra registrada correctamente.</Alert>}
      </div>
    </Modal>
  )
}
