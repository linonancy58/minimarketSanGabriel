import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { navParaRol, NavItem } from '@/lib/nav'
import { MoreHorizontal, LogOut, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_TABS = 4

export default function BottomNav() {
  const { usuario, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mostrarMas, setMostrarMas] = useState(false)
  const [grupoAbierto, setGrupoAbierto] = useState<{ label: string; children: NavItem[] } | null>(null)

  if (!usuario) return null

  const entradas = navParaRol(usuario.rol)
  const principales = entradas.slice(0, MAX_TABS)
  const resto = entradas.slice(MAX_TABS)

  async function handleLogout() {
    setMostrarMas(false)
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border pb-[env(safe-area-inset-bottom,0px)]">
                <div className="grid" style={{ gridTemplateColumns: `repeat(${principales.length + (resto.length > 0 ? 1 : 0)}, minmax(0,1fr))` }}>
          {principales.map((item) => {
            if ('to' in item) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn('flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold', isActive ? 'text-orange' : 'text-text-secondary')
                  }
                >
                  <item.icon size={20} />
                  <span className="truncate max-w-full px-1">{item.label}</span>
                </NavLink>
              )
            }
            const algunoActivo = item.children.some((c) => location.pathname.startsWith(c.to))
            return (
              <button
                key={item.label}
                onClick={() => setGrupoAbierto({ label: item.label, children: item.children })}
                className={cn('flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold', algunoActivo ? 'text-orange' : 'text-text-secondary')}
              >
                <item.icon size={20} />
                <span className="truncate max-w-full px-1">{item.label}</span>
              </button>
            )
          })}

          {resto.length > 0 && (
            <button onClick={() => setMostrarMas(true)} className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold text-text-secondary">
              <MoreHorizontal size={20} />
              <span>Más</span>
            </button>
          )}
        </div>
      </nav>

      {mostrarMas && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setMostrarMas(false)}>
          <div className="w-full bg-white rounded-t-lg p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow">Más opciones</p>
              <button onClick={() => setMostrarMas(false)}><X size={18} className="text-text-secondary" /></button>
            </div>
            <div className="space-y-1">
              {resto.map((item) =>
                'to' in item ? (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMostrarMas(false)}
                    className={({ isActive }) => cn('flex items-center gap-3 px-3 py-3 rounded-md text-sm font-bold', isActive ? 'bg-secondary text-orange' : 'text-navy')}
                  >
                    <item.icon size={18} /> {item.label}
                  </NavLink>
                ) : (
                  <div key={item.label}>
                    <p className="px-3 pt-2 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-text-secondary">{item.label}</p>
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        onClick={() => setMostrarMas(false)}
                        className={({ isActive }) => cn('flex items-center gap-3 px-3 py-3 rounded-md text-sm font-semibold', isActive ? 'bg-secondary text-orange' : 'text-navy')}
                      >
                        <c.icon size={16} /> {c.label}
                      </NavLink>
                    ))}
                  </div>
                )
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-bold text-destructive">
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {grupoAbierto && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setGrupoAbierto(null)}>
          <div className="w-full bg-white rounded-t-lg p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow">{grupoAbierto.label}</p>
              <button onClick={() => setGrupoAbierto(null)}><X size={18} className="text-text-secondary" /></button>
            </div>
            <div className="space-y-1">
              {grupoAbierto.children.map((c) => (
                <NavLink
                  key={c.to}
                  to={c.to}
                  onClick={() => setGrupoAbierto(null)}
                  className={({ isActive }) => cn('flex items-center gap-3 px-3 py-3 rounded-md text-sm font-bold', isActive ? 'bg-secondary text-orange' : 'text-navy')}
                >
                  <c.icon size={18} /> {c.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}