import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import Navbar from '@/components/Navbar'
import {
  LayoutDashboard, ShoppingCart, Boxes, Package, Users, ShoppingBasket,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['gerente'] },
  { to: '/pos', label: 'Ventas (POS)', icon: ShoppingCart, roles: ['cajero'] },
  { to: '/inventario', label: 'Inventario', icon: Boxes, roles: ['almacenero', 'gerente'] },
  { to: '/catalogo', label: 'Catálogo', icon: Package, roles: ['gerente'] },
  { to: '/usuarios', label: 'Usuarios', icon: Users, roles: ['gerente'] },
]

export default function AppLayout() {
  const { usuario } = useAuth()
  if (!usuario) return null

  const visibles = NAV_ITEMS.filter((item) => item.roles.includes(usuario.rol))

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <aside className="w-64 bg-navy text-white flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange flex items-center justify-center shadow-lg shadow-orange/20">
            <ShoppingBasket size={20} />
          </div>
          <div>
            <p className="font-bold leading-tight tracking-tight">San Gabriel</p>
            <p className="text-xs text-white/50">4 minimarkets · Los Olivos</p>
          </div>
        </div>

        <div className="mx-4 h-px bg-white/10 mb-3" />

        <nav className="flex-1 px-3 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-2">Menú</p>
          {visibles.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange text-white shadow-md shadow-orange/20'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <div className="rounded-xl bg-white/5 p-3 text-xs text-white/50 leading-relaxed">
            Sistema de gestión de inventarios con BI · v1.0
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
  if (usuario.rol === 'almacenero') return <Navigate to="/inventario" replace />
  return <Navigate to="/dashboard" replace />
}