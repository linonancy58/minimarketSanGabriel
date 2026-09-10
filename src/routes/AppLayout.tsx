import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import {
  LayoutDashboard, ShoppingCart, Boxes, Package, Users, LogOut, ShoppingBasket,
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
  const { usuario, signOut } = useAuth()
  if (!usuario) return null

  const visibles = NAV_ITEMS.filter((item) => item.roles.includes(usuario.rol))
  // Redirección de conveniencia según rol para la ruta raíz
  const defaultRoute =
    usuario.rol === 'gerente' ? '/' : usuario.rol === 'cajero' ? '/pos' : '/inventario'

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-navy text-white flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-2 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-orange flex items-center justify-center">
            <ShoppingBasket size={18} />
          </div>
          <div>
            <p className="font-bold leading-tight">San Gabriel</p>
            <p className="text-xs text-white/60">4 minimarkets · Los Olivos</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibles.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-orange text-white' : 'text-white/80 hover:bg-white/10'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-sm font-medium">{usuario.nombre}</p>
          <p className="text-xs text-white/60 capitalize mb-3">{usuario.rol}</p>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
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
