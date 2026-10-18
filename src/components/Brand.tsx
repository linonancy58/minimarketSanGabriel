import { ShoppingBasket } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandMark({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-500 to-emerald-800 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]', className)}>
      <ShoppingBasket size={size} strokeWidth={2.2} />
    </span>
  )
}

export function Brand({ inverted, className }: { inverted?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark />
      <div className="leading-none">
        <p className={cn('text-[15px] font-bold tracking-tight', inverted ? 'text-white' : 'text-foreground')}>San Gabriel</p>
        <p className={cn('mt-1 text-2xs font-medium', inverted ? 'text-white/50' : 'text-muted-foreground')}>Gestión de inventarios</p>
      </div>
    </div>
  )
}
