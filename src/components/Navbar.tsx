import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Zap, Camera, User, LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useStockCritico } from '@/hooks/useInventario'
import { useSubirAvatar } from '@/hooks/useAvatar'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

const SALUDOS_ROL: Record<string, string> = {
  gerente: 'Panel gerencial',
  cajero: 'Punto de venta',
  almacenero: 'Gestión de inventario',
}

const ACCESOS_RAPIDOS: Record<string, { label: string; to: string }[]> = {
  gerente: [
    { label: 'Ver alertas de stock', to: '/dashboard' },
    { label: 'Nuevo producto', to: '/catalogo' },
    { label: 'Nuevo usuario', to: '/usuarios' },
  ],
  cajero: [{ label: 'Nueva venta', to: '/pos' }],
  almacenero: [{ label: 'Registrar compra', to: '/inventario' }],
}

export default function Navbar() {
  const { usuario, signOut, refrescarPerfil } = useAuth()
  const navigate = useNavigate()
  const { data: stockCritico } = useStockCritico()
  const subirAvatar = useSubirAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busqueda, setBusqueda] = useState('')

  if (!usuario) return null

  const numAlertas = usuario.rol === 'gerente' ? (stockCritico?.length ?? 0) : 0
  const accesos = ACCESOS_RAPIDOS[usuario.rol] ?? []

  async function onSeleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await subirAvatar.mutateAsync(file)
    await refrescarPerfil()
    e.target.value = ''
  }

  return (
    <header className="h-20 shrink-0 bg-card border-b border-border px-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Bienvenido de nuevo</p>
        <h2 className="text-lg font-bold text-navy leading-tight">
          {usuario.nombre} · <span className="text-orange">{SALUDOS_ROL[usuario.rol]}</span>
        </h2>
      </div>

      <div className="flex-1 max-w-md relative hidden md:block">
        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
        <Input
          placeholder="Buscar productos, ventas, usuarios..."
          className="pl-9 bg-secondary/60 border-transparent focus-visible:bg-white"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && busqueda.trim()) {
              if (usuario.rol === 'gerente') navigate('/catalogo')
              if (usuario.rol === 'cajero') navigate('/pos')
              if (usuario.rol === 'almacenero') navigate('/inventario')
            }
          }}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Acceso rápido */}
        {accesos.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="icon-btn" title="Acceso rápido">
                <Zap size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Acceso rápido
              </DropdownMenuLabel>
              {accesos.map((a) => (
                <DropdownMenuItem key={a.to} onClick={() => navigate(a.to)}>
                  <Zap size={14} className="text-orange" /> {a.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Notificaciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="icon-btn" title="Notificaciones">
              <Bell size={18} />
              {numAlertas > 0 && <span className="notif-dot">{numAlertas > 9 ? '9+' : numAlertas}</span>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Alertas de reposición
            </DropdownMenuLabel>
            {numAlertas === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">Sin alertas activas.</p>
            ) : (
              <>
                {stockCritico?.slice(0, 5).map((s: any) => (
                  <DropdownMenuItem key={`${s.id_producto}-${s.id_local}`} onClick={() => navigate('/dashboard')} className="flex-col items-start">
                    <span className="font-medium">{s.producto_nombre}</span>
                    <span className="text-xs text-muted-foreground">{s.local_nombre} · {s.estado}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="justify-center text-orange font-medium">
                  Ver todas en el dashboard
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Avatar / perfil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-orange/30 hover:border-orange transition-colors shrink-0">
              {usuario.avatar_url ? (
                <img src={usuario.avatar_url} alt={usuario.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-navy text-white flex items-center justify-center font-bold">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              {subirAvatar.isPending && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={16} />
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-semibold text-navy text-sm">{usuario.nombre}</p>
              <p className="text-xs text-muted-foreground capitalize">{usuario.rol}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Camera size={14} /> Cambiar foto de perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User size={14} /> Mi perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive hover:bg-red-50">
              <LogOut size={14} /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onSeleccionarFoto} />
      </div>
    </header>
  )
}