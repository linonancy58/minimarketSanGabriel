import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground ring-border",
        success: "bg-success-soft text-success ring-success/20",
        warning: "bg-warning-soft text-warning ring-warning/25",
        danger: "bg-destructive-soft text-destructive ring-destructive/20",
        info: "bg-info-soft text-info ring-info/20",
        primary: "bg-primary-soft text-primary ring-primary/20",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

export function Badge({
  tone, dot, className, children,
}: VariantProps<typeof badgeVariants> & { dot?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn(badgeVariants({ tone }), className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
