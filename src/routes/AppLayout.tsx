import { useState } from 'react'
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import Navbar from '@/components/Navbar'
import {
  LayoutDashboard, ShoppingCart, Boxes, Package, Tag, Users, ShoppingBasket,
  ArrowDownCircle, ArrowUpCircle, ShoppingBag, Truck, BarChart3, Settings, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Item = { to: string; label: string; icon: any }
type NavEntry = { label: string; icon: any; roles: string[] } & ({ to: string } | { children: Item[] })

const NAV: NavEntry[] = [
  { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard, roles: ['gerente'] },
  { to: '/pos', label: 'Ventas (POS)', icon: ShoppingCart, roles: ['cajero'] },
  {
    label: 'Inventario', icon: Boxes, roles: ['gerente', 'almacenero'],
    children: [
      { to: '/inventario/productos', label: 'Productos', icon: Package },
      { to: '/inventario/stock', label: 'Stock', icon: Boxes },
      { to: '/inventario/categorias', label: 'Categorías', icon: Tag },
    ],
  },
  {
    label: 'Movimientos', icon: ArrowDownCircle, roles: ['gerente', 'almacenero', 'cajero'],
    children: [
      { to: '/movimientos/entradas', label: 'Entradas', icon: ArrowDownCircle },
      { to: '/movimientos/salidas', label: 'Salidas', icon: ArrowUpCircle },
    ],
  },
  { to: '/compras', label: 'Compras', icon: ShoppingBag, roles: ['gerente', 'almacenero'] },
  { to: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['gerente'] },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['gerente'] },
  { to: '/usuarios', label: 'Usuarios', icon: Users, roles: ['gerente'] },
  { to: '/configuracion', label: 'Configuración', icon: Settings, roles: ['gerente', 'almacenero', 'cajero'] },
]

export default function AppLayout() {
  const { usuario } = useAuth()
  const location = useLocation()
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({
    Inventario: location.pathname.startsWith('/inventario'),
    Movimientos: location.pathname.startsWith('/movimientos'),
  })

  if (!usuario) return null

  const visibles = NAV.filter((item) => item.roles.includes(usuario.rol))

  function toggle(label: string) {
    setAbiertos((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <aside className="w-64 bg-navy text-white flex flex-col shrink-0 overflow-y-auto">
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange flex items-center justify-center shadow-lg shadow-orange/20 shrink-0">
            <ShoppingBasket size={20} />
          </div>
          <div>
            <p className="font-bold leading-tight tracking-tight">San Gabriel</p>
            <p className="text-xs text-white/50">Sistema de Gestión de Inventarios</p>
          </div>
        </div>

        <div className="mx-4 h-px bg-white/10 mb-3" />

        <nav className="flex-1 px-3 space-y-1 pb-4">
          {visibles.map((item) => {
            if ('to' in item) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-orange text-white shadow-md shadow-orange/20'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              )
            }

            const abierto = abiertos[item.label]
            const algunoActivo = item.children.some((c) => location.pathname.startsWith(c.to))

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    algunoActivo ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown size={16} className={cn('transition-transform', abierto && 'rotate-180')} />
                </button>
                {abierto && (
                  <div className="ml-4 mt-1 pl-3 border-l border-white/10 space-y-1">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                            isActive ? 'bg-orange text-white font-medium' : 'text-white/65 hover:bg-white/10 hover:text-white'
                          )
                        }
                      >
                        <c.icon size={15} />
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4">
          <div className="rounded-xl bg-white/5 p-3 text-xs text-white/50 leading-relaxed">
            4 minimarkets · Los Olivos · v1.0
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function IndexRoute() {
  const { usuario } = useAuth()
  if (!usuario) return null
  if (usuario.rol === 'cajero') return <Navigate to="/pos" replace />
  if (usuario.rol === 'almacenero') return <Navigate to="/inventario/stock" replace />
  return <Navigate to="/dashboard" replace />
}