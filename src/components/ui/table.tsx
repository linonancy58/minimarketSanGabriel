import * as React from "react"
import { cn } from "@/lib/utils"

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-card">
    <table className={cn("w-full text-sm", className)} {...props} />
  </div>
)
export const THead = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("bg-muted/60 [&_tr]:border-t-0 [&_tr:hover]:bg-transparent", className)} {...props} />
)
export const TBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />
export const TR = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-t border-border transition-colors hover:bg-muted/40", className)} {...props} />
)
export const TH = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn("h-10 whitespace-nowrap px-4 text-left text-2xs font-semibold uppercase tracking-[0.06em] text-muted-foreground", className)}
    {...props}
  />
)
export const TD = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-3 text-foreground/90", className)} {...props} />
)

/** Fila de estado vacío / cargando dentro de una tabla */
export const TEmpty = ({ colSpan, children }: { colSpan: number; children: React.ReactNode }) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-muted-foreground">{children}</td>
  </tr>
)
