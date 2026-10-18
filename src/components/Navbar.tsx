import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, LayoutGrid, HelpCircle, Camera, User, LogOut, Loader2, ChevronDown,
  Sun, Moon, Monitor, Download, Check,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useSubirAvatar } from '@/hooks/useAvatar'
import { useInstallPrompt } from '@/hooks/usePwa'
import { useTheme, Theme } from '@/lib/theme'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { InputWithIcon } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/Brand'
import { Avatar, ROL_LABEL } from '@/components/Avatar'
import Notificaciones from '@/components/Notificaciones'
import { accesosParaRol } from '@/lib/accesos'
import { cn } from '@/lib/utils'

const TEMAS: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

const iconBtn =
  'relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground'

export default function Navbar() {
  const { usuario, signOut, refrescarPerfil } = useAuth()
  const navigate = useNavigate()
  const subirAvatar = useSubirAvatar()
  const { theme, resolved, setTheme } = useTheme()
  const { disponible: puedeInstalar, instalar } = useInstallPrompt()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busqueda, setBusqueda] = useState('')

  if (!usuario) return null

  const accesos = accesosParaRol(usuario.rol)

  async function onSeleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await subirAvatar.mutateAsync(file)
    await refrescarPerfil()
    e.target.value = ''
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/85 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md md:px-6">
      <BrandMark className="h-8 w-8 md:hidden" size={16} />

      <div className="hidden max-w-md flex-1 sm:block">
        <InputWithIcon
          icon={Search}
          placeholder="Buscar productos, categorías, movimientos…"
          className="h-9 border-transparent bg-muted shadow-none hover:border-transparent focus-visible:bg-card"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && busqueda.trim()) {
              if (usuario.rol === 'gerente') navigate('/inventario/productos')
              if (usuario.rol === 'cajero') navigate('/pos')
              if (usuario.rol === 'almacenero') navigate('/inventario/stock')
            }
          }}
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {puedeInstalar && (
          <Button variant="outline" size="sm" onClick={instalar} className="mr-1 hidden sm:inline-flex">
            <Download size={14} /> Instalar app
          </Button>
        )}

        {accesos.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={iconBtn} title="Acceso rápido" aria-label="Acceso rápido">
                <LayoutGrid size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(340px,calc(100vw-2rem))] p-2">
              <DropdownMenuLabel className="eyebrow px-2 pb-2 pt-1">Acceso rápido</DropdownMenuLabel>
              <div className="grid grid-cols-2 gap-1">
                {accesos.map((a) => (
                  <DropdownMenuItem
                    key={a.to}
                    onClick={() => navigate(a.to)}
                    className="group flex-col items-start gap-2 rounded-lg p-3 [&_svg]:text-primary"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft transition-colors group-focus:bg-primary group-focus:[&_svg]:text-primary-foreground">
                      <a.icon size={16} />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[13px] font-semibold">{a.label}</span>
                      <span className="block text-2xs text-muted-foreground">{a.desc}</span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={iconBtn} title="Tema" aria-label="Cambiar tema">
              {resolved === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuLabel className="eyebrow">Apariencia</DropdownMenuLabel>
            {TEMAS.map((t) => (
              <DropdownMenuItem key={t.value} onClick={() => setTheme(t.value)}>
                <t.icon size={15} /> <span className="flex-1">{t.label}</span>
                {theme === t.value && <Check size={15} className="!text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(iconBtn, 'hidden md:flex')} title="Ayuda" aria-label="Ayuda">
              <HelpCircle size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="eyebrow">Ayuda rápida</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate('/dashboard')}>Gestionar ventas y stock</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/compras')}>Registrar un ingreso de mercadería</DropdownMenuItem>
            <DropdownMenuSeparator />
            <p className="px-2.5 py-2 text-xs text-muted-foreground">¿Necesitas más ayuda? Contacta a soporte técnico de San Gabriel.</p>
          </DropdownMenuContent>
        </DropdownMenu>

        <Notificaciones />

        <div className="mx-1 hidden h-6 w-px bg-border md:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg p-1 pr-1.5 transition-colors hover:bg-accent data-[state=open]:bg-accent md:pr-2">
              <span className="relative">
                <Avatar nombre={usuario.nombre} url={usuario.avatar_url} className="h-8 w-8 ring-0" />
                {subirAvatar.isPending && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <Loader2 className="animate-spin text-white" size={14} />
                  </span>
                )}
              </span>
              <span className="hidden text-left leading-tight lg:block">
                <span className="block text-[13px] font-semibold">{usuario.nombre.split(' ')[0]}</span>
                <span className="block text-2xs text-muted-foreground">{ROL_LABEL[usuario.rol] ?? usuario.rol}</span>
              </span>
              <ChevronDown size={14} className="hidden text-muted-foreground lg:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-3">
              <Avatar nombre={usuario.nombre} url={usuario.avatar_url} className="h-10 w-10 ring-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{usuario.nombre}</span>
                <span className="block text-xs text-muted-foreground">{ROL_LABEL[usuario.rol] ?? usuario.rol}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Camera size={15} /> Cambiar foto de perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/configuracion')}>
              <User size={15} /> Mi perfil
            </DropdownMenuItem>
            {puedeInstalar && (
              <DropdownMenuItem onClick={instalar} className="sm:hidden">
                <Download size={15} /> Instalar app
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:bg-destructive-soft [&_svg]:text-destructive">
              <LogOut size={15} /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onSeleccionarFoto} />
      </div>
    </header>
  )
}
