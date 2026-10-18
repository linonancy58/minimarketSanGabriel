import { cn } from '@/lib/utils'

export const ROL_LABEL: Record<string, string> = {
  gerente: 'Gerente',
  cajero: 'Cajero',
  almacenero: 'Almacenero',
}

function iniciales(nombre: string) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

export function Avatar({ nombre, url, className }: { nombre: string; url?: string | null; className?: string }) {
  return (
    <span className={cn('relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-xs font-bold text-primary ring-2 ring-background', className)}>
      {url ? <img src={url} alt={nombre} className="h-full w-full object-cover" /> : iniciales(nombre)}
    </span>
  )
}
