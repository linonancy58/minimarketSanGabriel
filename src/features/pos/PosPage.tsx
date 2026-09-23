import { useMemo, useState } from 'react'
import { useProductos } from '@/hooks/useCatalogo'
import { useRegistrarVenta } from '@/hooks/useVentas'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Producto } from '@/lib/types'
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2 } from 'lucide-react'

interface ItemCarrito {
  producto: Producto
  cantidad: number
}

export default function PosPage() {
  const { data: productos, isLoading } = useProductos()
  const registrarVenta = useRegistrarVenta()
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [confirmado, setConfirmado] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    if (!productos) return []
    const q = busqueda.trim().toLowerCase()
    if (!q) return productos.filter((p) => p.activo)
    return productos.filter(
      (p) => p.activo && (p.nombre.toLowerCase().includes(q) || p.codigo_barras?.includes(q))
    )
  }, [productos, busqueda])

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

  async function confirmarVenta() {
    setError(null)
    try {
      await registrarVenta.mutateAsync({
        items: carrito.map((it) => ({
          id_producto: it.producto.id_producto,
          cantidad: it.cantidad,
          precio_unitario: it.producto.precio_venta,
        })),
      })
      setConfirmado(total)
      setCarrito([])
      setTimeout(() => setConfirmado(null), 4000)
    } catch (e: any) {
      setError(e.message ?? 'No se pudo registrar la venta (verifica el stock disponible).')
    }
  }

  return (
    <div className="h-screen flex">
      {/* Buscador y grilla de productos */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-navy mb-4">Punto de Venta</h1>
        <div className="relative mb-5">
          <Search className="absolute left-3 top-3.5 text-muted-foreground" size={20} />
          <Input
            autoFocus
            placeholder="Buscar por nombre o código de barras..."
            className="pl-10 h-12 text-base"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Cargando productos...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtrados.map((p) => (
              <button
                key={p.id_producto}
                onClick={() => agregar(p)}
                                className="text-left bg-card border border-border rounded-md p-4 hover:border-orange hover:shadow-md transition-all"
              >
                <p className="font-semibold text-navy text-sm mb-1 line-clamp-2">{p.nombre}</p>
                <p className="text-xs text-muted-foreground mb-2">{p.categoria?.nombre}</p>
                <p className="text-orange font-bold text-lg">{formatCurrency(p.precio_venta)}</p>
              </button>
            ))}
            {filtrados.length === 0 && <p className="text-muted-foreground col-span-full">Sin resultados.</p>}
          </div>
        )}
      </div>

      {/* Carrito */}
      <div className="w-96 bg-white border-l border-border p-5 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="text-navy" size={22} />
          <h2 className="text-lg font-bold text-navy">Carrito</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {carrito.length === 0 && <p className="text-sm text-muted-foreground">Agrega productos tocando la grilla.</p>}
          {carrito.map((it) => (
            <Card key={it.producto.id_producto}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{it.producto.nombre}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(it.producto.precio_venta)} c/u</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => cambiarCantidad(it.producto.id_producto, -1)}>
                    <Minus size={14} />
                  </Button>
                  <span className="w-6 text-center font-semibold">{it.cantidad}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => cambiarCantidad(it.producto.id_producto, 1)}>
                    <Plus size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => quitar(it.producto.id_producto)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t border-border pt-4 mt-4">
          <div className="flex justify-between text-lg font-bold text-navy mb-3">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          {error && <p className="text-sm text-destructive bg-red-50 rounded-lg p-2 mb-3">{error}</p>}
          {confirmado !== null && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg p-2 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} /> Venta registrada por {formatCurrency(confirmado)}
            </p>
          )}
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            disabled={carrito.length === 0 || registrarVenta.isPending}
            onClick={confirmarVenta}
          >
            {registrarVenta.isPending ? 'Procesando...' : 'Confirmar venta'}
          </Button>
        </div>
      </div>
    </div>
  )
}
