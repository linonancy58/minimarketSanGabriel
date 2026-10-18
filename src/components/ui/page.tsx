import * as React from "react"
import { AlertCircle, CheckCircle2, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

/** Encabezado estándar de cada módulo */
export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight md:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Barra de filtros sobre tablas */
export function Toolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center", className)}>{children}</div>
}

/** Tarjeta de indicador (KPI) */
export function StatCard({
  label, value, icon: Icon, hint, tone = 'neutral',
}: {
  label: string
  value: React.ReactNode
  icon?: React.ElementType
  hint?: React.ReactNode
  tone?: 'neutral' | 'primary' | 'warning' | 'danger' | 'info'
}) {
  const toneCls = {
    neutral: 'bg-muted text-muted-foreground',
    primary: 'bg-primary-soft text-primary',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-destructive-soft text-destructive',
    info: 'bg-info-soft text-info',
  }[tone]
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card md:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', toneCls)}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight md:text-[28px]">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Estado vacío para listas y paneles */
export function EmptyState({ icon: Icon = Inbox, title, description, className }: { icon?: React.ElementType; title: string; description?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon size={20} />
      </span>
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>}
    </div>
  )
}

/** Bloque de carga (skeleton) */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

/** Mensaje en línea de error / éxito */
export function Alert({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
        tone === 'error' ? 'border-destructive/20 bg-destructive-soft text-destructive' : 'border-success/20 bg-success-soft text-success'
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
