"use client"

import { cn } from "@/lib/utils"

export function NavItem({
  active,
  icon: Icon,
  label,
  onClick,
  variant = "default",
}: {
  active: boolean
  icon: React.ElementType
  label: string
  onClick: () => void
  variant?: "default" | "sidebar"
}) {
  const isSidebar = variant === "sidebar"

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left outline-none",
        active && !isSidebar &&
          "bg-gradient-to-b from-primary/90 to-primary text-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_-1px_0_0_rgba(0,0,0,0.15)_inset,var(--shadow-elevation-medium)]",
        active && isSidebar &&
          "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_-1px_0_0_rgba(0,0,0,0.12)_inset,var(--shadow-elevation-medium)]",
        !active && !isSidebar &&
          "text-muted-foreground bg-transparent hover:bg-muted hover:text-foreground hover:shadow-[var(--shadow-elevation-low)] active:bg-muted active:shadow-none",
        !active && isSidebar &&
          "text-sidebar-muted-foreground bg-transparent hover:bg-sidebar-accent hover:text-sidebar-foreground hover:shadow-[var(--shadow-elevation-low)] active:bg-sidebar-accent/80"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
          active && !isSidebar && "bg-primary-foreground/15",
          active && isSidebar && "bg-sidebar-primary-foreground/15",
          !active && !isSidebar && "bg-muted/60 group-hover:bg-muted",
          !active && isSidebar && "bg-sidebar-accent/50 group-hover:bg-sidebar-accent"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn("tracking-tight", active && "font-semibold")}>{label}</span>
      {active && (
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full",
            !isSidebar && "bg-primary-foreground/30",
            isSidebar && "bg-sidebar-primary-foreground/40"
          )}
        />
      )}
    </button>
  )
}
