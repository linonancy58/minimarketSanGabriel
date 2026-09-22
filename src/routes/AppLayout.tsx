import { useState } from 'react'
import { NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import Navbar from '@/components/Navbar'
import {
  LayoutDashboard, ShoppingCart, Boxes, Package, Tag, Users, ShoppingBasket,
  ArrowDownCircle, ArrowUpCircle, ShoppingBag, Truck, BarChart3, Settings, ChevronDown, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Item = { to: string; label: string; icon: any }
type NavEntry = { label: string; icon: any; roles: string[] } & ({ to: string } | { children: Item[] })

const NAV: NavEntry[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['gerente'] },
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
  const { usuario, signOut } = useAuth()
  const navigate = useNavigate()
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

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <aside className="w-72 bg-orange flex flex-col shrink-0 overflow-y-auto relative">
        {/* Marca de agua decorativa */}
        <ShoppingBasket size={220} className="absolute -bottom-10 -left-10 text-white/10 pointer-events-none" />

        {/* Logo */}
        <div className="px-6 py-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <ShoppingBasket size={22} className="text-orange" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white leading-tight">San Gabriel</h1>
              <p className="text-xs text-white/80">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 px-3 py-2 space-y-1 relative z-10">
          {visibles.map((item) => {
            if ('to' in item) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-white text-orange shadow-sm'
                        : 'text-white/90 hover:bg-white/10'
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
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                    algunoActivo ? 'bg-white text-orange shadow-sm' : 'text-white/90 hover:bg-white/10'
                  )}
                >
                  <item.icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown size={16} className={cn('transition-transform', abierto && 'rotate-180')} />
                </button>
                {abierto && (
                  <div className="ml-4 mt-1 pl-3 border-l-2 border-white/25 space-y-0.5">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            isActive ? 'bg-white/15 text-white font-bold' : 'text-white/75 hover:bg-white/10 hover:text-white'
                          )
                        }
                      >
                        <c.icon size={14} />
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 relative z-10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
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