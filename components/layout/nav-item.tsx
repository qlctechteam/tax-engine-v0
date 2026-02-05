"use client"

import { cn } from "@/lib/utils"

export function NavItem({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ElementType
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left outline-none",
        active
          ? "bg-gradient-to-b from-primary/90 to-primary text-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_-1px_0_0_rgba(0,0,0,0.15)_inset,var(--shadow-elevation-medium)]"
          : "text-muted-foreground bg-transparent hover:bg-muted hover:text-foreground hover:shadow-[var(--shadow-elevation-low)] active:bg-muted active:shadow-none"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
          active
            ? "bg-primary-foreground/15"
            : "bg-muted/60 group-hover:bg-muted"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn("tracking-tight", active && "font-semibold")}>{label}</span>
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-foreground/30 rounded-r-full" />
      )}
    </button>
  )
}
