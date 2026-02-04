"use client"

import { useState, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"
import { LoginView } from "./login-view"
import { useAuth } from "@/providers/auth-provider"
import { useApp } from "@/providers/app-provider"
import { Company } from "@/lib/types"
import { Loader2 } from "lucide-react"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, isAuthLoading, login, logout } = useAuth()
  const { 
    clientList, 
    notifications, 
    addNotification, 
    markNotificationRead,
    isGatewayConnected,
  } = useApp()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    const q = query.toLowerCase()
    const results = clientList.filter(
      (c) => c.name.toLowerCase().includes(q) || c.number.toLowerCase().includes(q)
    )
    setSearchResults(results.slice(0, 8))
  }, [clientList])

  const handleSelectCompany = useCallback((company: Company) => {
    setSelectedCompany(company)
    router.push(`/companies/${company.id}`)
  }, [router])

  const handleNotificationClick = useCallback((notification: { id: string; type: string }) => {
    markNotificationRead(notification.id)
    // Navigate to claims if it's an HMRC validation notification
    if (notification.type === "hmrc-validation") {
      router.push("/companies")
    }
  }, [markNotificationRead, router])

  const handleGatewayClick = useCallback(() => {
    router.push("/settings?tab=gateway")
  }, [router])

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show login if not authenticated
  if (!currentUser) {
    return <LoginView onLogin={login} />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPath={pathname}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        currentUser={currentUser}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          selectedCompany={selectedCompany}
          onSearch={handleSearch}
          searchResults={searchResults}
          onSelectCompany={handleSelectCompany}
          onClearSearch={() => setSearchResults([])}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setSidebarOpen(true)}
          isGatewayConnected={isGatewayConnected}
          onGatewayClick={handleGatewayClick}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkNotificationRead={markNotificationRead}
        />

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
