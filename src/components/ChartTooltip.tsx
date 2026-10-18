import { formatCurrency } from '@/lib/utils'

/** Tooltip de Recharts con el estilo del sistema. Valores en tinta de texto; el color solo en el marcador. */
export function ChartTooltip({ active, payload, label, moneda = true }: any) {
  if (!active || !payload?.length) return null
  const filas = [...payload].sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0))
  return (
    <div className="min-w-[180px] rounded-lg border border-border bg-popover px-3 py-2.5 text-popover-foreground shadow-pop">
      {label != null && <p className="mb-1.5 text-xs font-semibold">{label}</p>}
      <div className="space-y-1">
        {filas.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="flex-1 text-muted-foreground">{p.name}</span>
            <span className="num font-semibold">{moneda ? formatCurrency(Number(p.value)) : p.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Leyenda HTML compacta (identidad nunca solo por color: nombre + marcador) */
export function ChartLegend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <span key={it.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: it.color }} />
          {it.name}
        </span>
      ))}
    </div>
  )
}
