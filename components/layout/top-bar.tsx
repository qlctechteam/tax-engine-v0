"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { AppNotification, Company } from "@/lib/types"
import {
  Search,
  X,
  Menu,
  Briefcase,
  RefreshCw,
  Bell,
  ShieldCheck,
} from "lucide-react"

export function TopBar({
  selectedCompany,
  onSearch,
  searchResults,
  onSelectCompany,
  onClearSearch,
  searchQuery,
  setSearchQuery,
  onMenuClick,
  isGatewayConnected,
  onGatewayClick,
  notifications,
  onNotificationClick,
  onMarkNotificationRead,
}: {
  selectedCompany: Company | null
  onSearch: (q: string) => void
  searchResults: Company[]
  onSelectCompany: (c: Company) => void
  onClearSearch: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  onMenuClick: () => void
  isGatewayConnected: boolean
  onGatewayClick: () => void
  notifications: AppNotification[]
  onNotificationClick: (notification: AppNotification) => void
  onMarkNotificationRead: (id: string) => void
}) {
  const [showResults, setShowResults] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4 h-full px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Search company name or number..."
            className="pl-10 pr-10 h-10 shadow-[var(--shadow-elevation-medium)] focus-visible:shadow-[var(--shadow-elevation-high)]"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              onSearch(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("")
                onClearSearch()
                setShowResults(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showResults && searchQuery && (
            <Card className="absolute top-12 left-0 right-0 z-50 overflow-hidden shadow-[var(--shadow-elevation-high)] border-border/80">
              <ScrollArea className="max-h-64">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No companies found
                  </div>
                ) : (
                  searchResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCompany(c)
                        setSearchQuery("")
                        setShowResults(false)
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted text-left border-b border-border last:border-0"
                    >
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.number}</div>
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </Card>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selectedCompany && (
            <Badge variant="secondary" className="hidden sm:flex gap-2 py-1.5 px-3">
              <Briefcase className="h-3 w-3" />
              <span className="max-w-32 truncate">{selectedCompany.name}</span>
            </Badge>
          )}
          
          {/* Government Gateway Connection Indicator */}
          <button
            onClick={isGatewayConnected ? undefined : onGatewayClick}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              isGatewayConnected
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-default"
                : "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer"
            )}
            title={isGatewayConnected ? "Bilateral connection to Government Gateway active" : "Click to connect Government Gateway"}
          >
            {isGatewayConnected ? (
              <RefreshCw className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            )}
            <span className="hidden sm:inline">{isGatewayConnected ? "Gateway Connected" : "Gateway Offline"}</span>
            <span className="sm:hidden">{isGatewayConnected ? "Live" : "Off"}</span>
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-muted transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <Card className="absolute top-12 right-0 w-80 z-50 shadow-[var(--shadow-elevation-high)] border-border/80">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
                    {unreadCount > 0 && (
                      <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-80">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => {
                              onNotificationClick(notification)
                              setShowNotifications(false)
                            }}
                            className={cn(
                              "w-full text-left p-3 hover:bg-muted/50 transition-colors",
                              !notification.read && "bg-primary/5"
                            )}
                          >
                            <div className="flex gap-3">
                              <div className={cn(
                                "flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center",
                                notification.type === "hmrc-validation" ? "bg-emerald-500/10" : "bg-muted"
                              )}>
                                {notification.type === "hmrc-validation" ? (
                                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <Bell className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm truncate",
                                  !notification.read ? "font-medium text-foreground" : "text-muted-foreground"
                                )}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
          
          <ThemeToggle />
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
            U
          </div>
        </div>
      </div>
    </header>
  )
}
