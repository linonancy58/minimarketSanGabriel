import {
  LayoutDashboard, ShoppingCart, Boxes, Package, Tag, Users, ArrowDownCircle, ArrowUpCircle,
  ShoppingBag, Truck, BarChart3, Settings,
} from 'lucide-react'

export type NavItem = { to: string; label: string; icon: any; roles: string[] }
export type NavEntry = { label: string; icon: any; roles: string[] } & ({ to: string } | { children: NavItem[] })

export const NAV: NavEntry[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['gerente'] },
  { to: '/pos', label: 'Ventas (POS)', icon: ShoppingCart, roles: ['cajero'] },
  {
    label: 'Inventario', icon: Boxes, roles: ['gerente', 'almacenero'],
    children: [
      { to: '/inventario/productos', label: 'Productos', icon: Package, roles: ['gerente'] },
      { to: '/inventario/stock', label: 'Stock', icon: Boxes, roles: ['gerente', 'almacenero'] },
      { to: '/inventario/categorias', label: 'Categorías', icon: Tag, roles: ['gerente'] },
    ],
  },
  {
    label: 'Movimientos', icon: ArrowDownCircle, roles: ['gerente', 'almacenero', 'cajero'],
    children: [
      { to: '/movimientos/entradas', label: 'Entradas', icon: ArrowDownCircle, roles: ['gerente', 'almacenero', 'cajero'] },
      { to: '/movimientos/salidas', label: 'Salidas', icon: ArrowUpCircle, roles: ['gerente', 'almacenero', 'cajero'] },
    ],
  },
  { to: '/compras', label: 'Compras', icon: ShoppingBag, roles: ['gerente', 'almacenero'] },
  { to: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['gerente'] },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['gerente'] },
  { to: '/usuarios', label: 'Usuarios', icon: Users, roles: ['gerente'] },
  { to: '/configuracion', label: 'Configuración', icon: Settings, roles: ['gerente', 'almacenero', 'cajero'] },
]

export function navParaRol(rol: string): NavEntry[] {
  return NAV
    .filter((item) => item.roles.includes(rol))
    .map((item) => {
      if ('to' in item) return item
      const children = item.children.filter((c) => c.roles.includes(rol))
      return { ...item, children }
    })
    .filter((item) => 'to' in item || item.children.length > 0)
}