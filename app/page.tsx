"use client"

import { Switch } from "@/components/ui/switch"

import { CardDescription } from "@/components/ui/card"

import React from "react"

import { useState, useMemo, useEffect } from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  companies,
  claimsByCompany,
  submissionsByCompany,
  stages,
  getStageFromNext,
  groupCompaniesByLetter,
  users,
  rolePermissions,
  auditLog,
  templates,
  type Company,
  type Claim,
  type Submission,
  type User as UserType,
  type RolePermission,
  type AuditLogEntry,
  type Template,
} from "@/lib/data"
import {
  FileText,
  Briefcase,
  Send,
  Settings,
  Search,
  X,
  ChevronDown,
  Sun,
  Moon,
  Upload,
  ScanSearch,
  FileSpreadsheet,
  CheckCircle,
  SendHorizontal,
  Building2,
  FileUp,
  Phone,
  AlertCircle,
  Loader2,
  Menu,
  Check,
  Plus,
  User,
  Mail,
  Shield,
  Users,
  Clock,
  MoreHorizontal,
  FileOutput,
  FileBarChart,
  FileSignature,
  Receipt,
  ScrollText,
  LayoutTemplate,
  Palette,
  Key,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Monitor,
  Globe,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Lock,
  Bell,
  ShieldCheck,
  Download,
  LayoutGrid,
} from "lucide-react"

type Route = "home" | "claims" | "clients" | "client-detail" | "submissions" | "settings"

// Notification system types
interface AppNotification {
  id: string
  type: "hmrc-validation" | "general"
  title: string
  message: string
  timestamp: Date
  read: boolean
  // For navigation back to context
  claimId?: string
  companyName?: string
}

// Automatic CT600 Validation states
type HMRCValidationStatus = "pending" | "running" | "passed" | "failed"

interface HMRCValidationResult {
  status: HMRCValidationStatus
  message?: string
  timestamp?: Date
}

// Demo credentials - in production, this would be handled by a backend
const DEMO_USER = {
  email: "demo@taxengine.io",
  // This is a hash representation - in production, use bcrypt on backend
  passwordHash: "demo123",
  name: "Demo User",
}

// Simple hash check - in production, use bcrypt.compare on backend
const verifyPassword = (input: string, hash: string) => input === hash

// Auth storage keys
const AUTH_STORAGE_KEY = "taxengine_auth"

interface AuthUser {
  email: string
  name: string
}

function LoginView({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Validate inputs
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }
    if (!password) {
      setError("Please enter your password")
      return
    }

    setIsLoading(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Verify credentials
    if (email.toLowerCase() === DEMO_USER.email && verifyPassword(password, DEMO_USER.passwordHash)) {
      const user: AuthUser = { email: DEMO_USER.email, name: DEMO_USER.name }
      // Persist auth state
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      onLogin(user)
    } else {
      setError("Invalid email or password. Please try again.")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-b from-primary/90 to-primary flex items-center justify-center shadow-[var(--shadow-elevation-medium)] mb-4">
            <FileSpreadsheet className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">TaxEngine</h1>
          <p className="text-sm text-muted-foreground">R&D Tax Credit Infrastructure</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-[var(--shadow-elevation-medium)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Log in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-10 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo credentials hint */}
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Demo: demo@taxengine.io / demo123
        </p>
      </div>
    </div>
  )
}

function NavItem({
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
          : "text-muted-foreground bg-transparent hover:bg-muted/80 hover:text-foreground hover:shadow-[var(--shadow-elevation-low)] active:bg-muted active:shadow-none"
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

function Sidebar({
  route,
  setRoute,
  isOpen,
  setIsOpen,
  currentUser,
  onLogout,
}: {
  route: Route
  setRoute: (r: Route) => void
  isOpen: boolean
  setIsOpen: (b: boolean) => void
  currentUser: AuthUser | null
  onLogout: () => void
}) {
  const navItems = [
    { id: "home" as Route, label: "Home", icon: LayoutGrid },
    { id: "claims" as Route, label: "Claims", icon: FileText },
    { id: "clients" as Route, label: "Clients", icon: Briefcase },
    { id: "submissions" as Route, label: "Submissions", icon: Send },
  ]

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
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 border-r border-border bg-card flex flex-col transition-transform duration-200 lg:translate-x-0 shadow-[var(--shadow-elevation-medium)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Brand */}
        <div className="p-4 border-b border-border/60">
          <button
            onClick={() => {
              setRoute("home")
              setIsOpen(false)
            }}
            className="group flex items-center gap-3 w-full p-2 -m-2 rounded-lg transition-all duration-150 hover:bg-muted/50 active:bg-muted/70"
          >
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-b from-primary/90 to-primary flex items-center justify-center shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset,var(--shadow-elevation-medium)] transition-shadow group-hover:shadow-[var(--shadow-elevation-high)]">
              <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <h1 className="text-base font-bold text-foreground tracking-tight leading-tight">TaxEngine</h1>
              <p className="text-[11px] text-muted-foreground/80 leading-tight mt-0.5 truncate">R&D Tax Credit Infrastructure</p>
            </div>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3">
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Workspace</p>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                active={route === item.id || (route === "client-detail" && item.id === "clients")}
                icon={item.icon}
                label={item.label}
                onClick={() => {
                  setRoute(item.id)
                  setIsOpen(false)
                }}
              />
            ))}
          </div>
        </nav>

        {/* Footer with Settings and User */}
        <div className="p-3 border-t border-border bg-muted/30">
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">System</p>
          <NavItem
            active={route === "settings"}
            icon={Settings}
            label="Settings"
            onClick={() => {
              setRoute("settings")
              setIsOpen(false)
            }}
          />
          
          {/* User section with logout */}
          {currentUser && (
            <div className="mt-3 pt-3 border-t border-border/60">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <span className="flex items-center justify-center h-7 w-7 rounded-md bg-muted/60">
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

function TopBar({
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

function ClaimStages({
  currentStage,
  onStageChange,
}: {
  currentStage: number
  onStageChange: (stage: number) => void
}) {
  const icons = [Upload, ScanSearch, FileSpreadsheet, CheckCircle, SendHorizontal]

  return (
    <div className="flex flex-wrap gap-2">
      {stages.map((stage, index) => {
        const Icon = icons[index]
        const isActive = stage.id === currentStage
        const isCompleted = stage.id < currentStage

        return (
          <button
            key={stage.id}
            onClick={() => onStageChange(stage.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all border",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : isCompleted
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            )}
          >
            {isCompleted ? (
              <Check className="h-4 w-4" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{stage.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function WorkflowProgressionBar({ currentStage }: { currentStage: number }) {
  const icons = [Upload, ScanSearch, FileSpreadsheet, CheckCircle, SendHorizontal]

  return (
    <div className="w-full bg-card border border-border rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const Icon = icons[index]
          const isActive = stage.id === currentStage
          const isCompleted = stage.id < currentStage
          const isLast = index === stages.length - 1

          return (
            <div key={stage.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-20",
                    isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-all",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Claim Processor Types
type ProcessorStep = "select-year" | "scan-ct600" | "extracting" | "review-info" | "adjustments" | "final-review" | "docusign" | "submission"

type UploadedFile = {
  id: string
  name: string
  type: "ct600" | "expenditure"
  uploadedAt: string
}

type YearEnd = {
  id: string
  date: string
  label: string
  periodStart: string
  periodEnd: string
}

// Generate year ends within 2 years of today (simulating Companies House data)
function getRelevantYearEnds(): YearEnd[] {
  const today = new Date()
  const yearEnds: YearEnd[] = []
  
  // Common year end months
  const yearEndMonths = [
    { month: 2, label: "March" },
    { month: 11, label: "December" },
    { month: 8, label: "September" },
    { month: 5, label: "June" },
  ]
  
  for (const ye of yearEndMonths) {
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const year = today.getFullYear() - yearOffset
      const yearEndDate = new Date(year, ye.month, ye.month === 2 ? 31 : ye.month === 11 ? 31 : ye.month === 8 ? 30 : 30)
      const twoYearsAgo = new Date(today)
      twoYearsAgo.setFullYear(today.getFullYear() - 2)
      
      if (yearEndDate >= twoYearsAgo && yearEndDate <= today) {
        const periodStart = new Date(yearEndDate)
        periodStart.setFullYear(periodStart.getFullYear() - 1)
        periodStart.setDate(periodStart.getDate() + 1)
        
        yearEnds.push({
          id: `ye-${ye.label.toLowerCase()}-${year}`,
          date: yearEndDate.toISOString(),
          label: `${ye.label} ${year}`,
          periodStart: periodStart.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          periodEnd: yearEndDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        })
      }
    }
  }
  
  return yearEnds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Claim Processor Component
function ClaimProcessor({
  company,
  yearEnd,
  onClose,
  onAddNotification,
  }: {
  company: Company
  yearEnd: YearEnd
  onClose: () => void
  onAddNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void
  }) {
  const [currentStep, setCurrentStep] = useState<ProcessorStep>("scan-ct600")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState(0)
  
  // Automatic CT600 Validation state
  const [hmrcValidation, setHmrcValidation] = useState<HMRCValidationResult>({ status: "pending" })
  
  // Auto-run HMRC validation when entering final-review step
  useEffect(() => {
    if (currentStep === "final-review" && hmrcValidation.status === "pending") {
      // Start validation automatically
      setHmrcValidation({ status: "running" })
      
      // Simulate HMRC validation (5-8 seconds)
      const duration = 5000 + Math.random() * 3000
      const timeoutId = setTimeout(() => {
        const passed = Math.random() > 0.2 // 80% pass rate for demo
        const result: HMRCValidationResult = {
          status: passed ? "passed" : "failed",
          message: passed 
            ? "CT600 validated successfully against HMRC systems" 
            : "Minor formatting issues detected in Box 145. Please review the R&D expenditure figures.",
          timestamp: new Date()
        }
        setHmrcValidation(result)
        // Send notification
        onAddNotification({
          type: "hmrc-validation",
          title: passed ? "HMRC Validation Passed" : "HMRC Validation: Issues Detected",
          message: `${company.name} - ${yearEnd.label}`,
          companyName: company.name,
          claimId: `${company.id}-${yearEnd.id}`
        })
      }, duration)
      
      return () => clearTimeout(timeoutId)
    }
  }, [currentStep, hmrcValidation.status, company.name, company.id, yearEnd.label, yearEnd.id, onAddNotification])
  
  // CT600 extracted data (simulated)
const [ct600Data, setCt600Data] = useState({
    // Company Information
    companyName: "WEST ARCHITECTURE LIMITED",
    companyNumber: "05883052",
    utr: "6475619864",
    accountingPeriodStart: "01 Aug 2023",
    accountingPeriodEnd: "31 Jul 2024",
    
    // Type of Return (Boxes 40-75)
    box40_newCompany: "X",
    box90_reasonForAmendment: "Amendment - a/cs already submitted",
    box142_smeScheme: "X",
    
    // Turnover & Income (Boxes 145-235)
    box145_turnover: "50,043",
    box150_otherIncome: "0",
    box155_tradingIncome: "0",
    box160_tradingLosses: "0",
    box165_netTradingProfits: "0",
    box170_numberOf51PercentGroupCompanies: "8",
    box175_bankBuildingSocietyInterest: "0",
    box180_annualPaymentsNotTaxed: "0",
    box185_nonExemptDividends: "0",
    box190_incomeFromProperty: "1,447",
    box195_nonTradingGainsChargeable: "0",
    box200_grossChargableGains: "0",
    box205_allowableLosses: "0",
    box210_netChargableGains: "0",
    box215_incomeFromNonUKResidentCompany: "0",
    box220_tonageTaxProfits: "0",
    box225_incomeNotIncludedElsewhere: "0",
    box230_chargeableGains: "0",
    box235_profitsBeforeChargesAndGroupRelief: "1,455",
    
    // Deductions (Boxes 240-275)
    box240_lossesOnUnquotedShares: "0",
    box245_managementExpenses: "0",
    box250_ukPropertyBusinessLosses: "0",
    box255_capitalAllowances: "0",
    box260_nonTradeDeficits: "0",
    box263_tradingLosses: "0",
    box265_nonTradeLosses: "0",
    box275_profitsChargeableToCT: "1,455",
    
    // Reliefs & Deductions (Boxes 285-320)
    box285_charitablePayments: "0",
    box290_groupReliefClaimed: "0",
    box295_profitsChargeableAfterRelief: "1,455",
    box300_ringFenceProfits: "0",
    box305_northernIrelandProfits: "0",
    box310_patentBoxProfits: "0",
    box315_lossesBroughtForward: "0",
    box320_lossesCarriedBack: "0",
    
    // Tax Calculation FY1 (Boxes 330-345)
    box329_marginalRelief: "X",
    box330_financialYear1: "2023",
    box335_fy1Profit: "0.00",
    box340_fy1TaxRate: "25",
    box345_fy1TaxDue: "0.00",
    
    // Tax Calculation FY2 (Boxes 380-395)
    box380_financialYear2: "2024",
    box385_fy2Profit: "0.00",
    box390_fy2TaxRate: "25",
    box395_fy2TaxDue: "0.00",
    
    // Corporation Tax Chargeable (Boxes 430-475)
    box430_ctChargeableOnProfits: "0.00",
    box435_marginalReliefForRingFence: "0.00",
    box440_ctChargeableAfterMarginalRelief: "0.00",
    box470_totalCtLiability: "0.00",
    box475_ctPayable: "0.00",
    
    // Tax Reconciliation (Boxes 510-605)
    box510_incomeTaxDeductedFromGrossIncome: "0.00",
    box515_incomeTaxRepayable: "0.00",
    box520_ctPayable: "0.00",
    box525_selfAssessmentOfCtPayable: "0.00",
    box590_taxPayable: "0.00",
    box595_taxChargeable: "1,820.77",
    box600_taxAlreadyPaid: "0.00",
    box605_taxOutstanding: "1,820.77",
    
    // R&D Enhanced Expenditure (Boxes 650-705)
    box650_rdClaimMade: "X",
    box657_smeScheme: "X",
    box659_qualifyingExpenditure: "12,444",
    box660_enhancedExpenditure: "23,146",
    box665_enhancedExpenditureSme: "0",
    box670_totalEnhancedExpenditure: "23,146",
    box675_rAndDNotionalTax: "0",
    box680_surrenderedLossAmount: "0",
    box685_payableRDTaxCredit: "0",
    box690_rdTaxCreditDue: "852",
    box695_rDecTaxCredit: "0",
    box700_rDecPayable: "0",
    box705_totalRDReliefClaimed: "852",
    
    // Additional R&D boxes
    box710_rdecNotionalTax: "0",
    box715_rdecSteppedUp: "0",
    box720_rdecNetOfTax: "0",
    box725_rdecPayableTax: "0",
    box730_rdecSetOffCT: "0",
    
    // Tax Payable/Repayable (Boxes 780-900)
    box780_lossesCarriedBackToClaim: "2,574",
    box865_netCtPayable: "1,820.77",
    box870_taxRepayable: "0.00",
    box875_taxPayableThisPeriod: "111.90",
    box880_marginalReliefDeducted: "0.00",
    
    // Payment Details
    box920_bankName: "BARCLAYS BANK PLC",
    box925_sortCode: "203593",
    box930_accountNumber: "70951358",
    box935_accountName: "WEST ARCHITECTURE LIMITED",
    
    // Declaration
    box975_declarationName: "Graham Rodney West",
    box985_declarationStatus: "Director",
    
    // CT600L R&D Fields
    ct600l_L166_rdQualifyingExpenditure: "12,444",
    ct600l_L167_smeRdRelief: "X",
    ct600l_L170_enhancedExpenditure: "111.90",
    ct600l_L180_totalEnhancedExpenditure: "111.90",
    
    // Adjustment Info
    claimType: "SME",
    ct600Outcome: "LOSS",
    preRDTax: "1,820.77",
    postRDTax: "0.00",
    rdEnhancement: "10,702.03",
    surrenderableLoss: "1,119.03",
    ctRechargeable: "1,820.77",
    payableTaxCredit: "111.90",
  })
  
  // Adjustments data
  const [adjustments, setAdjustments] = useState({
    preRDTaxableProfit: "342,500",
    rdEnhancedExpenditure: "31,250",
    lossesBroughtForward: "",
    customAdjustment: "",
    customAdjustmentNote: "",
    postRDTaxableProfit: "311,250",
  })
  
  const [tradingLosses, setTradingLosses] = useState({
    surrenderedLossesForCredit: { before: "0", after: "0", overwrite: false },
    lossesArising: { before: "0", after: "31,250", overwrite: false },
    lossesUtilised: { before: "0", after: "0", overwrite: false },
    lossesCarriedBack: { before: "0", after: "0", overwrite: false },
    lossesCarriedForward: { before: "0", after: "31,250", overwrite: false },
    preservedLosses: { before: "0", after: "0", overwrite: false },
  })

  // DocuSign state
  const [docuSignSent, setDocuSignSent] = useState(false)
  const [estimateEmailSent, setEstimateEmailSent] = useState(false)
  const [reviewerEmail, setReviewerEmail] = useState("")

  const processorSteps = [
    { id: "scan-ct600", label: "1. Scan CT600", description: "Upload and scan documents" },
    { id: "review-info", label: "2. Review", description: "Verify extracted data" },
    { id: "adjustments", label: "3. Adjustments", description: "Configure R&D adjustments" },
    { id: "final-review", label: "4. Final Review", description: "Review all documents" },
    { id: "docusign", label: "5. DocuSign", description: "Issue documents" },
    { id: "submission", label: "6. Submit", description: "Submit to HMRC" },
  ]

  const currentStepIndex = processorSteps.findIndex(s => s.id === currentStep)

  const handleFileUpload = (type: "ct600" | "expenditure") => {
    const newFile: UploadedFile = {
      id: `file-${Date.now()}`,
      name: type === "ct600" ? `CT600_${company.name.replace(/\s/g, "_")}_${yearEnd.label.replace(/\s/g, "_")}.pdf` : `QualifyingExpenditure_${yearEnd.label.replace(/\s/g, "_")}.xlsx`,
      type,
      uploadedAt: new Date().toLocaleString("en-GB"),
    }
    setUploadedFiles(prev => [...prev, newFile])
  }

const handleReadDocuments = () => {
  setIsProcessing(true)
  setExtractionProgress(0)
  // Transition to extracting view immediately
  setCurrentStep("extracting")
  }
  
  // Animate extraction progress when in extracting step
  useEffect(() => {
    if (currentStep !== "extracting") return
    
    // Animate progress from 0 to 100 over ~3 seconds
    const duration = 3000
    const interval = 50 // Update every 50ms
    const steps = duration / interval
    const increment = 100 / steps
    
    const timer = setInterval(() => {
      setExtractionProgress(prev => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          // Transition to review after reaching 100%
          setTimeout(() => {
            setIsProcessing(false)
            setCurrentStep("review-info")
          }, 300) // Small delay to show 100%
          return 100
        }
        return next
      })
    }, interval)
    
    return () => clearInterval(timer)
  }, [currentStep])

  const handleSendForReview = () => {
    if (reviewerEmail) {
      // Simulate sending email
      setReviewerEmail("")
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">{company.name}</h1>
              <p className="text-sm text-muted-foreground">Year End: {yearEnd.label} ({yearEnd.periodStart} - {yearEnd.periodEnd})</p>
            </div>
          </div>
          <Badge className="bg-emerald-500 hover:bg-emerald-600">Processing</Badge>
        </div>
        
        {/* Step Progress */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {processorSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => index <= currentStepIndex && setCurrentStep(step.id as ProcessorStep)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                    step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : index < currentStepIndex
                      ? "bg-emerald-500/10 text-emerald-600 cursor-pointer hover:bg-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  )}
                  disabled={index > currentStepIndex}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                  )}
                  {step.label}
                </button>
                {index < processorSteps.length - 1 && (
                  <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg] mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6" style={{ height: "calc(100vh - 140px)" }}>
        {/* Step 1: Scan CT600 */}
        {currentStep === "scan-ct600" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Scan CT600</h2>
              <p className="text-muted-foreground">Upload your CT600 PDF and qualifying expenditure report for {yearEnd.label}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    CT600 Document
                  </CardTitle>
                  <CardDescription>Upload the CT600 PDF for this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleFileUpload("ct600")}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Click to upload CT600 PDF</p>
                    <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                    Qualifying Expenditure
                  </CardTitle>
                  <CardDescription>Upload the Excel expenditure report</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleFileUpload("expenditure")}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Click to upload Excel file</p>
                    <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {uploadedFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles(prev => [...prev, file.id])
                            } else {
                              setSelectedFiles(prev => prev.filter(id => id !== file.id))
                            }
                          }}
                          className="h-4 w-4 rounded border-border"
                        />
                        {file.type === "ct600" ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">Uploaded: {file.uploadedAt}</p>
                        </div>
                        <Badge variant="secondary">{file.type === "ct600" ? "CT600" : "Expenditure"}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={uploadedFiles.length === 0 || isProcessing}
                onClick={handleReadDocuments}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Reading Documents...
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-5 w-5 mr-2" />
                    Read Documents
                  </>
                )}
              </Button>
            </div>
          </div>
)}
  
  {/* Extracting Loading Screen */}
  {currentStep === "extracting" && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
  <div className="w-full max-w-md mx-auto px-6">
    <Card className="shadow-[var(--shadow-elevation-high)] border-border">
      <CardContent className="pt-8 pb-8 px-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-b from-primary/90 to-primary flex items-center justify-center shadow-[var(--shadow-elevation-medium)]">
            <FileSpreadsheet className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        
        {/* Headline */}
        <h2 className="text-xl font-bold text-foreground text-center tracking-tight mb-2">
          Extracting CT600
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Reading and preparing your dataset for review
        </p>
        
{/* Progress bar */}
  <div className="space-y-2 mb-6">
  <div className="relative h-2.5 w-full bg-muted rounded-full overflow-hidden">
  <div 
    className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
    style={{ width: `${extractionProgress}%` }} 
  />
  </div>
  <p className="text-sm font-medium text-foreground text-center tabular-nums">
    {Math.round(extractionProgress)}%
  </p>
  </div>
        
        {/* Instruction */}
        <p className="text-xs text-muted-foreground text-center">
          Please do not refresh or navigate away from this page.
        </p>
        
        {/* Contextual note */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
            We are scanning your CT600 document and extracting R&D qualifying expenditure data. This typically takes a few moments.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
  </div>
  )}
  
  {/* Step 2: Review Information */}
  {currentStep === "review-info" && (
  <div className="space-y-4">
  <div className="flex items-center justify-between">
  <div>
  <h2 className="text-xl font-bold text-foreground">Review CT600</h2>
  <p className="text-sm text-muted-foreground">Verify OCR extracted values against the uploaded document</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500 hover:bg-emerald-600">{ct600Data.claimType}</Badge>
                <Badge variant="outline">{ct600Data.ct600Outcome}</Badge>
              </div>
            </div>

            <div className="grid lg:grid-cols-[400px_1fr] gap-4">
              {/* Left - Box List */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">CT600 Boxes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-4 space-y-1">
                      {[
                        { box: "145", key: "box145_turnover" },
                        { box: "150", key: "box150_otherIncome" },
                        { box: "155", key: "box155_tradingIncome" },
                        { box: "160", key: "box160_tradingLosses" },
                        { box: "165", key: "box165_netTradingProfits" },
                        { box: "170", key: "box170_numberOf51PercentGroupCompanies" },
                        { box: "175", key: "box175_bankBuildingSocietyInterest" },
                        { box: "180", key: "box180_annualPaymentsNotTaxed" },
                        { box: "185", key: "box185_nonExemptDividends" },
                        { box: "190", key: "box190_incomeFromProperty" },
                        { box: "195", key: "box195_nonTradingGainsChargeable" },
                        { box: "200", key: "box200_grossChargableGains" },
                        { box: "205", key: "box205_allowableLosses" },
                        { box: "210", key: "box210_netChargableGains" },
                        { box: "215", key: "box215_incomeFromNonUKResidentCompany" },
                        { box: "220", key: "box220_tonageTaxProfits" },
                        { box: "225", key: "box225_incomeNotIncludedElsewhere" },
                        { box: "230", key: "box230_chargeableGains" },
                        { box: "235", key: "box235_profitsBeforeChargesAndGroupRelief" },
                        { box: "240", key: "box240_lossesOnUnquotedShares" },
                        { box: "245", key: "box245_managementExpenses" },
                        { box: "250", key: "box250_ukPropertyBusinessLosses" },
                        { box: "255", key: "box255_capitalAllowances" },
                        { box: "260", key: "box260_nonTradeDeficits" },
                        { box: "263", key: "box263_tradingLosses" },
                        { box: "265", key: "box265_nonTradeLosses" },
                        { box: "275", key: "box275_profitsChargeableToCT" },
                        { box: "285", key: "box285_charitablePayments" },
                        { box: "290", key: "box290_groupReliefClaimed" },
                        { box: "295", key: "box295_profitsChargeableAfterRelief" },
                        { box: "300", key: "box300_ringFenceProfits" },
                        { box: "305", key: "box305_northernIrelandProfits" },
                        { box: "310", key: "box310_patentBoxProfits" },
                        { box: "315", key: "box315_lossesBroughtForward" },
                        { box: "320", key: "box320_lossesCarriedBack" },
                        { box: "330", key: "box330_financialYear1" },
                        { box: "335", key: "box335_fy1Profit" },
                        { box: "340", key: "box340_fy1TaxRate" },
                        { box: "345", key: "box345_fy1TaxDue" },
                        { box: "380", key: "box380_financialYear2" },
                        { box: "385", key: "box385_fy2Profit" },
                        { box: "390", key: "box390_fy2TaxRate" },
                        { box: "395", key: "box395_fy2TaxDue" },
                        { box: "430", key: "box430_ctChargeableOnProfits" },
                        { box: "435", key: "box435_marginalReliefForRingFence" },
                        { box: "440", key: "box440_ctChargeableAfterMarginalRelief" },
                        { box: "470", key: "box470_totalCtLiability" },
                        { box: "475", key: "box475_ctPayable" },
                        { box: "510", key: "box510_incomeTaxDeductedFromGrossIncome" },
                        { box: "515", key: "box515_incomeTaxRepayable" },
                        { box: "520", key: "box520_ctPayable" },
                        { box: "525", key: "box525_selfAssessmentOfCtPayable" },
                        { box: "590", key: "box590_taxPayable" },
                        { box: "595", key: "box595_taxChargeable" },
                        { box: "600", key: "box600_taxAlreadyPaid" },
                        { box: "605", key: "box605_taxOutstanding" },
                        { box: "659", key: "box659_qualifyingExpenditure" },
                        { box: "660", key: "box660_enhancedExpenditure" },
                        { box: "665", key: "box665_enhancedExpenditureSme" },
                        { box: "670", key: "box670_totalEnhancedExpenditure" },
                        { box: "675", key: "box675_rAndDNotionalTax" },
                        { box: "680", key: "box680_surrenderedLossAmount" },
                        { box: "685", key: "box685_payableRDTaxCredit" },
                        { box: "690", key: "box690_rdTaxCreditDue" },
                        { box: "695", key: "box695_rDecTaxCredit" },
                        { box: "700", key: "box700_rDecPayable" },
                        { box: "705", key: "box705_totalRDReliefClaimed" },
                        { box: "710", key: "box710_rdecNotionalTax" },
                        { box: "715", key: "box715_rdecSteppedUp" },
                        { box: "720", key: "box720_rdecNetOfTax" },
                        { box: "725", key: "box725_rdecPayableTax" },
                        { box: "730", key: "box730_rdecSetOffCT" },
                        { box: "780", key: "box780_lossesCarriedBackToClaim" },
                        { box: "865", key: "box865_netCtPayable" },
                        { box: "870", key: "box870_taxRepayable" },
                        { box: "875", key: "box875_taxPayableThisPeriod" },
                        { box: "880", key: "box880_marginalReliefDeducted" },
                      ].map((item) => (
                        <div key={item.box} className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded w-12 text-center text-muted-foreground">{item.box}</span>
                          <Input
                            value={ct600Data[item.key as keyof typeof ct600Data] || ""}
                            onChange={(e) => setCt600Data(prev => ({ ...prev, [item.key]: e.target.value }))}
                            className="h-8 font-mono text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Right - PDF Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">CT600 Document</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] bg-muted/30 rounded-b-lg">
                    {uploadedFiles.find(f => f.type === "ct600") ? (
                      <iframe
                        src="/placeholder-ct600.pdf"
                        className="w-full h-full rounded-b-lg"
                        title="CT600 Document Preview"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center p-8">
                          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="font-medium text-foreground">No CT600 Uploaded</p>
                          <p className="text-sm text-muted-foreground mt-1">Upload a CT600 PDF in the previous step</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setCurrentStep("scan-ct600")}>
                Back
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setCurrentStep("adjustments")}>
                Confirm & Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Adjustments */}
        {currentStep === "adjustments" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">R&D Adjustments</h2>
              <p className="text-muted-foreground">Configure adjustments to taxable profit and trading losses</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Adjustment to Taxable Profit */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Adjustment to Taxable Profit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Pre-R&D Taxable Profit/Loss</Label>
                    <Input value={`£${adjustments.preRDTaxableProfit}`} readOnly className="bg-muted/50 font-mono" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">R&D Enhanced Expenditure (25%)</Label>
                    <Input value={`£${adjustments.rdEnhancedExpenditure}`} readOnly className="bg-muted/50 font-mono" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Losses Brought Forward</Label>
                    <Input
                      value={adjustments.lossesBroughtForward}
                      onChange={(e) => setAdjustments(prev => ({ ...prev, lossesBroughtForward: e.target.value }))}
                      placeholder="Enter amount..."
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Custom Adjustment</Label>
                    <Input
                      value={adjustments.customAdjustment}
                      onChange={(e) => setAdjustments(prev => ({ ...prev, customAdjustment: e.target.value }))}
                      placeholder="Enter amount..."
                      className="font-mono"
                    />
                    <Input
                      value={adjustments.customAdjustmentNote}
                      onChange={(e) => setAdjustments(prev => ({ ...prev, customAdjustmentNote: e.target.value }))}
                      placeholder="Note (optional)"
                      className="mt-1.5 text-sm"
                    />
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-semibold">Post-R&D Taxable Profit/Loss</Label>
                      <Input value={`£${adjustments.postRDTaxableProfit}`} readOnly className="bg-emerald-500/10 font-mono font-bold text-emerald-600 border-emerald-500/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Losses Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trading Losses Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="grid grid-cols-[1fr_100px_100px_50px] gap-2 p-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b border-border">
                      <span>Item</span>
                      <span className="text-right">Before R&D</span>
                      <span className="text-right">After R&D</span>
                      <span className="text-center">Edit</span>
                    </div>
                    
                    {Object.entries(tradingLosses).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        surrenderedLossesForCredit: "Surrendered for Credit",
                        lossesArising: "Losses Arising",
                        lossesUtilised: "Losses Utilised",
                        lossesCarriedBack: "Carried Back",
                        lossesCarriedForward: "Carried Forward",
                        preservedLosses: "Preserved Losses",
                      }
                      return (
                        <div key={key} className="grid grid-cols-[1fr_100px_100px_50px] gap-2 p-3 items-center border-b border-border last:border-0 text-sm">
                          <span className="text-foreground">{labels[key]}</span>
                          <span className="text-right font-mono text-muted-foreground">£{value.before}</span>
                          <Input
                            value={value.overwrite ? value.after : `£${value.after}`}
                            onChange={(e) => {
                              if (value.overwrite) {
                                setTradingLosses(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key as keyof typeof prev], after: e.target.value }
                                }))
                              }
                            }}
                            readOnly={!value.overwrite}
                            className={cn(
                              "h-8 text-right font-mono text-sm",
                              !value.overwrite && "bg-muted/50"
                            )}
                          />
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={value.overwrite}
                              onChange={(e) => {
                                setTradingLosses(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key as keyof typeof prev], overwrite: e.target.checked }
                                }))
                              }}
                              className="h-4 w-4 rounded border-border"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("review-info")}>
                Back
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setCurrentStep("final-review")}>
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Final Review */}
        {currentStep === "final-review" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Final Review</h2>
                <p className="text-muted-foreground">Review all documents before proceeding</p>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Send for Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send for Review</DialogTitle>
                      <DialogDescription>Send this claim to a team member for review</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Reviewer Email</Label>
                        <Input
                          type="email"
                          placeholder="colleague@company.com"
                          value={reviewerEmail}
                          onChange={(e) => setReviewerEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSendForReview}>Send Review Request</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">CT600 Document</CardTitle>
                    <Button variant="outline" size="sm">Edit CT600</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                    <div className="text-center p-4">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">CT600 Preview</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Amendment Summary</CardTitle>
                    <Button variant="outline" size="sm">Edit Summary</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                    <div className="text-center p-4">
                      <FileBarChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Amendment Summary</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Expenditure Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                    <div className="text-center p-4">
                      <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Expenditure Report</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

{/* Automatic CT600 Validation */}
  <Card className={cn(
    "border-border transition-all duration-300",
    (hmrcValidation.status === "running" || hmrcValidation.status === "pending") && "ring-2 ring-amber-500/30 border-amber-500/40"
  )}>
  <CardHeader className="pb-3">
  <div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
  <div className={cn(
  "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
  hmrcValidation.status === "passed" && "bg-emerald-500/10",
  hmrcValidation.status === "failed" && "bg-destructive/10",
  (hmrcValidation.status === "running" || hmrcValidation.status === "pending") && "bg-amber-500/15"
  )}>
  {(hmrcValidation.status === "running" || hmrcValidation.status === "pending") ? (
  <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
  ) : hmrcValidation.status === "passed" ? (
  <ShieldCheck className="h-5 w-5 text-emerald-600" />
  ) : (
  <AlertCircle className="h-5 w-5 text-destructive" />
  )}
  </div>
  <div>
  <CardTitle className="text-base">Automatic CT600 Validation</CardTitle>
  <p className="text-xs text-muted-foreground mt-0.5">
  Validates CT600 compatibility with HMRC systems
  </p>
  </div>
  </div>
  
  {/* Status indicator */}
  <Badge 
  variant="outline" 
  className={cn(
  "text-xs font-medium",
  hmrcValidation.status === "passed" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  hmrcValidation.status === "failed" && "bg-destructive/10 text-destructive border-destructive/20",
  hmrcValidation.status === "pending" && "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse",
  hmrcValidation.status === "running" && "bg-amber-500/10 text-amber-600 border-amber-500/20"
  )}
  >
  {hmrcValidation.status === "pending" && "Queued"}
  {hmrcValidation.status === "running" && "Validating..."}
  {hmrcValidation.status === "passed" && "Passed"}
  {hmrcValidation.status === "failed" && "Failed"}
  </Badge>
  </div>
  </CardHeader>
  <CardContent className="pt-0">
  {hmrcValidation.status === "pending" && (
  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
  <div className="flex items-center gap-3">
  <div className="relative flex-shrink-0">
    <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
  </div>
  <div>
  <p className="text-sm font-medium text-foreground">Preparing validation...</p>
  <p className="text-xs text-muted-foreground mt-0.5">
  Validation will start automatically in a moment.
  </p>
  </div>
  </div>
  </div>
  )}
  
  {hmrcValidation.status === "running" && (
  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
  <div className="flex items-center gap-3">
  <div className="relative flex-shrink-0">
    <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
  </div>
  <div className="flex-1 min-w-0">
  <p className="text-sm font-medium text-foreground">Validating with HMRC...</p>
  <p className="text-xs text-muted-foreground mt-0.5">
  This may take a few moments. You can leave this page and we will notify you when complete.
  </p>
  <div className="mt-3 h-1.5 w-full bg-amber-500/10 rounded-full overflow-hidden">
    <div className="h-full bg-amber-500 rounded-full animate-[progress-indeterminate_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
  </div>
  </div>
  </div>
  </div>
  )}
                
                {hmrcValidation.status === "passed" && (
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Validation Passed</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{hmrcValidation.message}</p>
                        {hmrcValidation.timestamp && (
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Completed {new Date(hmrcValidation.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {hmrcValidation.status === "failed" && (
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Validation Failed</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{hmrcValidation.message}</p>
                        {hmrcValidation.timestamp && (
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Checked {new Date(hmrcValidation.timestamp).toLocaleString()}
                          </p>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 bg-transparent"
                          onClick={() => setHmrcValidation({ status: "pending" })}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Re-run Validation
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground/70 mt-3">
                  Note: This is a validation check only, not the final submission to HMRC.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("adjustments")}>
                Back
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setCurrentStep("docusign")}>
                Proceed to DocuSign
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: DocuSign */}
        {currentStep === "docusign" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Issue Documents</h2>
              <p className="text-muted-foreground">Send documents via DocuSign and email estimate to client</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSignature className="h-5 w-5 text-primary" />
                  DocuSign Documents
                </CardTitle>
                <CardDescription>Send the claim documents for digital signature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">R&D Claim Documentation Pack</p>
                      <p className="text-sm text-muted-foreground">Includes CT600 amendment and supporting documents</p>
                    </div>
                  </div>
                  {docuSignSent ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">
                      <Check className="h-3 w-3 mr-1" />
                      Sent
                    </Badge>
                  ) : (
                    <Button onClick={() => setDocuSignSent(true)}>
                      <SendHorizontal className="h-4 w-4 mr-2" />
                      Send via DocuSign
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Client Estimate Email
                </CardTitle>
                <CardDescription>Send the R&D tax credit estimate to the client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Recipient</Label>
                    <Input value={company.contactEmail || ""} readOnly className="bg-muted/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Estimated Credit</Label>
                    <Input value="£31,250" readOnly className="bg-muted/50 font-mono" />
                  </div>
                </div>

                <div className="flex justify-end">
                  {estimateEmailSent ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">
                      <Check className="h-3 w-3 mr-1" />
                      Email Sent
                    </Badge>
                  ) : (
                    <Button variant="outline" onClick={() => setEstimateEmailSent(true)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Estimate Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("final-review")}>
                Back
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setCurrentStep("submission")}
                disabled={!docuSignSent}
              >
                Continue to Submission
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Submission */}
        {currentStep === "submission" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Submit to HMRC</h2>
              <p className="text-muted-foreground">Final submission of the R&D claim via Government Gateway</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Ready for Submission</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      All documents have been prepared and signed. Click below to submit to HMRC.
                    </p>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <dl className="grid grid-cols-2 gap-4 text-sm text-left">
                      <div>
                        <dt className="text-muted-foreground">Company</dt>
                        <dd className="font-medium text-foreground">{company.name}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">UTR</dt>
                        <dd className="font-medium text-foreground">{company.utr}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Period</dt>
                        <dd className="font-medium text-foreground">{yearEnd.periodStart} - {yearEnd.periodEnd}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Estimated Credit</dt>
                        <dd className="font-medium text-emerald-600">£31,250</dd>
                      </div>
                    </dl>
                  </div>

                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 mt-4" onClick={onClose}>
                    <Send className="h-5 w-5 mr-2" />
                    Submit to HMRC
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("docusign")}>
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// HomeView - Navigation hub / Dashboard (NOT a working view)
function HomeView({
  setRoute,
  clientList,
}: {
  setRoute: (r: Route) => void
  clientList: Company[]
}) {
  // Navigation card component
  const NavCard = ({ 
    icon: Icon, 
    title, 
    description, 
    count, 
    countLabel,
    onClick 
  }: { 
    icon: React.ElementType
    title: string
    description: string
    count?: number
    countLabel?: string
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      className="group relative flex flex-col p-5 rounded-xl border border-border bg-card text-left transition-all duration-150 shadow-[var(--shadow-elevation-low)] hover:shadow-[var(--shadow-elevation-medium)] hover:border-border/80 hover:bg-muted/30 active:shadow-[var(--shadow-elevation-low)] active:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted/80 transition-colors group-hover:bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        {count !== undefined && (
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground tabular-nums">{count}</p>
            <p className="text-xs text-muted-foreground">{countLabel}</p>
          </div>
        )}
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-all duration-150 group-hover:text-muted-foreground group-hover:translate-x-0.5" />
    </button>
  )

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">TaxEngine</h1>
        <p className="text-muted-foreground">R&D Tax Credit Infrastructure</p>
      </div>

      {/* Primary CTA - Start Claim (routes to Claims page) */}
      <div className="mb-12 flex justify-center">
        <Button
          size="lg"
          className="group h-12 px-8 text-base tracking-tight text-primary-foreground font-bold rounded-xl border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary animate-cta-breathe hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
          onClick={() => setRoute("claims")}
        >
          <span>Start Claim</span>
          <ChevronRight className="h-5 w-5 ml-2 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Button>
      </div>

      {/* Navigation Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <NavCard
          icon={FileText}
          title="Claims"
          description="Process and manage R&D claims"
          count={7}
          countLabel="active"
          onClick={() => setRoute("claims")}
        />
        <NavCard
          icon={Briefcase}
          title="Clients"
          description="View and manage client records"
          count={clientList.length}
          countLabel="total"
          onClick={() => setRoute("clients")}
        />
        <NavCard
          icon={Send}
          title="Submissions"
          description="Track HMRC submissions"
          count={3}
          countLabel="pending"
          onClick={() => setRoute("submissions")}
        />
      </div>
    </div>
  )
}

// ClaimsView - Active claim management (working view)
function ClaimsView({
  selectedCompany,
  onSelectCompany,
  clientList,
  onAddClient,
  onAddNotification,
  }: {
  selectedCompany: Company | null
  onSelectCompany: (c: Company) => void
  clientList: Company[]
  onAddClient: (client: Company) => void
  onAddNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void
  }) {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [currentStage, setCurrentStage] = useState(1)
  
  // Start Claim Dialog State
  const [startClaimOpen, setStartClaimOpen] = useState(false)
  const [selectedClientForClaim, setSelectedClientForClaim] = useState<Company | null>(null)
  const [showYearEndSelection, setShowYearEndSelection] = useState(false)
  const [selectedYearEnd, setSelectedYearEnd] = useState<YearEnd | null>(null)
  const [showProcessor, setShowProcessor] = useState(false)
  
  const yearEnds = useMemo(() => getRelevantYearEnds(), [])

  const claims = selectedCompany ? claimsByCompany[selectedCompany.id] || [] : []

  const handleClaimSelect = (claim: Claim) => {
    setSelectedClaim(claim)
    setCurrentStage(getStageFromNext(claim.next))
  }

  const handleStartClaim = () => {
    setStartClaimOpen(true)
    setSelectedClientForClaim(null)
    setShowYearEndSelection(false)
  }

  const handleSelectClientForClaim = (client: Company) => {
    setSelectedClientForClaim(client)
    setShowYearEndSelection(true)
  }

  const handleSelectYearEnd = (yearEnd: YearEnd) => {
    setSelectedYearEnd(yearEnd)
  }

  const handleProcessClaim = () => {
    if (selectedClientForClaim && selectedYearEnd) {
      setStartClaimOpen(false)
      setShowProcessor(true)
    }
  }

  const handleCloseProcessor = () => {
    setShowProcessor(false)
    setSelectedClientForClaim(null)
    setSelectedYearEnd(null)
    setShowYearEndSelection(false)
  }

  const currentStageInfo = stages.find((s) => s.id === currentStage)

  // Recent claims data (simulated)
  const recentClaims = useMemo(() => [
    { id: "rc1", company: "Quantum Dynamics Ltd", processedBy: "Sarah Chen", yearEnd: "Mar 2024", status: "Issued" as const },
    { id: "rc2", company: "Nova Engineering", processedBy: "James Wilson", yearEnd: "Dec 2023", status: "Signed" as const },
    { id: "rc3", company: "TechForward Solutions", processedBy: "Sarah Chen", yearEnd: "Sep 2024", status: "Proofing" as const },
    { id: "rc4", company: "Meridian Research", processedBy: "Alex Kumar", yearEnd: "Jun 2024", status: "Issued" as const },
    { id: "rc5", company: "BlueWave Analytics", processedBy: "James Wilson", yearEnd: "Mar 2024", status: "Signed" as const },
    { id: "rc6", company: "Precision Labs", processedBy: "Sarah Chen", yearEnd: "Dec 2023", status: "Proofing" as const },
    { id: "rc7", company: "Vertex Innovations", processedBy: "Alex Kumar", yearEnd: "Sep 2024", status: "Issued" as const },
  ], [])

  const getStatusBadge = (status: "Issued" | "Signed" | "Proofing") => {
    const styles = {
      Issued: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      Signed: "bg-sky-500/10 text-sky-600 border-sky-500/20",
      Proofing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    }
    return styles[status]
  }

  // Show Processor
  if (showProcessor && selectedClientForClaim && selectedYearEnd) {
    return (
<ClaimProcessor
  company={selectedClientForClaim}
  yearEnd={selectedYearEnd}
  onClose={handleCloseProcessor}
  onAddNotification={onAddNotification}
  />
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Progress Bar - Claims workflow stages */}
      <div className="mb-8">
        <div className="grid grid-cols-6 w-full">
          {[
            { label: "Scan CT600" },
            { label: "Review" },
            { label: "Adjustments" },
            { label: "Final Review" },
            { label: "DocuSign" },
            { label: "Submit" },
].map((item, idx, arr) => {
  const isLast = idx === arr.length - 1
  
  return (
  <div
  key={item.label}
  className="flex items-center"
  >
  {/* Step pill - all steps shown as inactive until claim is in progress */}
  <div
  className="flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium bg-muted text-muted-foreground"
  >
  {item.label}
  </div>
  
  {/* Arrow connector */}
  {!isLast && (
  <div className="flex-1 flex items-center justify-center min-w-0 px-1">
  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Primary CTA - Start Claim */}
      <div className="mb-10">
        <Dialog open={startClaimOpen} onOpenChange={setStartClaimOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="group w-full sm:w-auto h-12 px-8 text-base tracking-tight text-primary-foreground font-bold rounded-xl border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary animate-cta-breathe hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
              onClick={handleStartClaim}
            >
              <span>Start Claim</span>
              <ChevronRight className="h-5 w-5 ml-2 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {!showYearEndSelection ? "Select Client" : "Select Year End"}
              </DialogTitle>
              <DialogDescription>
                {!showYearEndSelection
                  ? "Choose a client from your list"
                  : `Select a year end for ${selectedClientForClaim?.name}`
                }
              </DialogDescription>
            </DialogHeader>
            
            {!showYearEndSelection ? (
              <div className="py-4">
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {clientList.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleSelectClientForClaim(client)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                          selectedClientForClaim?.id === client.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.number}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowYearEndSelection(false)}
                  className="mb-2"
                >
                  <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
                  Back to Client Selection
                </Button>
                
                <div className="space-y-2">
                  {yearEnds.map((ye) => (
                    <div
                      key={ye.id}
                      onClick={() => handleSelectYearEnd(ye)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-lg border text-left transition-colors cursor-pointer",
                        selectedYearEnd?.id === ye.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div>
                        <p className="font-semibold text-foreground">{ye.label}</p>
                        <p className="text-sm text-muted-foreground">{ye.periodStart} - {ye.periodEnd}</p>
                      </div>
                      {selectedYearEnd?.id === ye.id ? (
                        <Check className="h-5 w-5 text-primary" />
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectYearEnd(ye)
                          }}
                        >
                          Process Claim
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              {showYearEndSelection && selectedYearEnd && (
                <Button
                  onClick={handleProcessClaim}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Start Processing
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Claims Table */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Claims</h3>
        
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_140px_100px_100px] gap-4 px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>Company</span>
            <span>Processed by</span>
            <span>Year end</span>
            <span>Status</span>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-border">
            {recentClaims.map((claim) => (
              <div
                key={claim.id}
                className="grid grid-cols-[1fr_140px_100px_100px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <span className="font-medium text-foreground truncate">{claim.company}</span>
                <span className="text-sm text-muted-foreground truncate">{claim.processedBy}</span>
                <span className="text-sm text-muted-foreground">{claim.yearEnd}</span>
                <Badge variant="outline" className={cn("w-fit text-xs", getStatusBadge(claim.status))}>
                  {claim.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientsView({
  onSelectCompany,
  setRoute,
  clientList,
  onAddClient,
  onBulkAddClients,
}: {
  onSelectCompany: (c: Company) => void
  setRoute: (r: Route) => void
  clientList: Company[]
  onAddClient: (client: Company) => void
  onBulkAddClients: (clients: Company[]) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  const grouped = useMemo(() => groupCompaniesByLetter(clientList), [clientList])

  // New Client Dialog State
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [companyNumber, setCompanyNumber] = useState("")
  const [utr, setUtr] = useState("")
  const [payeReference, setPayeReference] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [companySearchResults, setCompanySearchResults] = useState<{ name: string; number: string }[]>([])
  const [showCompanyResults, setShowCompanyResults] = useState(false)
  const [selectedFromSearch, setSelectedFromSearch] = useState(false)

  // CSV Upload State
  const [csvUploadOpen, setCsvUploadOpen] = useState(false)
  const [csvData, setCsvData] = useState<Company[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Filter clients based on search and selected letter
  const filteredClients = useMemo(() => {
    let results = clientList

    // Filter by search query first (primary)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.number.toLowerCase().includes(query)
      )
    }
    // Then filter by letter if selected (secondary)
    else if (selectedLetter) {
      results = grouped[selectedLetter] || []
    }

    return results.sort((a, b) => a.name.localeCompare(b.name))
  }, [clientList, searchQuery, selectedLetter, grouped])

  const handleClientClick = (client: Company) => {
    onSelectCompany(client)
    setRoute("client-detail")
  }

  // Simulated Companies House API search
  const searchCompaniesHouse = async (query: string) => {
    if (query.length < 3) {
      setCompanySearchResults([])
      setShowCompanyResults(false)
      return
    }
    setIsSearching(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    const mockResults = [
      { name: query.toUpperCase() + " LTD", number: String(Math.floor(10000000 + Math.random() * 90000000)) },
      { name: query.toUpperCase() + " LIMITED", number: String(Math.floor(10000000 + Math.random() * 90000000)) },
      { name: query.toUpperCase() + " HOLDINGS LTD", number: String(Math.floor(10000000 + Math.random() * 90000000)) },
    ]
    setCompanySearchResults(mockResults)
    setShowCompanyResults(true)
    setIsSearching(false)
  }

  const handleSelectCompanyFromSearch = (result: { name: string; number: string }) => {
    setCompanyName(result.name)
    setCompanyNumber(result.number)
    setSelectedFromSearch(true)
    setShowCompanyResults(false)
  }

  const handleCreateClient = () => {
    if (!companyName || !companyNumber || !utr || !contactName || !contactEmail || !contactPhone) return
    
    const newClient: Company = {
      id: `c${Date.now()}`,
      name: companyName,
      number: companyNumber,
      utr,
      payeReference: payeReference || undefined,
      contactName,
      contactEmail,
      contactPhone,
    }
    
    onAddClient(newClient)
    resetNewClientForm()
    setNewClientOpen(false)
  }

  const resetNewClientForm = () => {
    setCompanyName("")
    setCompanyNumber("")
    setUtr("")
    setPayeReference("")
    setContactName("")
    setContactEmail("")
    setContactPhone("")
    setSelectedFromSearch(false)
    setCompanySearchResults([])
    setShowCompanyResults(false)
  }

  // CSV Parsing
  const parseCSV = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim())
    const errors: string[] = []
    const clients: Company[] = []
    
    const headers = lines[0]?.toLowerCase().split(",").map((h) => h.trim())
    
    if (!headers || headers.length < 6) {
      errors.push("CSV must have headers: Company Name, Company Number, UTR, PAYE Reference, Contact Name, Contact Email, Contact Phone")
      setCsvErrors(errors)
      return
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
      
      if (values.length < 6) {
        errors.push(`Row ${i + 1}: Insufficient fields`)
        continue
      }

      const [name, number, utrVal, payeRef, cName, cEmail, cPhone] = values

      if (!name || !number || !utrVal || !cName || !cEmail || !cPhone) {
        errors.push(`Row ${i + 1}: Missing required fields`)
        continue
      }

      clients.push({
        id: `c${Date.now()}-${i}`,
        name,
        number,
        utr: utrVal,
        payeReference: payeRef || undefined,
        contactName: cName,
        contactEmail: cEmail,
        contactPhone: cPhone,
      })
    }

    setCsvData(clients)
    setCsvErrors(errors)
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      parseCSV(content)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === "text/csv") {
      handleFileUpload(file)
    } else {
      setCsvErrors(["Please upload a valid CSV file"])
    }
  }

  const handleBulkImport = () => {
    if (csvData.length > 0) {
      onBulkAddClients(csvData)
      setCsvData([])
      setCsvErrors([])
      setCsvUploadOpen(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Clients</h2>
        <div className="flex gap-2">
          {/* CSV Upload Dialog */}
          <Dialog open={csvUploadOpen} onOpenChange={setCsvUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileUp className="h-4 w-4 mr-2" />
                CSV Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Bulk Import Clients</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to import multiple clients at once.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-border",
                    "hover:border-primary/50"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <FileUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium text-foreground mb-1">Drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
                  <Input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id="csv-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      Browse Files
                    </label>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Required CSV format:</p>
                  <p className="font-mono bg-muted p-2 rounded text-xs overflow-x-auto">
                    Company Name, Company Number, UTR, PAYE Reference, Contact Name, Contact Email, Contact Phone
                  </p>
                </div>

                {csvErrors.length > 0 && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    <div className="flex items-center gap-2 text-destructive mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium text-sm">Import Errors</span>
                    </div>
                    <ul className="text-xs text-destructive space-y-1">
                      {csvErrors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {csvErrors.length > 5 && (
                        <li>...and {csvErrors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}

                {csvData.length > 0 && (
                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <Check className="h-4 w-4" />
                      <span className="font-medium text-sm">{csvData.length} clients ready to import</span>
                    </div>
                    <ScrollArea className="h-32">
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {csvData.map((client, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            {client.name} ({client.number})
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setCsvData([])
                  setCsvErrors([])
                  setCsvUploadOpen(false)
                }}>
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} disabled={csvData.length === 0}>
                  Import {csvData.length} Clients
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* New Client Dialog */}
          <Dialog open={newClientOpen} onOpenChange={(open) => {
            setNewClientOpen(open)
            if (!open) resetNewClientForm()
          }}>
<DialogTrigger asChild>
  <Button
    size="sm"
    className="group h-9 px-4 text-sm tracking-tight text-primary-foreground font-semibold rounded-lg border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary animate-cta-breathe hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
  >
    <Plus className="h-4 w-4 mr-2" />
    New Client
  </Button>
  </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Search Companies House to find and add a new client.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <div className="relative">
                    <Input
                      id="company-name"
                      placeholder="Start typing to search Companies House..."
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value)
                        setSelectedFromSearch(false)
                        searchCompaniesHouse(e.target.value)
                      }}
                      onFocus={() => companySearchResults.length > 0 && setShowCompanyResults(true)}
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {showCompanyResults && companySearchResults.length > 0 && (
                      <Card className="absolute top-12 left-0 right-0 z-50 overflow-hidden">
                        <ScrollArea className="max-h-48">
                          {companySearchResults.map((result, i) => (
                            <button
                              key={i}
                              onClick={() => handleSelectCompanyFromSearch(result)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-muted text-left border-b border-border last:border-0"
                            >
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">{result.name}</div>
                                <div className="text-xs text-muted-foreground">{result.number}</div>
                              </div>
                            </button>
                          ))}
                        </ScrollArea>
                      </Card>
                    )}
                  </div>
                  {selectedFromSearch && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Selected from Companies House
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-number">Company Number *</Label>
                  <Input
                    id="company-number"
                    placeholder="e.g., 12345678"
                    value={companyNumber}
                    onChange={(e) => setCompanyNumber(e.target.value)}
                    disabled={selectedFromSearch}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utr">UTR (Unique Taxpayer Reference) *</Label>
                  <Input
                    id="utr"
                    placeholder="e.g., 1234567890"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paye">PAYE Reference (Optional)</Label>
                  <Input
                    id="paye"
                    placeholder="e.g., 123/AB456"
                    value={payeReference}
                    onChange={(e) => setPayeReference(e.target.value)}
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-3">Key Contact</p>
                  
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="contact-name">Contact Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact-name"
                        placeholder="e.g., John Smith"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <Label htmlFor="contact-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="e.g., john@company.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact-phone"
                        type="tel"
                        placeholder="e.g., 07700 900123"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  resetNewClientForm()
                  setNewClientOpen(false)
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClient}
                  disabled={!companyName || !companyNumber || !utr || !contactName || !contactEmail || !contactPhone}
                >
                  Create Client
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Primary: Search Input */}
      <div className="relative mb-6">
<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
  <Input
  placeholder="Search by company name or number..."
  className="pl-12 h-12 text-base shadow-[var(--shadow-elevation-medium)] focus-visible:shadow-[var(--shadow-elevation-high)]"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (e.target.value) setSelectedLetter(null)
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Secondary: A-Z Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => {
              setSelectedLetter(null)
              setSearchQuery("")
            }}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded transition-colors",
              !selectedLetter && !searchQuery
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            All
          </button>
          {alphabet.map((letter) => {
            const hasClients = (grouped[letter]?.length || 0) > 0
            return (
              <button
                key={letter}
                onClick={() => {
                  if (hasClients) {
                    setSelectedLetter(letter)
                    setSearchQuery("")
                  }
                }}
                disabled={!hasClients}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded transition-colors",
                  selectedLetter === letter
                    ? "bg-primary text-primary-foreground"
                    : hasClients
                    ? "text-muted-foreground hover:bg-muted"
                    : "text-muted-foreground/30 cursor-not-allowed"
                )}
              >
                {letter}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {searchQuery
            ? `${filteredClients.length} result${filteredClients.length !== 1 ? "s" : ""} for "${searchQuery}"`
            : selectedLetter
            ? `${filteredClients.length} client${filteredClients.length !== 1 ? "s" : ""} starting with "${selectedLetter}"`
            : `${clientList.length} clients`}
        </p>
      </div>

      {/* Client List */}
      <div className="rounded-lg border border-border overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-foreground">No clients found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Add a client to get started"}
            </p>
          </div>
        ) : (
<div className="divide-y divide-border">
  {filteredClients.map((client) => (
  <button
  key={client.id}
  onClick={() => handleClientClick(client)}
  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/50 transition-colors"
  >
  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground flex-shrink-0">
  {client.name.charAt(0)}
  </div>
  <div className="flex-1 min-w-0">
  <p className="font-medium text-foreground truncate leading-tight">{client.name}</p>
  <p className="text-sm text-muted-foreground leading-tight">{client.number}</p>
  </div>
  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
  </button>
  ))}
  </div>
        )}
      </div>
    </div>
  )
}

// Client Detail View - shows historical claims for selected client
function ClientDetailView({
  client,
  setRoute,
}: {
  client: Company
  setRoute: (r: Route) => void
}) {
  // Mock historical claims data
  const historicalClaims = useMemo(() => [
    {
      id: "hc1",
      name: "R&D Tax Credit FY 2023/24",
      status: "Submitted" as const,
      submittedDate: "15 Jan 2024",
      yearEnd: "Mar 2024",
      amount: "£45,230",
    },
    {
      id: "hc2",
      name: "R&D Tax Credit FY 2022/23",
      status: "Issued" as const,
      submittedDate: "20 Feb 2023",
      yearEnd: "Mar 2023",
      amount: "£38,500",
    },
    {
      id: "hc3",
      name: "R&D Tax Credit FY 2021/22",
      status: "Signed" as const,
      submittedDate: "18 Mar 2022",
      yearEnd: "Mar 2022",
      amount: "£32,100",
    },
    {
      id: "hc4",
      name: "R&D Tax Credit FY 2024/25",
      status: "In Progress" as const,
      submittedDate: null,
      yearEnd: "Mar 2025",
      amount: "TBD",
    },
  ], [])

  const getStatusBadge = (status: "In Progress" | "Issued" | "Signed" | "Submitted") => {
    const styles = {
      "In Progress": "bg-amber-500/10 text-amber-600 border-amber-500/20",
      Issued: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      Signed: "bg-sky-500/10 text-sky-600 border-sky-500/20",
      Submitted: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    }
    return styles[status]
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back button and header */}
      <div className="mb-6">
        <button
          onClick={() => setRoute("clients")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Clients
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{client.name}</h2>
            <p className="text-muted-foreground">{client.number}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-muted-foreground">UTR</p>
            <p className="font-mono text-foreground">{client.utr || "-"}</p>
          </div>
        </div>
      </div>

      {/* Historical Claims */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Historical Claims</h3>
        
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_100px_100px_100px_80px] gap-4 px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>Claim</span>
            <span>Year End</span>
            <span>Status</span>
            <span>Submitted</span>
            <span>Docs</span>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-border">
            {historicalClaims.map((claim) => (
              <div
                key={claim.id}
                className="grid grid-cols-[1fr_100px_100px_100px_80px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">{claim.name}</p>
                  <p className="text-xs text-muted-foreground">{claim.amount}</p>
                </div>
                <span className="text-sm text-muted-foreground">{claim.yearEnd}</span>
                <Badge variant="outline" className={cn("w-fit text-xs", getStatusBadge(claim.status))}>
                  {claim.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {claim.submittedDate || "-"}
                </span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      {client.contactName && (
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium text-foreground mb-3">Key Contact</p>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {client.contactName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">{client.contactName}</p>
              <div className="flex items-center gap-4 text-muted-foreground">
                {client.contactEmail && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {client.contactEmail}
                  </span>
                )}
                {client.contactPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {client.contactPhone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SubmissionsView({ 
  selectedCompany,
  onSelectCompany,
  setRoute,
  clientList,
}: { 
  selectedCompany: Company | null
  onSelectCompany: (c: Company) => void
  setRoute: (r: Route) => void
  clientList: Company[]
}) {
  const [startSubmissionOpen, setStartSubmissionOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

// Simulated submitted claims (sorted by date, most recent first)
  const submittedClaims = useMemo(() => [
  { id: "sc1", company: "Quantum Dynamics Ltd", claimName: "FY 2023/24", dateSubmitted: "15 Jan 2024", status: "Submitted" as const, submittedBy: "Sarah Mitchell" },
  { id: "sc2", company: "Nova Engineering", claimName: "FY 2023/24", dateSubmitted: "12 Jan 2024", status: "Submitted" as const, submittedBy: "James Cooper" },
  { id: "sc3", company: "TechForward Solutions", claimName: "FY 2022/23", dateSubmitted: "8 Jan 2024", status: "Submitted" as const, submittedBy: "Emily Chen" },
  { id: "sc4", company: "Meridian Research", claimName: "FY 2023/24", dateSubmitted: "5 Jan 2024", status: "Submitted" as const, submittedBy: "Sarah Mitchell" },
  { id: "sc5", company: "BlueWave Analytics", claimName: "FY 2022/23", dateSubmitted: "28 Dec 2023", status: "Submitted" as const, submittedBy: "Michael Torres" },
  { id: "sc6", company: "Precision Labs", claimName: "FY 2023/24", dateSubmitted: "20 Dec 2023", status: "Submitted" as const, submittedBy: "James Cooper" },
  ], [])

  // Simulated claims ready for submission (processed but not yet submitted)
  const claimsReadyForSubmission = useMemo(() => [
    { id: "crs1", company: "Vertex Innovations", claimName: "R&D Tax Credit FY 2024/25", yearEnd: "Mar 2025", amount: "£52,340" },
    { id: "crs2", company: "Apex Technologies", claimName: "R&D Tax Credit FY 2023/24", yearEnd: "Dec 2024", amount: "£41,200" },
    { id: "crs3", company: "Horizon Digital", claimName: "R&D Tax Credit FY 2024/25", yearEnd: "Sep 2024", amount: "£38,900" },
    { id: "crs4", company: "Stellar Systems", claimName: "R&D Tax Credit FY 2023/24", yearEnd: "Jun 2024", amount: "£29,750" },
  ], [])

  const filteredClaimsForSubmission = useMemo(() => {
    if (!searchQuery.trim()) return claimsReadyForSubmission
    const query = searchQuery.toLowerCase()
    return claimsReadyForSubmission.filter(
      (c) =>
        c.company.toLowerCase().includes(query) ||
        c.claimName.toLowerCase().includes(query)
    )
  }, [claimsReadyForSubmission, searchQuery])

  const handleStartSubmission = (claimId: string) => {
    // This would navigate to step 6 of the claims process
    setStartSubmissionOpen(false)
    setSearchQuery("")
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Primary CTA - Start Submission */}
      <div className="mb-10">
        <Dialog open={startSubmissionOpen} onOpenChange={(open) => {
          setStartSubmissionOpen(open)
          if (!open) setSearchQuery("")
        }}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="group w-full sm:w-auto h-12 px-8 text-base tracking-tight text-primary-foreground font-bold rounded-xl border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary animate-cta-breathe hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
            >
              <span>Start Submission</span>
              <ChevronRight className="h-5 w-5 ml-2 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Select Claim to Submit</DialogTitle>
              <DialogDescription>
                Choose a processed claim to begin the submission process
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {/* Search input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company or claim name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Claims list */}
              <ScrollArea className="h-72">
                {filteredClaimsForSubmission.length === 0 ? (
                  <div className="p-6 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium text-foreground">No claims found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "Try a different search term" : "No processed claims ready for submission"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredClaimsForSubmission.map((claim) => (
                      <button
                        key={claim.id}
                        onClick={() => handleStartSubmission(claim.id)}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-border text-left transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{claim.company}</p>
                          <p className="text-sm text-muted-foreground truncate">{claim.claimName}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{claim.yearEnd}</span>
                            <span className="font-medium text-emerald-600">{claim.amount}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Submitted Claims Table */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Submitted Claims</h3>
        
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_120px_100px_80px] gap-4 px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>Company</span>
            <span>Claim</span>
            <span>Date Submitted</span>
            <span>Status</span>
            <span>Receipt</span>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-border">
            {submittedClaims.map((claim) => {
              // Find matching client for navigation
              const matchingClient = clientList?.find(c => c.name === claim.company)
              
              const handleCompanyClick = () => {
                if (matchingClient) {
                  onSelectCompany(matchingClient)
                  setRoute("client-detail")
                }
              }
              
              const handleDownloadReceipt = () => {
                // Generate receipt filename based on company and claim
                const filename = `HMRC_Receipt_${claim.company.replace(/\s+/g, '_')}_${claim.claimName.replace(/\s+/g, '_')}.pdf`
                // In production, this would fetch the actual receipt from storage
                // For demo, we simulate a download
                const link = document.createElement('a')
                link.href = '#'
                link.download = filename
                // Show a toast or notification that download started
                alert(`Downloading: ${filename}`)
              }
              
              return (
                <div
                  key={claim.id}
                  className="grid grid-cols-[1fr_1fr_120px_100px_80px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
                >
<div className="min-w-0">
  <button
  onClick={handleCompanyClick}
  className={cn(
  "font-medium truncate text-left transition-colors focus-visible:outline-none focus-visible:underline block",
  matchingClient ? "text-foreground hover:text-primary cursor-pointer" : "text-foreground cursor-default"
  )}
  disabled={!matchingClient}
  >
  {claim.company}
  </button>
  <p className="text-xs text-muted-foreground truncate">{claim.submittedBy}</p>
  </div>
                  <span className="text-sm text-muted-foreground truncate">{claim.claimName}</span>
                  <span className="text-sm text-muted-foreground">{claim.dateSubmitted}</span>
                  <Badge variant="outline" className="w-fit text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {claim.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleDownloadReceipt}
                    title={`Download HMRC Receipt for ${claim.company}`}
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationsPanel() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)
  const [hmrcValidationEmail, setHmrcValidationEmail] = useState(true)
  const [hmrcValidationInApp, setHmrcValidationInApp] = useState(true)
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">Configure how and when you receive notifications</p>
      </div>
      
      {/* Global settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Email Notifications</p>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">In-App Notifications</p>
            <p className="text-sm text-muted-foreground">Show notifications in the app header</p>
          </div>
          <Switch checked={inAppNotifications} onCheckedChange={setInAppNotifications} />
        </div>
      </div>
      
      {/* Event-specific settings */}
      <div className="pt-4">
        <h4 className="text-sm font-semibold text-foreground mb-4">Event Notifications</h4>
        
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
<CardTitle className="text-sm">Automatic CT600 Validation</CardTitle>
  <p className="text-xs text-muted-foreground mt-0.5">When CT600 validation completes</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email notification</span>
                <Switch 
                  checked={hmrcValidationEmail} 
                  onCheckedChange={setHmrcValidationEmail}
                  disabled={!emailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In-app notification</span>
                <Switch 
                  checked={hmrcValidationInApp} 
                  onCheckedChange={setHmrcValidationInApp}
                  disabled={!inAppNotifications}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <p className="text-xs text-muted-foreground pt-2">
        Email notifications are sent to your registered email address. In-app notifications appear in the bell icon in the header.
      </p>
    </div>
  )
}

function UsersPanel() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"Administrator" | "Claim Processor">("Claim Processor")
  const [inviteName, setInviteName] = useState("")
  const [inviteSent, setInviteSent] = useState(false)

  const handleSendInvite = () => {
    setInviteSent(true)
    setTimeout(() => {
      setInviteOpen(false)
      setInviteSent(false)
      setInviteEmail("")
      setInviteName("")
      setInviteRole("Claim Processor")
    }, 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Team Members</h3>
          <p className="text-sm text-muted-foreground">{users.length} users in workspace</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to add a new user to your workspace. They will receive an email with instructions to set up their account.
              </DialogDescription>
            </DialogHeader>
            {inviteSent ? (
              <div className="py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="font-medium text-foreground">Invitation Sent</p>
                <p className="text-sm text-muted-foreground mt-1">
                  An email has been sent to {inviteEmail}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-name">Full Name</Label>
                    <Input
                      id="invite-name"
                      placeholder="John Smith"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="john.smith@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "Administrator" | "Claim Processor")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrator">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span>Administrator</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Claim Processor">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Claim Processor</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {inviteRole === "Administrator"
                        ? "Full access to all features including user management, submissions, and settings."
                        : "Can view and edit claims, upload documents, and build CT600s. Cannot submit or manage users."}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendInvite}
                    disabled={!inviteEmail || !inviteName}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 p-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last Login</span>
          <span></span>
        </div>
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 p-3 items-center border-b border-border last:border-0 text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="font-medium text-foreground">{user.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </div>
              </div>
            </div>
            <div>
              <Badge
                variant="outline"
                className={cn(
                  user.role === "Administrator"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {user.role}
              </Badge>
            </div>
            <Badge
              variant="outline"
              className={cn(
                user.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {user.status}
            </Badge>
            <div className="text-muted-foreground flex items-center gap-1 whitespace-nowrap">
              <Clock className="h-3 w-3" />
              {user.lastLogin}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border p-4">
        <h4 className="font-medium text-foreground mb-2">Role Definitions</h4>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Administrator</span>
            </div>
            <p className="text-muted-foreground">Full access to all features including user management, submissions, and settings configuration.</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Claim Processor</span>
            </div>
            <p className="text-muted-foreground">Can view and edit claims, upload documents, and build CT600s. Cannot submit or manage users.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PermissionsPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-foreground">Role Permissions</h3>
        <p className="text-sm text-muted-foreground">Define what each role can access and modify</p>
      </div>

      <div className="space-y-4">
        {rolePermissions.map((role) => (
          <div key={role.role} className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {role.role === "Administrator" ? (
                  <Shield className="h-5 w-5 text-primary" />
                ) : (
                  <Users className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <h4 className="font-semibold text-foreground">{role.role}</h4>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid gap-2">
                {Object.entries(role.permissions).map(([permission, enabled]) => (
                  <div key={permission} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-foreground capitalize">{permission.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {enabled ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        <Check className="h-3 w-3 mr-1" />
                        Allowed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        <X className="h-3 w-3 mr-1" />
                        Denied
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Permission Model</p>
            <p className="text-xs text-muted-foreground mt-1">
              Permissions are role-based and applied consistently across both UI and API access. The submission approval workflow cannot be bypassed regardless of role.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuditLogPanel() {
  const getCategoryColor = (category: AuditLogEntry["category"]) => {
    switch (category) {
      case "auth":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "claim":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "client":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "submission":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "settings":
        return "bg-slate-500/10 text-slate-600 border-slate-500/20"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Activity Log</h3>
          <p className="text-sm text-muted-foreground">Immutable record of all system events</p>
        </div>
        <Button variant="outline" size="sm">
          <FileOutput className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <ScrollArea className="h-[400px] border border-border rounded-lg">
        <div className="p-1">
          {auditLog.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                "p-3 flex items-start gap-4",
                index !== auditLog.length - 1 && "border-b border-border"
              )}
            >
              <div className="text-xs text-muted-foreground whitespace-nowrap pt-0.5 w-36">
                {entry.timestamp}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{entry.action}</span>
                  <Badge variant="outline" className={cn("text-xs", getCategoryColor(entry.category))}>
                    {entry.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{entry.details}</p>
                <p className="text-xs text-muted-foreground mt-1">by {entry.user}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function TemplateLibraryPanel() {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const getCategoryIcon = (category: Template["category"]) => {
    switch (category) {
      case "export":
        return FileOutput
      case "report":
        return FileBarChart
      case "letter":
        return FileSignature
      default:
        return FileText
    }
  }

  const getCategoryLabel = (category: Template["category"]) => {
    switch (category) {
      case "export":
        return "Export"
      case "report":
        return "Report"
      case "letter":
        return "Letter"
      default:
        return category
    }
  }

  const getFormatBadge = (template: Template) => {
    if (template.name.includes("Expenditure")) {
      return <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Excel</Badge>
    }
    return <Badge variant="secondary" className="text-xs">PDF</Badge>
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleSubmitRequest = () => {
    if (!uploadedFile) return
    setIsSubmitting(true)
    // Simulate sending email to support@taxengine.io
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setTimeout(() => {
        setRequestDialogOpen(false)
        setUploadedFile(null)
        setSubmitted(false)
      }, 2000)
    }, 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Template Library</h3>
          <p className="text-sm text-muted-foreground">Centrally managed document templates</p>
        </div>
        <Dialog open={requestDialogOpen} onOpenChange={(open) => {
          setRequestDialogOpen(open)
          if (!open) {
            setUploadedFile(null)
            setSubmitted(false)
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Template Addition</DialogTitle>
              <DialogDescription>
                Templates are centrally managed to ensure consistent reporting across all claims and clients.
              </DialogDescription>
            </DialogHeader>
            
            {submitted ? (
              <div className="py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="font-medium text-foreground">Request Submitted</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your template request has been sent to the TaxEngine team for review.
                </p>
              </div>
            ) : (
              <>
                <div className="py-4 space-y-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">
                      To request a new template, upload a sample document below. Our team will review it and add it to the library if approved. You will be notified once the template is available.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Template File</Label>
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                        uploadedFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-primary/50"
                      )}
                      onClick={() => document.getElementById("template-file-upload")?.click()}
                    >
                      {uploadedFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="h-8 w-8 text-emerald-600" />
                          <div className="text-left">
                            <p className="font-medium text-foreground text-sm">{uploadedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              setUploadedFile(null)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground">Click to upload</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOCX, XLSX, or other document formats
                          </p>
                        </>
                      )}
                      <Input
                        id="template-file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.docx,.xlsx,.xls,.doc"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Your request will be sent to support@taxengine.io with your user details and the uploaded file.
                  </p>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitRequest}
                    disabled={!uploadedFile || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {templates.map((template) => {
          const Icon = getCategoryIcon(template.category)
          return (
            <div
              key={template.id}
              className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(template.category)}
                  </Badge>
                  {getFormatBadge(template)}
                </div>
                <span className="text-xs text-muted-foreground">v{template.version}</span>
              </div>
              <h4 className="font-medium text-foreground text-sm mb-1">{template.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
              <p className="text-xs text-muted-foreground">Last modified: {template.lastModified}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InvoicingPanel() {
  const [isTrialActive] = useState(true)
  const trialDaysRemaining = 24

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground">Invoicing & Pricing</h3>
        <p className="text-sm text-muted-foreground">Simple, transparent pricing with no hidden fees</p>
      </div>

      {/* Trial Banner */}
      {isTrialActive && (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-emerald-800 dark:text-emerald-200">Free Trial Active</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                You have {trialDaysRemaining} days remaining on your free one-month trial. All features are fully enabled with no restrictions.
              </p>
            </div>
            <Badge className="bg-emerald-500 hover:bg-emerald-600">{trialDaysRemaining} days left</Badge>
          </div>
        </div>
      )}

      {/* Platform Licence */}
      <div className="rounded-lg border border-border p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Platform Licence</h4>
              <p className="text-sm text-muted-foreground">Monthly subscription for your organisation</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">£30</p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Unlimited users across your organisation</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Full access to all platform features</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>No per-seat charges or user limits</span>
          </div>
        </div>
      </div>

      {/* Per-Claim Pricing */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Per-Claim Pricing</h4>
        <p className="text-sm text-muted-foreground mb-4">Usage-based pricing that rewards volume. The more claims you process, the lower your per-claim cost.</p>
        
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">0 - 50 claims/year</p>
            <p className="text-3xl font-bold text-foreground">£120</p>
            <p className="text-sm text-muted-foreground">per claim</p>
          </div>
          <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 text-center relative">
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">Most Common</Badge>
            <p className="text-sm text-muted-foreground mb-1 mt-1">50 - 500 claims/year</p>
            <p className="text-3xl font-bold text-foreground">£75</p>
            <p className="text-sm text-muted-foreground">per claim</p>
          </div>
          <div className="rounded-lg border border-border p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">500+ claims/year</p>
            <p className="text-3xl font-bold text-foreground">£50</p>
            <p className="text-sm text-muted-foreground">per claim</p>
          </div>
        </div>
      </div>

      {/* Transparency Notice */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Deliberately Simple & Transparent</p>
            <p className="text-xs text-muted-foreground mt-1">
              There are no paywalls, no feature gating, and no restricted functionality. Every user on your account has full access to every feature from day one. The platform licence covers unlimited users, and you only pay per claim based on your annual volume. That's it.
            </p>
          </div>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="border-t border-border pt-4">
        <h4 className="font-medium text-foreground mb-3">Example Billing</h4>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-foreground">Annual Claims</th>
                <th className="text-right p-3 font-medium text-foreground">Per-Claim Rate</th>
                <th className="text-right p-3 font-medium text-foreground">Claims Cost</th>
                <th className="text-right p-3 font-medium text-foreground">Licence (Annual)</th>
                <th className="text-right p-3 font-medium text-foreground">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3 text-muted-foreground">25 claims</td>
                <td className="p-3 text-right text-muted-foreground">£120</td>
                <td className="p-3 text-right text-muted-foreground">£3,000</td>
                <td className="p-3 text-right text-muted-foreground">£360</td>
                <td className="p-3 text-right font-medium text-foreground">£3,360</td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground">150 claims</td>
                <td className="p-3 text-right text-muted-foreground">£75</td>
                <td className="p-3 text-right text-muted-foreground">£11,250</td>
                <td className="p-3 text-right text-muted-foreground">£360</td>
                <td className="p-3 text-right font-medium text-foreground">£11,610</td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground">750 claims</td>
                <td className="p-3 text-right text-muted-foreground">£50</td>
                <td className="p-3 text-right text-muted-foreground">£37,500</td>
                <td className="p-3 text-right text-muted-foreground">£360</td>
                <td className="p-3 text-right font-medium text-foreground">£37,860</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AppearancePanel() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground">Appearance</h3>
          <p className="text-sm text-muted-foreground">Customize the look and feel of the application</p>
        </div>
        <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground">Appearance</h3>
        <p className="text-sm text-muted-foreground">Customize the look and feel of the application</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Theme</Label>
          <p className="text-xs text-muted-foreground mb-3">Select your preferred colour scheme</p>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                theme === "light"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className="h-10 w-10 rounded-lg bg-white border border-border flex items-center justify-center">
                <Sun className="h-5 w-5 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-foreground">Light</span>
              {theme === "light" && (
                <Badge variant="secondary" className="text-xs">Active</Badge>
              )}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                theme === "dark"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className="h-10 w-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                <Moon className="h-5 w-5 text-slate-300" />
              </div>
              <span className="text-sm font-medium text-foreground">Dark</span>
              {theme === "dark" && (
                <Badge variant="secondary" className="text-xs">Active</Badge>
              )}
            </button>

            <button
              onClick={() => setTheme("system")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                theme === "system"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-white to-slate-900 border border-border flex items-center justify-center">
                <Monitor className="h-5 w-5 text-slate-500" />
              </div>
              <span className="text-sm font-medium text-foreground">System</span>
              {theme === "system" && (
                <Badge variant="secondary" className="text-xs">Active</Badge>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">System preference</p>
              <p className="text-xs text-muted-foreground mt-1">
                When set to System, the application will automatically switch between light and dark mode based on your operating system settings. Your preference is saved and will persist across sessions.
              </p>
              {theme === "system" && (
                <p className="text-xs text-muted-foreground mt-2">
                  Currently using: <span className="font-medium text-foreground">{resolvedTheme === "dark" ? "Dark" : "Light"}</span> (from system)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GovernmentGatewayPanel() {
  const [isConnected, setIsConnected] = useState(true)
  const [agentUserId, setAgentUserId] = useState("AGENT-12345-67890")
  const [agentPassword, setAgentPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [newAgentId, setNewAgentId] = useState("")
  const [newAgentPassword, setNewAgentPassword] = useState("")

  const handleConnect = () => {
    if (!newAgentId || !newAgentPassword) return
    setIsConnecting(true)
    setTimeout(() => {
      setAgentUserId(newAgentId)
      setIsConnected(true)
      setIsConnecting(false)
      setConnectDialogOpen(false)
      setNewAgentId("")
      setNewAgentPassword("")
    }, 1500)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setAgentUserId("")
    setDisconnectDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground">Government Gateway</h3>
        <p className="text-sm text-muted-foreground">Connect your HMRC Agent credentials to submit claims directly</p>
      </div>

      {/* Connection Status */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              isConnected ? "bg-emerald-500/10" : "bg-muted"
            )}>
              <Globe className={cn(
                "h-5 w-5",
                isConnected ? "text-emerald-600" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="font-medium text-foreground">Connection Status</p>
              <p className="text-sm text-muted-foreground">
                {isConnected ? "Linked to HMRC Government Gateway" : "Not connected"}
              </p>
            </div>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className={cn(
            isConnected && "bg-emerald-500 hover:bg-emerald-600"
          )}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {isConnected ? (
        <>
          {/* Agent Credentials */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Agent User ID</Label>
              <div className="mt-1.5">
                <Input
                  value={agentUserId}
                  readOnly
                  className="font-mono text-sm bg-muted/50"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Agent Password</Label>
              <div className="mt-1.5 relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value="••••••••••••"
                  readOnly
                  className="font-mono text-sm bg-muted/50 pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Last Sync Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Last Verified</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Credentials were last verified with HMRC on 24 January 2026 at 14:32. Connection is active and ready for submissions.
                </p>
              </div>
            </div>
          </div>

          {/* Submission Permissions */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Submission Permissions</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">CT600 Corporation Tax Returns</span>
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Authorised</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <FileBarChart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">R&D Tax Credit Claims</span>
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Authorised</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <FileOutput className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">iXBRL Submissions</span>
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Authorised</Badge>
              </div>
            </div>
          </div>

          {/* Disconnect Button */}
          <div className="pt-2">
            <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive bg-transparent">
                  <X className="h-4 w-4 mr-2" />
                  Disconnect Gateway
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Disconnect Government Gateway
                  </DialogTitle>
                  <DialogDescription>
                    This will remove your HMRC Agent credentials from TaxEngine. You will not be able to submit claims until you reconnect.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-200">Submissions will be disabled</p>
                        <p className="text-amber-700 dark:text-amber-300 mt-1">
                          Any pending submissions will remain in queue but cannot be processed until credentials are reconnected.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDisconnectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : (
        <>
          {/* Connect Prompt */}
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Globe className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-foreground mb-1">No Gateway Connected</p>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your HMRC Agent Government Gateway credentials to enable direct submission of CT600 returns and R&D claims.
            </p>
            <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Key className="h-4 w-4 mr-2" />
                  Connect Agent Credentials
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Connect Government Gateway</DialogTitle>
                  <DialogDescription>
                    Enter your HMRC Agent Government Gateway credentials. These will be securely stored and used for claim submissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-id">Agent User ID</Label>
                    <Input
                      id="agent-id"
                      placeholder="e.g., AGENT-12345-67890"
                      value={newAgentId}
                      onChange={(e) => setNewAgentId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Your 12-digit Agent User ID from HMRC</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-password">Agent Password</Label>
                    <Input
                      id="agent-password"
                      type="password"
                      placeholder="Enter your password"
                      value={newAgentPassword}
                      onChange={(e) => setNewAgentPassword(e.target.value)}
                    />
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Your credentials are encrypted and stored securely. TaxEngine uses these credentials solely to submit returns on behalf of your clients through the official HMRC APIs.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setConnectDialogOpen(false)
                    setNewAgentId("")
                    setNewAgentPassword("")
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConnect}
                    disabled={!newAgentId || !newAgentPassword || isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Info about Agent Services */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">About Agent Services</p>
                <p className="text-xs text-muted-foreground mt-1">
                  To submit CT600 returns and R&D claims on behalf of clients, you need an HMRC Agent Services account. If you don't have one, you can register at <span className="font-medium">gov.uk/guidance/get-an-hmrc-agent-services-account</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Security Notice */}
      <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Security & Compliance</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              All submissions are made through official HMRC APIs using your Agent credentials. TaxEngine maintains a full audit trail of all submissions. Your credentials are encrypted at rest and in transit using industry-standard encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function APIPanel() {
  const [apiKeys, setApiKeys] = useState([
    { id: "1", name: "Production Key", key: "sk_live_•••••••••••••••", created: "15 Jan 2026", lastUsed: "2 hours ago", status: "Active" },
    { id: "2", name: "Development Key", key: "sk_test_•••••••••••••••", created: "10 Jan 2026", lastUsed: "5 days ago", status: "Active" },
  ])
  const [createKeyOpen, setCreateKeyOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)

  const handleCreateKey = () => {
    const key = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    setGeneratedKey(key)
  }

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
    }
  }

  const confirmCreateKey = () => {
    if (generatedKey && newKeyName) {
      setApiKeys(prev => [...prev, {
        id: String(Date.now()),
        name: newKeyName,
        key: generatedKey.substring(0, 16) + "•••••••••••••••",
        created: "Just now",
        lastUsed: "Never",
        status: "Active"
      }])
      setCreateKeyOpen(false)
      setNewKeyName("")
      setGeneratedKey(null)
      setShowKey(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground">API Access</h3>
        <p className="text-sm text-muted-foreground">Manage API keys for programmatic access to TaxEngine</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{apiKeys.length} Active Keys</p>
          <p className="text-xs text-muted-foreground">API keys provide programmatic access to your workspace</p>
        </div>
        <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for programmatic access to your workspace.
              </DialogDescription>
            </DialogHeader>
            {!generatedKey ? (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Give your key a descriptive name to identify its purpose
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateKeyOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey} disabled={!newKeyName}>
                    Generate Key
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-200">Save this key now</p>
                        <p className="text-amber-700 dark:text-amber-300 mt-1">
                          This is the only time you'll be able to see the full key. Store it securely.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Your API Key</Label>
                    <div className="relative">
                      <Input
                        value={generatedKey}
                        readOnly
                        type={showKey ? "text" : "password"}
                        className="font-mono text-sm pr-20"
                      />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleCopyKey}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={confirmCreateKey}>
                    <Check className="h-4 w-4 mr-2" />
                    I've Saved My Key
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 p-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
          <span>Name</span>
          <span>Key</span>
          <span>Created</span>
          <span>Last Used</span>
          <span></span>
        </div>
        {apiKeys.map((key) => (
          <div
            key={key.id}
            className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 p-3 items-center border-b border-border last:border-0 text-sm"
          >
            <div className="font-medium text-foreground">{key.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{key.key}</div>
            <div className="text-muted-foreground whitespace-nowrap">{key.created}</div>
            <div className="text-muted-foreground whitespace-nowrap">{key.lastUsed}</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">API Documentation</p>
            <p className="text-xs text-muted-foreground mt-1">
              Full API documentation is available at <span className="font-medium">docs.taxengine.com/api</span>. All endpoints require authentication using your API key in the Authorization header.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Security Best Practices</p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
              <li>Never commit API keys to version control</li>
              <li>Rotate keys regularly and revoke unused keys</li>
              <li>Use different keys for production and development</li>
              <li>Monitor API key usage in the audit log</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsView({ initialSetting }: { initialSetting?: string }) {
  const [selectedSetting, setSelectedSetting] = useState<string | null>(initialSetting || "users")

  const settingsItems = [
    { id: "users", title: "Users & Roles", description: "Manage users and assign roles", icon: Users },
    { id: "notifications", title: "Notifications", description: "Email and in-app alerts", icon: Bell },
    { id: "audit", title: "Audit Log", description: "Immutable event history", icon: ScrollText },
    { id: "template", title: "Template Library", description: "Templates for packs and exports", icon: LayoutTemplate },
    { id: "invoicing", title: "Invoicing", description: "Billing profiles, rates, and invoices", icon: Receipt },
    { id: "appearance", title: "Appearance", description: "Light and dark mode settings", icon: Palette },
    { id: "gateway", title: "Government Gateway", description: "HMRC Agent credentials", icon: Globe },
  ]

  const renderPanel = () => {
    switch (selectedSetting) {
case "users":
  return <UsersPanel />
  case "notifications":
  return <NotificationsPanel />
  case "audit":
        return <AuditLogPanel />
      case "template":
        return <TemplateLibraryPanel />
case "invoicing":
  return <InvoicingPanel />
  case "appearance":
  return <AppearancePanel />
case "gateway":
        return <GovernmentGatewayPanel />
  default:
        return (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-foreground">Nothing selected</p>
            <p className="text-sm text-muted-foreground">Choose a settings item above</p>
          </div>
        )
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Workspace level configuration</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {settingsItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedSetting(item.id)}
            className={cn(
              "p-4 rounded-lg border text-left transition-all",
              selectedSetting === item.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <item.icon className="h-5 w-5 mb-2 text-muted-foreground" />
            <h4 className="font-semibold text-foreground">{item.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {selectedSetting
              ? settingsItems.find((s) => s.id === selectedSetting)?.title
              : "Select an item"}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderPanel()}</CardContent>
      </Card>
    </div>
  )
}

function TaxEngineApp() {
  const [route, setRoute] = useState<Route>("home")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Company[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clientList, setClientList] = useState<Company[]>(companies)
  const [isGatewayConnected, setIsGatewayConnected] = useState(true)
  const [settingsInitialTab, setSettingsInitialTab] = useState<string | undefined>(undefined)
  
  // Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  
  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  
  const handleAddNotification = (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    }
    setNotifications(prev => [newNotification, ...prev])
  }
  
  const handleNotificationClick = (notification: AppNotification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
    // Navigate to claims if it's an HMRC validation notification
    if (notification.type === "hmrc-validation") {
      setRoute("claims")
    }
  }
  
  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }
  
  // Restore auth state on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedAuth) {
      try {
        const user = JSON.parse(storedAuth) as AuthUser
        setCurrentUser(user)
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setIsAuthLoading(false)
  }, [])
  
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user)
  }
  
  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setCurrentUser(null)
    setRoute("home")
  }

  const handleGatewayClick = () => {
    setSettingsInitialTab("gateway")
    setRoute("settings")
  }
  
  const handleSearch = (query: string) => {
  if (!query.trim()) {
  setSearchResults([])
  return
  }
  const q = query.toLowerCase()
  const results = clientList.filter(
  (c) => c.name.toLowerCase().includes(q) || c.number.toLowerCase().includes(q)
  )
  setSearchResults(results.slice(0, 8))
  }

  const handleAddClient = (client: Company) => {
    setClientList((prev) => [...prev, client])
  }

  const handleBulkAddClients = (clients: Company[]) => {
    setClientList((prev) => [...prev, ...clients])
  }

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company)
    setRoute("claims")
  }

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
    return <LoginView onLogin={handleLogin} />
  }

  return (
  <div className="flex min-h-screen bg-background">
  <Sidebar
  route={route}
  setRoute={setRoute}
  isOpen={sidebarOpen}
  setIsOpen={setSidebarOpen}
  currentUser={currentUser}
  onLogout={handleLogout}
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
  onMarkNotificationRead={handleMarkNotificationRead}
  />

        <main className="flex-1">
          {route === "home" && (
            <HomeView
              setRoute={setRoute}
              clientList={clientList}
            />
          )}
          {route === "claims" && (
<ClaimsView
  selectedCompany={selectedCompany}
  onSelectCompany={handleSelectCompany}
  clientList={clientList}
  onAddClient={handleAddClient}
  onAddNotification={handleAddNotification}
  />
          )}
          {route === "clients" && (
            <ClientsView
              onSelectCompany={handleSelectCompany}
              setRoute={setRoute}
              clientList={clientList}
              onAddClient={handleAddClient}
              onBulkAddClients={handleBulkAddClients}
            />
          )}
          {route === "client-detail" && selectedCompany && (
            <ClientDetailView
              client={selectedCompany}
              setRoute={setRoute}
            />
          )}
          {route === "submissions" && <SubmissionsView selectedCompany={selectedCompany} onSelectCompany={handleSelectCompany} setRoute={setRoute} clientList={clientList} />}
          {route === "settings" && <SettingsView initialSetting={settingsInitialTab} key={settingsInitialTab} />}
        </main>
      </div>
    </div>
  )
}

export default function Page() {
  return <TaxEngineApp />
}
