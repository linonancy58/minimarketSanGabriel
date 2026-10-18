import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { navParaRol } from '@/lib/nav'
import { MoreHorizontal, LogOut, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_TABS = 4

const tabCls = (activo: boolean) =>
  cn(
    'relative flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
    activo ? 'text-primary' : 'text-muted-foreground'
  )

const filaCls = (activo: boolean) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
    activo ? 'bg-primary-soft text-primary' : 'text-foreground hover:bg-accent'
  )

function Hoja({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-[2px] animate-in fade-in-0 md:hidden" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl border-t border-border bg-card p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] animate-in slide-in-from-bottom-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="eyebrow">{titulo}</p>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-0.5">{children}</div>
      </div>
    </div>
  )
}

export default function BottomNav() {
  const { usuario, signOut } = useAuth()
  const navigate = useNavigate()
  const [mostrarMas, setMostrarMas] = useState(false)

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
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${principales.length + (resto.length > 0 ? 1 : 0)}, minmax(0,1fr))` }}>
          {principales.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => tabCls(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary" />}
                  <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="max-w-full truncate px-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {resto.length > 0 && (
            <button onClick={() => setMostrarMas(true)} className={tabCls(false)}>
              <MoreHorizontal size={20} strokeWidth={1.8} />
              <span>Más</span>
            </button>
          )}
        </div>
      </nav>

      {mostrarMas && (
        <Hoja titulo="Más opciones" onClose={() => setMostrarMas(false)}>
          {resto.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setMostrarMas(false)} className={({ isActive }) => filaCls(isActive)}>
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
          <div className="my-2 h-px bg-border" />
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive-soft">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </Hoja>
      )}

    </>
  )
}
