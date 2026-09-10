import * as React from "react"
import { cn } from "@/lib/utils"

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto rounded-lg border border-border">
    <table className={cn("w-full text-sm", className)} {...props} />
  </div>
)
export const THead = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("bg-secondary text-navy", className)} {...props} />
)
export const TBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />
export const TR = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-t border-border hover:bg-secondary/40", className)} {...props} />
)
export const TH = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("text-left font-semibold px-4 py-2.5", className)} {...props} />
)
export const TD = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-2.5", className)} {...props} />
)
