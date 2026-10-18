import { Suspense } from 'react'
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import { Brand } from '@/components/Brand'
import { Avatar, ROL_LABEL } from '@/components/Avatar'
import { Skeleton } from '@/components/ui/page'
import { navParaRol } from '@/lib/nav'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const itemBase =
  'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors'
const itemActivo =
  'bg-sidebar-accent text-white before:absolute before:-left-3 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-emerald-400'
const itemInactivo = 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white'

export default function AppLayout() {
  const { usuario, signOut } = useAuth()
  const navigate = useNavigate()

  if (!usuario) return null

  const visibles = navParaRol(usuario.rol)

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-16 items-center px-5">
          <Brand inverted />
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-2xs font-semibold uppercase tracking-[0.1em] text-sidebar-muted">Menú</p>
          {visibles.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cn(itemBase, isActive ? itemActivo : itemInactivo)}>
              <item.icon size={18} strokeWidth={1.9} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <Avatar nombre={usuario.nombre} url={usuario.avatar_url} className="ring-sidebar" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-semibold text-white">{usuario.nombre}</p>
              <p className="text-2xs text-sidebar-muted">{ROL_LABEL[usuario.rol] ?? usuario.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="rounded-md p-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <Suspense
            fallback={
              <div className="page">
                <Skeleton className="h-9 w-56" />
                <Skeleton className="h-72" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
        <BottomNav />
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
