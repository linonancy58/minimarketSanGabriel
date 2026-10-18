import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, WifiOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOnline } from '@/hooks/usePwa'

/** Avisos globales de la PWA: nueva versión disponible y modo sin conexión */
export default function PwaPrompts() {
  const online = useOnline()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Revisa si hay nueva versión cada hora
      if (registration) setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000)
    },
  })

  return (
    <>
      {!online && (
        <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-warning px-4 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))] text-xs font-semibold text-white dark:text-black">
          <WifiOff size={14} /> Sin conexión — los datos se actualizarán al reconectar
        </div>
      )}

      {needRefresh && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-popover p-3 pl-4 text-popover-foreground shadow-pop animate-fade-up md:bottom-6"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <RefreshCw size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Nueva versión disponible</p>
            <p className="text-xs text-muted-foreground">Actualiza para obtener las últimas mejoras.</p>
          </div>
          <Button size="sm" onClick={() => updateServiceWorker(true)}>Actualizar</Button>
          <button onClick={() => setNeedRefresh(false)} className="rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
      )}
    </>
  )
}
