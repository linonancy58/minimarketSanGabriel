import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ShoppingCart, PackagePlus, ShoppingBag, Tag, Truck, UserPlus, Boxes, BarChart3, ArrowDownCircle, ArrowUpCircle,
} from 'lucide-react'

export type Acceso = { label: string; desc: string; to: string; icon: React.ElementType }

// "?nuevo=1" abre directamente el formulario de alta en la página destino
const TODOS: Record<string, Acceso> = {
  venta: { label: 'Nueva venta', desc: 'Abrir punto de venta', to: '/pos', icon: ShoppingCart },
  producto: { label: 'Nuevo producto', desc: 'Agregar al catálogo', to: '/inventario/productos?nuevo=1', icon: PackagePlus },
  compra: { label: 'Registrar compra', desc: 'Ingreso de mercadería', to: '/compras?nuevo=1', icon: ShoppingBag },
  categoria: { label: 'Nueva categoría', desc: 'Clasificar productos', to: '/inventario/categorias?nuevo=1', icon: Tag },
  proveedor: { label: 'Nuevo proveedor', desc: 'Registrar empresa', to: '/proveedores?nuevo=1', icon: Truck },
  usuario: { label: 'Nuevo usuario', desc: 'Cajero, almacenero o gerente', to: '/usuarios?nuevo=1', icon: UserPlus },
  stock: { label: 'Ver stock', desc: 'Inventario por local', to: '/inventario/stock', icon: Boxes },
  reportes: { label: 'Ver reportes', desc: 'Histórico de ventas', to: '/reportes', icon: BarChart3 },
  entradas: { label: 'Entradas', desc: 'Historial de ingresos', to: '/movimientos/entradas', icon: ArrowDownCircle },
  salidas: { label: 'Salidas', desc: 'Historial de ventas', to: '/movimientos/salidas', icon: ArrowUpCircle },
}

const POR_ROL: Record<string, (keyof typeof TODOS)[]> = {
  gerente: ['venta', 'producto', 'compra', 'categoria', 'proveedor', 'usuario', 'stock', 'reportes'],
  almacenero: ['compra', 'stock', 'entradas', 'salidas'],
  cajero: ['venta', 'salidas', 'entradas'],
}

export function accesosParaRol(rol: string): Acceso[] {
  return (POR_ROL[rol] ?? []).map((k) => TODOS[k])
}

/** Ejecuta `abrir` si la URL trae ?nuevo=1 y limpia el parámetro */
export function useAbrirSiNuevo(abrir: () => void) {
  const [params, setParams] = useSearchParams()
  useEffect(() => {
    if (params.get('nuevo')) {
      abrir()
      setParams({}, { replace: true })
    }
  }, [params]) // eslint-disable-line react-hooks/exhaustive-deps
}
