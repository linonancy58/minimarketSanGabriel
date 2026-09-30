import { useState } from 'react'
import { NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import { navParaRol } from '@/lib/nav'
import { ShoppingBasket, ChevronDown, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AppLayout() {
  const { usuario, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({
    Inventario: location.pathname.startsWith('/inventario'),
    Movimientos: location.pathname.startsWith('/movimientos'),
  })

  if (!usuario) return null

  const visibles = navParaRol(usuario.rol)

  function toggle(label: string) {
    setAbiertos((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <aside className="hidden md:flex w-72 bg-gradient-to-b from-[#C2410C] to-[#7C2D12] flex-col shrink-0 overflow-y-auto">
        <div className="px-5 py-5 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center shrink-0">
              <ShoppingBasket size={20} className="text-[#C2410C]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-tight tracking-tight">SAN GABRIEL</h1>
              <p className="text-[11px] font-semibold text-white/80 tracking-wide">SISTEMA DE GESTIÓN</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1">
          <p className="px-2 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-white/50">Menú principal</p>
          {visibles.map((item) => {
            if ('to' in item) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-colors',
                      isActive ? 'bg-white text-[#C2410C]' : 'text-white/90 hover:bg-white/10'
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
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-colors',
                    algunoActivo ? 'bg-white text-[#C2410C]' : 'text-white/90 hover:bg-white/10'
                  )}
                >
                  <item.icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown size={15} className={cn('transition-transform', abierto && 'rotate-180')} />
                </button>
                {abierto && (
                  <div className="ml-4 mt-0.5 pl-3 border-l-2 border-white/20 space-y-0.5">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors',
                            isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
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

        <div className="p-4 border-t border-white/15">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold text-white/90 hover:bg-white/10 transition-colors"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
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