import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { inputBase } from "./input"

/** Select nativo con estilo del sistema. `className` aplica al contenedor (ancho/flex). */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("relative w-full", className)}>
      <select ref={ref} className={cn(inputBase, "appearance-none pr-9 cursor-pointer")} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
    </div>
  )
)
Select.displayName = "Select"
