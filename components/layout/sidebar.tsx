"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { NavItem } from "./nav-item"
import { AuthUser } from "@/lib/types"
import {
  FileSpreadsheet,
  FileText,
  Briefcase,
  Send,
  Settings,
  User,
  LogOut,
  LayoutGrid,
} from "lucide-react"

export function Sidebar({
  currentPath,
  isOpen,
  setIsOpen,
  currentUser,
  onLogout,
}: {
  currentPath: string
  isOpen: boolean
  setIsOpen: (b: boolean) => void
  currentUser: AuthUser | null
  onLogout: () => void
}) {

  const router = useRouter()

  const navItems = [
    { href: "/", label: "Home", icon: LayoutGrid },
    { href: "/claims", label: "Claims", icon: FileText },
    { href: "/companies", label: "Clients", icon: Briefcase },
    { href: "/submissions", label: "Submissions", icon: Send },
  ]

  const isActive = (href: string) => {
    if (href === "/") return currentPath === "/"
    return currentPath.startsWith(href)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 border-r border-sidebar-border bg-sidebar flex flex-col transition-transform duration-200 lg:translate-x-0 shadow-[var(--shadow-elevation-medium)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Brand */}
        <div className="p-4 border-sidebar-border">
          <a
            href="/"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-3 w-full p-2 -m-2 rounded-lg transition-all duration-150 hover:bg-sidebar-accent active:bg-sidebar-accent/80 text-sidebar-foreground"
          >
            <div className="relative h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset,var(--shadow-elevation-medium)] transition-shadow group-hover:shadow-[var(--shadow-elevation-high)]">
              <FileSpreadsheet className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <h1 className="text-base font-bold text-sidebar-foreground tracking-tight leading-tight">TaxEngine</h1>
              <p className="text-[11px] text-sidebar-muted-foreground leading-tight mt-0.5 truncate">R&D Tax Credit Infrastructure</p>
            </div>
          </a>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3">
          <p className="px-3 mb-2 text-xs font-medium text-sidebar-muted-foreground uppercase tracking-wider">Workspace</p>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavItem
                active={isActive(item.href)}
                icon={item.icon}
                label={item.label}
                onClick={() => router.push(item.href)}
                variant="sidebar"
              />
            ))}
          </div>
        </nav>

        {/* Footer with Settings and User */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/30">
          <p className="px-3 mb-2 text-xs font-medium text-sidebar-muted-foreground uppercase tracking-wider">System</p>
            <NavItem
              active={isActive("/settings")}
              icon={Settings}
              label="Settings"
              onClick={() => router.push("/settings")}
              variant="sidebar"
            />
          {/* User section with logout */}
          {currentUser && (
            <div className="mt-3 pt-3 border-t border-sidebar-border">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-sidebar-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
                  <p className="text-xs text-sidebar-muted-foreground truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm font-medium text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <span className="flex items-center justify-center h-7 w-7 rounded-md bg-sidebar-accent/50">
                  <LogOut className="h-4 w-4" />
                </span>
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
