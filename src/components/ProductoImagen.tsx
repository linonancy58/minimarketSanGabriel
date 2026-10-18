import { useState } from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Miniatura de producto; si no tiene imagen (o falla al cargar) muestra un ícono neutro */
export function ProductoImagen({ url, nombre, className, iconSize = 18 }: { url?: string | null; nombre: string; className?: string; iconSize?: number }) {
  const [fallo, setFallo] = useState(false)
  return (
    <span className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-muted-foreground', className)}>
      {url && !fallo ? (
        <img src={url} alt={nombre} loading="lazy" className="h-full w-full object-cover" onError={() => setFallo(true)} />
      ) : (
        <Package size={iconSize} strokeWidth={1.6} />
      )}
    </span>
  )
}
