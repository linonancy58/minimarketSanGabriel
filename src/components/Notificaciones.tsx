import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Bell, BellOff, CheckCheck, Volume2, VolumeX, X } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useNotificaciones } from '@/hooks/useNotificaciones'
import { useAuth } from '@/features/auth/AuthContext'
import { cn } from '@/lib/utils'

const iconBtn =
  'relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground'

export default function Notificaciones() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const n = useNotificaciones()
  // Stock: gerente y almacenero; el cajero no tiene ese módulo, va a Salidas
  const destino = usuario?.rol === 'cajero' ? '/movimientos/salidas' : '/inventario/stock'

  // El aviso emergente se cierra solo
  useEffect(() => {
    if (n.nuevas.length === 0) return
    const t = setTimeout(n.descartarNuevas, 7000)
    return () => clearTimeout(t)
  }, [n.nuevas]) // eslint-disable-line react-hooks/exhaustive-deps

  const critica = n.nuevas.some((s) => s.estado === 'CRITICO')

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={iconBtn} title="Notificaciones" aria-label={`Notificaciones${n.noLeidas ? `, ${n.noLeidas} sin leer` : ''}`}>
            <Bell size={18} className={cn(n.nuevas.length > 0 && 'animate-[wiggle_0.6s_ease-in-out_2]')} />
            {n.noLeidas > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-card">
                {n.noLeidas > 9 ? '9+' : n.noLeidas}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[340px] p-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notificaciones</p>
              <p className="text-xs text-muted-foreground">
                {n.alertas.length === 0 ? 'Sin alertas activas' : `${n.noLeidas} sin leer · ${n.alertas.length} en total`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={n.alternarSonido}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title={n.sonido ? 'Silenciar sonido' : 'Activar sonido'}
                aria-label={n.sonido ? 'Silenciar sonido' : 'Activar sonido'}
              >
                {n.sonido ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              {n.noLeidas > 0 && (
                <button
                  onClick={n.marcarTodas}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  title="Marcar todas como leídas"
                  aria-label="Marcar todas como leídas"
                >
                  <CheckCheck size={16} />
                </button>
              )}
            </div>
          </div>
          <DropdownMenuSeparator className="mx-0 my-0" />

          <div className="max-h-[360px] overflow-y-auto p-1.5">
            {n.alertas.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-success-soft text-success">
                  <BellOff size={18} />
                </span>
                <p className="text-sm font-medium">Todo en orden</p>
                <p className="text-xs text-muted-foreground">No hay productos por debajo del stock mínimo.</p>
              </div>
            ) : (
              n.alertas.map((a) => (
                <DropdownMenuItem
                  key={a.clave}
                  onClick={() => {
                    n.marcarLeida(a.clave)
                    navigate(destino)
                  }}
                  className={cn('items-start gap-3', !a.leida && 'bg-primary-soft/50')}
                >
                  <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', a.estado === 'CRITICO' ? 'bg-destructive-soft' : 'bg-warning-soft')}>
                    <AlertTriangle size={15} className={a.estado === 'CRITICO' ? '!text-destructive' : '!text-warning'} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{a.producto_nombre}</span>
                    <span className="block text-xs text-muted-foreground">
                      {a.estado === 'CRITICO' ? 'Sin stock' : 'Stock bajo'} · <span className="num">{a.stock_actual}</span> de mín. <span className="num">{a.stock_minimo}</span>
                    </span>
                    {usuario?.rol === 'gerente' && <span className="block text-2xs text-muted-foreground/80">{a.local_nombre}</span>}
                  </span>
                  {!a.leida && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Sin leer" />}
                </DropdownMenuItem>
              ))
            )}
          </div>

          <DropdownMenuSeparator className="mx-0 my-0" />
          <div className="flex items-center justify-between px-2 py-1.5">
            <button onClick={n.probarSonido} className="rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              Probar sonido
            </button>
            {n.alertas.length > 0 && (
              <DropdownMenuItem onClick={() => navigate(destino)} className="px-2 py-1.5 text-xs font-medium text-primary">
                Ver todo
              </DropdownMenuItem>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Aviso emergente de alerta nueva */}
      {n.nuevas.length > 0 && (
        <div
          role="alert"
          className="fixed right-4 top-20 z-[60] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-xl border border-border bg-popover p-3.5 text-popover-foreground shadow-pop animate-fade-up"
        >
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', critica ? 'bg-destructive-soft text-destructive' : 'bg-warning-soft text-warning')}>
            <AlertTriangle size={17} />
          </span>
          <button
            className="min-w-0 flex-1 text-left"
            onClick={() => {
              n.descartarNuevas()
              navigate(destino)
            }}
          >
            <p className="text-sm font-semibold">
              {n.nuevas.length === 1 ? (critica ? 'Producto sin stock' : 'Stock bajo') : `${n.nuevas.length} nuevas alertas de stock`}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {n.nuevas.length === 1
                ? `${n.nuevas[0].producto_nombre} · ${n.nuevas[0].local_nombre}`
                : n.nuevas.slice(0, 3).map((s) => s.producto_nombre).join(', ')}
            </p>
          </button>
          <button onClick={n.descartarNuevas} className="rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Cerrar">
            <X size={15} />
          </button>
        </div>
      )}
    </>
  )
}
