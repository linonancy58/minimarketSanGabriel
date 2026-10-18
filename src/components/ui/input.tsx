import * as React from "react"
import { cn } from "@/lib/utils"

export const inputBase =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/80 hover:border-muted-foreground/40 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(inputBase, className)} {...props} />
)
Input.displayName = "Input"

/** Input con ícono a la izquierda (búsquedas, formularios) */
export const InputWithIcon = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType; wrapperClassName?: string }
>(({ icon: Icon, className, wrapperClassName, ...props }, ref) => (
  <div className={cn("relative w-full", wrapperClassName)}>
    <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
    <input ref={ref} className={cn(inputBase, "pl-9", className)} {...props} />
  </div>
))
InputWithIcon.displayName = "InputWithIcon"
