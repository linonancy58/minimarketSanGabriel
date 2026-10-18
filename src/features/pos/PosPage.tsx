import { useMemo, useState } from 'react'
import { useProductos } from '@/hooks/useCatalogo'
import { useRegistrarVenta, useLocales } from '@/hooks/useVentas'
import { useAuth } from '@/features/auth/AuthContext'
import { Select } from '@/components/ui/select'
import { InputWithIcon } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, EmptyState, Skeleton } from '@/components/ui/page'
import { cn, formatCurrency } from '@/lib/utils'
import { Producto } from '@/lib/types'
import { ProductoImagen } from '@/components/ProductoImagen'
import { Search, Plus, Minus, Trash2, ShoppingCart, ScanBarcode, X, ChevronUp } from 'lucide-react'

interface ItemCarrito {
  producto: Producto
  cantidad: number
}

export default function PosPage() {
  const { data: productos, isLoading } = useProductos()
  const registrarVenta = useRegistrarVenta()
  const { usuario } = useAuth()
  const { data: locales } = useLocales()
  // Gerente: no tiene local fijo, elige en qué local registra la venta
  const eligeLocal = !usuario?.id_local
  const [idLocal, setIdLocal] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState<string>('')
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [confirmado, setConfirmado] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [carritoMovil, setCarritoMovil] = useState(false)

  const categorias = useMemo(() => {
    const set = new Set<string>()
    for (const p of productos ?? []) if (p.activo && p.categoria?.nombre) set.add(p.categoria.nombre)
    return [...set].sort()
  }, [productos])

  const filtrados = useMemo(() => {
    if (!productos) return []
    const q = busqueda.trim().toLowerCase()
    return productos.filter(
      (p) =>
        p.activo &&
        (!categoria || p.categoria?.nombre === categoria) &&
        (!q || p.nombre.toLowerCase().includes(q) || p.codigo_barras?.includes(q))
    )
  }, [productos, busqueda, categoria])

  function agregar(producto: Producto) {
    setCarrito((prev) => {
      const existe = prev.find((it) => it.producto.id_producto === producto.id_producto)
      if (existe) {
        return prev.map((it) =>
          it.producto.id_producto === producto.id_producto ? { ...it, cantidad: it.cantidad + 1 } : it
        )
      }
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(id: string, delta: number) {
    setCarrito((prev) =>
      prev
        .map((it) => (it.producto.id_producto === id ? { ...it, cantidad: it.cantidad + delta } : it))
        .filter((it) => it.cantidad > 0)
    )
  }

  function quitar(id: string) {
    setCarrito((prev) => prev.filter((it) => it.producto.id_producto !== id))
  }

  const total = carrito.reduce((acc, it) => acc + it.cantidad * it.producto.precio_venta, 0)
  const unidades = carrito.reduce((acc, it) => acc + it.cantidad, 0)
  const enCarrito = (id: string) => carrito.find((it) => it.producto.id_producto === id)?.cantidad ?? 0

  async function confirmarVenta() {
    setError(null)
    if (eligeLocal && !idLocal) { setError('Selecciona el local donde se registra la venta.'); return }
    try {
      await registrarVenta.mutateAsync({
        id_local: idLocal || undefined,
        items: carrito.map((it) => ({
          id_producto: it.producto.id_producto,
          cantidad: it.cantidad,
          precio_unitario: it.producto.precio_venta,
        })),
      })
      setConfirmado(total)
      setCarrito([])
      setCarritoMovil(false)
      setTimeout(() => setConfirmado(null), 4000)
    } catch (e: any) {
      setError(e.message ?? 'No se pudo registrar la venta (verifica el stock disponible).')
    }
  }

  const panelCarrito = (
    <>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <ShoppingCart size={18} className="text-muted-foreground" />
          <h2 className="text-[15px] font-semibold">Venta actual</h2>
          {unidades > 0 && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">{unidades}</span>}
        </div>
        {carrito.length > 0 && (
          <button onClick={() => setCarrito([])} className="text-xs font-medium text-muted-foreground hover:text-destructive">
            Vaciar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {carrito.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Carrito vacío" description="Toca un producto o escanea su código para agregarlo." />
        ) : (
          <ul className="divide-y divide-border">
            {carrito.map((it) => (
              <li key={it.producto.id_producto} className="flex items-center gap-3 px-2 py-3">
                <ProductoImagen url={it.producto.imagen_url} nombre={it.producto.nombre} className="h-10 w-10" iconSize={16} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{it.producto.nombre}</p>
                  <p className="num text-xs text-muted-foreground">{formatCurrency(it.producto.precio_venta)} c/u</p>
                </div>
                <div className="flex items-center rounded-lg border border-border">
                  <button className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground" onClick={() => cambiarCantidad(it.producto.id_producto, -1)} aria-label="Restar">
                    <Minus size={14} />
                  </button>
                  <span className="num w-7 text-center text-sm font-semibold">{it.cantidad}</span>
                  <button className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground" onClick={() => cambiarCantidad(it.producto.id_producto, 1)} aria-label="Sumar">
                    <Plus size={14} />
                  </button>
                </div>
                <p className="num hidden w-20 text-right text-sm font-semibold sm:block">{formatCurrency(it.cantidad * it.producto.precio_venta)}</p>
                <button className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive-soft hover:text-destructive" onClick={() => quitar(it.producto.id_producto)} aria-label="Quitar">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t border-border bg-muted/30 px-5 py-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Artículos</span>
          <span className="num">{unidades}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Total</span>
          <span className="num text-[28px] font-bold tracking-tight">{formatCurrency(total)}</span>
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <Button size="lg" className="w-full" disabled={carrito.length === 0 || registrarVenta.isPending} onClick={confirmarVenta}>
          {registrarVenta.isPending ? 'Procesando…' : 'Cobrar venta'}
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex lg:h-full">
      {/* Catálogo */}
      <div className="min-w-0 flex-1 space-y-4 px-4 py-6 md:px-8 lg:overflow-y-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-[28px]">Punto de venta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Busca por nombre o escanea el código de barras.</p>
          </div>
          {eligeLocal && (
            <Select className="sm:max-w-[240px]" value={idLocal} onChange={(e) => setIdLocal(e.target.value)} aria-label="Local de la venta">
              <option value="">Selecciona el local…</option>
              {locales?.map((l: any) => <option key={l.id_local} value={l.id_local}>{l.nombre}</option>)}
            </Select>
          )}
        </div>

        <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-background/90 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
          <div className="relative">
            <InputWithIcon
              icon={Search}
              autoFocus
              placeholder="Buscar producto o código…"
              className="h-12 pr-11 text-base"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <ScanBarcode size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
          {categorias.length > 0 && (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {['', ...categorias].map((c) => (
                <button
                  key={c || 'todas'}
                  onClick={() => setCategoria(c)}
                  className={cn(
                    'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                    categoria === c ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  )}
                >
                  {c || 'Todas'}
                </button>
              ))}
            </div>
          )}
        </div>

        {confirmado !== null && <Alert tone="success">Venta registrada por <strong className="num">{formatCurrency(confirmado)}</strong></Alert>}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : filtrados.length === 0 ? (
          <EmptyState icon={Search} title="Sin resultados" description="Prueba con otro nombre, código o categoría." />
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-24 sm:grid-cols-3 lg:pb-0 xl:grid-cols-4">
            {filtrados.map((p) => {
              const cant = enCarrito(p.id_producto)
              return (
                <button
                  key={p.id_producto}
                  onClick={() => agregar(p)}
                  className={cn(
                    'group relative flex flex-col rounded-xl border bg-card p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop active:scale-[0.98]',
                    cant > 0 ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40'
                  )}
                >
                  {cant > 0 && (
                    <span className="num absolute right-2.5 top-2.5 z-10 flex h-6 min-w-6 shadow-pop items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                      {cant}
                    </span>
                  )}
                  <ProductoImagen url={p.imagen_url} nombre={p.nombre} className="mb-3 aspect-[4/3] w-full rounded-lg border-0" iconSize={26} />
                  <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{p.categoria?.nombre ?? 'General'}</p>
                  <p className={cn('mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5')}>{p.nombre}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="num text-base font-bold">{formatCurrency(p.precio_venta)}</p>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Plus size={15} />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Carrito: panel lateral en escritorio */}
      <aside className="hidden w-[400px] shrink-0 flex-col border-l border-border bg-card lg:flex">{panelCarrito}</aside>

      {/* Carrito: barra flotante + hoja en móvil/tablet */}
      {carrito.length > 0 && !carritoMovil && (
        <button
          onClick={() => setCarritoMovil(true)}
          className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-pop animate-fade-up md:bottom-6 lg:hidden"
        >
          <span className="num flex h-7 min-w-7 items-center justify-center rounded-full bg-white/20 px-2 text-sm font-bold">{unidades}</span>
          <span className="flex-1 text-left text-sm font-semibold">Ver venta</span>
          <span className="num text-base font-bold">{formatCurrency(total)}</span>
          <ChevronUp size={18} />
        </button>
      )}
      {carritoMovil && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-[2px] lg:hidden" onClick={() => setCarritoMovil(false)}>
          <div
            className="flex max-h-[88dvh] w-full flex-col rounded-t-2xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end px-3 pt-3">
              <button onClick={() => setCarritoMovil(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            {panelCarrito}
          </div>
        </div>
      )}
    </div>
  )
}
