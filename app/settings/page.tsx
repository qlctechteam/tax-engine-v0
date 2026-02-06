"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { cn } from "@/lib/utils"
import { rolePermissions, templates, governmentGateway, submissionPermissions } from "@/lib/data"
import { useTaxEngineUsers, useAuditLogs } from "@/hooks/use-supabase-data"
import {
  Users,
  Bell,
  ScrollText,
  LayoutTemplate,
  Receipt,
  Palette,
  Globe,
  Settings,
  Plus,
  Shield,
  Mail,
  Check,
  Clock,
  MoreHorizontal,
  FileBarChart,
  FileSignature,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Upload,
  FileText,
  Info,
  Eye,
  EyeOff,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useTheme } from "next-themes"

function UsersPanel() {
  const { data: dbUsers, isLoading } = useTaxEngineUsers()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"Administrator" | "Claim Processor">("Claim Processor")
  const [inviteName, setInviteName] = useState("")
  const [inviteSent, setInviteSent] = useState(false)

  // Transform database users to UI format
  const users = dbUsers.map(u => ({
    id: u.uuid,
    name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email.split('@')[0],
    email: u.email,
    role: u.role === 'ADMINISTRATOR' ? 'Administrator' : 'Claim Processor',
    status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
    lastLogin: u.lastLoginAt 
      ? new Date(u.lastLoginAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'Never',
  }))

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
                Send an invitation to add a new user to your workspace.
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
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last Login</span>
          <span></span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-foreground">No users yet</p>
            <p className="text-sm text-muted-foreground">Invite a team member to get started</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-3 items-center border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                  {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{user.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  user.role === "Administrator" 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {user.role}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  user.status === "Active" 
                    ? "text-emerald-600 border-emerald-500/20" 
                    : "text-muted-foreground border-border"
                )}
              >
                {user.status}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <Clock className="h-3 w-3" />
                <span>{user.lastLogin}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function PermissionsPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Role Permissions</h3>
        <p className="text-sm text-muted-foreground">View what each role can access</p>
      </div>
      
      {rolePermissions.map((rp) => (
        <Card key={rp.role} className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", rp.role === "Administrator" ? "bg-primary/10" : "bg-muted")}>
                {rp.role === "Administrator" ? <Shield className="h-4 w-4 text-primary" /> : <Users className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div>
                <CardTitle className="text-sm">{rp.role}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{rp.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(rp.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {value ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <span className="h-4 w-4 text-muted-foreground/30">—</span>
                  )}
                  <span className={value ? "text-foreground" : "text-muted-foreground"}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
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
    </div>
  )
}

function AuditLogPanel() {
  const { data: dbAuditLogs, isLoading, error: auditError } = useAuditLogs({ limit: 50 })
  
  // Log error for debugging
  if (auditError) {
    console.error('AuditLogPanel error:', auditError)
  }

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      AUTH: "bg-sky-500/10 text-sky-600 border-sky-500/20",
      CLAIM: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      CLIENT: "bg-violet-500/10 text-violet-600 border-violet-500/20",
      SUBMISSION: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      SETTINGS: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      USER: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      DOCUMENT: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    }
    return styles[category] || "bg-muted text-muted-foreground"
  }

  // Transform database audit logs to UI format
  const auditEntries = dbAuditLogs.map(log => ({
    id: log.uuid,
    action: log.action,
    details: log.details || '',
    category: log.category,
    timestamp: new Date(log.timestamp).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    user: 'System', // TODO: Could join with user table to get the actual user name
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground mb-1">Activity Log</h3>
          <p className="text-sm text-muted-foreground">Immutable record of all system events</p>
        </div>
        <Button variant="outline" size="sm">
          <FileBarChart className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Loading audit log...</p>
            </div>
          ) : auditError ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="font-medium text-foreground">Failed to load audit log</p>
              <p className="text-sm text-muted-foreground">{auditError}</p>
            </div>
          ) : auditEntries.length === 0 ? (
            <div className="p-8 text-center">
              <ScrollText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium text-foreground">No activity yet</p>
              <p className="text-sm text-muted-foreground">System events will appear here</p>
            </div>
          ) : (
            auditEntries.map((entry) => (
              <div key={entry.id} className="flex gap-6 p-4 hover:bg-muted/30 transition-colors">
                {/* Timestamp */}
                <div className="flex-shrink-0 w-36">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {entry.timestamp}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{entry.action}</span>
                    <Badge variant="outline" className={cn("text-xs", getCategoryBadge(entry.category))}>
                      {entry.category.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function TemplateLibraryPanel() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ElementType> = {
      export: FileBarChart,
      report: FileBarChart,
      letter: FileSignature,
    }
    const Icon = icons[category] || FileBarChart
    return <Icon className="h-5 w-5 text-muted-foreground" />
  }

  const getFormatBadge = (category: string) => {
    // Map category to file format
    const formats: Record<string, string> = {
      report: "Excel",
      letter: "PDF",
      export: "XML",
    }
    return formats[category] || "Document"
  }

  const handleUploadClick = () => {
    // Simulate file selection
    setUploadedFile("sample_template.docx")
  }

  const handleSubmitRequest = () => {
    setUploadOpen(false)
    setUploadedFile(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground mb-1">Template Library</h3>
          <p className="text-sm text-muted-foreground">Centrally managed document templates</p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Request Template Addition</DialogTitle>
              <DialogDescription>
                Templates are centrally managed to ensure consistent reporting across all claims and clients.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Info Box */}
              <div className="rounded-lg border border-border p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  To request a new template, upload a sample document below. Our team will review it and add it to the library if approved. You will be notified once the template is available.
                </p>
              </div>

              {/* Upload Area */}
              <div className="space-y-2">
                <Label className="font-semibold">Upload Template File</Label>
                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium text-foreground mb-1">Click to upload</p>
                  <p className="text-sm text-muted-foreground">PDF, DOCX, XLSX, or other document formats</p>
                </div>
                
                {uploadedFile && (
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-primary bg-primary/5">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{uploadedFile}</span>
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <p className="text-xs text-muted-foreground">
                Your request will be sent to support@taxengine.io with your user details and the uploaded file.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRequest} disabled={!uploadedFile}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {getCategoryIcon(template.category)}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Category and Format Badges with Version */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                        {getFormatBadge(template.category)}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">v{template.version}</span>
                  </div>
                  
                  {/* Template Name and Description */}
                  <p className="font-medium text-foreground">{template.name}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                  
                  {/* Last Modified */}
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    Last modified: {template.lastModified}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AppearancePanel() {
  const { theme, setTheme } = useTheme()
  const [useSystemPreference, setUseSystemPreference] = useState(theme === "system")

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    if (newTheme === "system") {
      setUseSystemPreference(true)
    }
  }

  const handleSystemPreferenceToggle = (checked: boolean) => {
    setUseSystemPreference(checked)
    if (checked) {
      setTheme("system")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Appearance</h3>
        <p className="text-sm text-muted-foreground">Customize the look and feel of the application</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Theme</p>
        <p className="text-xs text-muted-foreground">Select your preferred colour scheme</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {[
          { id: "light", label: "Light", icon: Sun },
          { id: "dark", label: "Dark", icon: Moon },
          { id: "system", label: "System", icon: Monitor },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => handleThemeChange(option.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-6 rounded-lg border transition-colors",
              theme === option.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <option.icon className={cn("h-6 w-6", theme === option.id ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-sm font-medium", theme === option.id ? "text-foreground" : "text-muted-foreground")}>
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {/* System Preference Section */}
      <div className="flex items-start gap-3 pt-2">
        <Checkbox 
          id="system-preference"
          checked={useSystemPreference}
          onCheckedChange={handleSystemPreferenceToggle}
          className="mt-0.5"
        />
        <div>
          <Label htmlFor="system-preference" className="font-medium text-foreground cursor-pointer">
            System preference
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            When set to System, the application will automatically switch between light and dark mode based on your operating system settings. Your preference is saved and will persist across sessions.
          </p>
        </div>
      </div>
    </div>
  )
}

function GovernmentGatewayPanel() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-foreground mb-1">Government Gateway</h3>
        <p className="text-sm text-muted-foreground">Connect your HMRC Agent credentials to submit claims directly</p>
      </div>
      
      {/* Connection Status */}
      <Card className="border-border bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Connection Status</p>
                <p className="text-xs text-muted-foreground">Linked to HMRC Government Gateway</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Agent Credentials */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Agent User ID</Label>
          <div className="p-3 rounded-lg border border-border bg-muted/30">
            <p className="text-sm text-foreground font-mono">{governmentGateway.agentUserId}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Agent Password</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 rounded-lg border border-border bg-muted/30">
              <p className="text-sm text-foreground font-mono">
                {showPassword ? "secretpassword123" : governmentGateway.password}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="h-10 w-10"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Last Verified */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <div>
          <span className="font-medium text-foreground">Last Verified</span>
          <p className="text-xs">Credentials were last verified with HMRC on {governmentGateway.lastVerified}. Connection is active and ready for submissions.</p>
        </div>
      </div>

      {/* Submission Permissions */}
      <div className="space-y-3">
        <p className="font-semibold text-foreground">Submission Permissions</p>
        
        <div className="space-y-2">
          {submissionPermissions.map((permission) => (
            <div 
              key={permission.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{permission.name}</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
                {permission.authorised ? "Authorised" : "Not Authorised"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Disconnect Button */}
      <Button variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-500">
        <X className="h-4 w-4 mr-2" />
        Disconnect Gateway
      </Button>

      {/* Security Info Box */}
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-cyan-400 text-sm">Security & Compliance</p>
            <p className="text-xs text-muted-foreground mt-1">
              All submissions are made through official HMRC APIs using your Agent credentials. TaxEngine maintains a full audit trail of all submissions. Your credentials are encrypted at rest and in transit using industry-standard encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InvoicingPanel() {
  const pricingTiers = [
    { range: "0 - 50 claims/year", price: "£120", label: "per claim", badge: null },
    { range: "50 - 500 claims/year", price: "£75", label: "per claim", badge: "Most Common" },
    { range: "500+ claims/year", price: "£50", label: "per claim", badge: null },
  ]

  const exampleBilling = [
    { claims: "25 claims", rate: "£120", claimsCost: "£3,000", licence: "£360", total: "£3,360" },
    { claims: "150 claims", rate: "£75", claimsCost: "£11,250", licence: "£360", total: "£11,610" },
    { claims: "750 claims", rate: "£50", claimsCost: "£37,500", licence: "£360", total: "£37,860" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-foreground mb-1">Invoicing & Pricing</h3>
        <p className="text-sm text-muted-foreground">Simple, transparent pricing with no hidden fees</p>
      </div>
      
      {/* Free Trial Banner */}
      <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Check className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <p className="font-medium text-cyan-400 text-sm">Free Trial Active</p>
              <p className="text-xs text-muted-foreground">
                You have 24 days remaining on your free one-month trial. All features are fully enabled with no restrictions.
              </p>
            </div>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20">24 days left</Badge>
        </div>
      </div>

      {/* Platform Licence Card */}
      <Card className="border-border bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Platform Licence</p>
                <p className="text-sm text-muted-foreground mb-3">Monthly subscription for your organisation</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Unlimited users across your organisation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Full access to all platform features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-cyan-400" />
                    <span>No per-seat charges or user limits</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">£30</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Claim Pricing */}
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-foreground">Per-Claim Pricing</p>
          <p className="text-sm text-muted-foreground">
            Usage-based pricing that rewards volume. The more claims you process, the lower your per-claim cost.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {pricingTiers.map((tier, index) => (
            <Card 
              key={index} 
              className={cn(
                "border-border bg-muted/30 relative",
                tier.badge && "border-cyan-500"
              )}
            >
              <CardContent className="pt-6 pb-4 text-center">
                {tier.badge && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-500">
                    {tier.badge}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mb-2">{tier.range}</p>
                <p className="text-3xl font-bold text-foreground">{tier.price}</p>
                <p className="text-sm text-muted-foreground">{tier.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 py-4">
        <div className="h-5 w-5 rounded-full border border-muted-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs text-muted-foreground">i</span>
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">Deliberately Simple & Transparent</p>
          <p className="text-sm text-muted-foreground">
            There are no paywalls, no hidden pricing, and no restricted functionality within your subscription. Every user on your account has full access to every feature from day one. The platform licence covers unlimited users, and you only pay per claim based on your annual volume. That's it.
          </p>
        </div>
      </div>

      {/* Example Billing Table */}
      <div className="space-y-3 border-t border-border pt-6">
        <p className="font-semibold text-foreground">Example Billing</p>
        
        <div className="overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 py-3 text-xs font-medium text-muted-foreground border-b border-border">
            <div>Annual Claims</div>
            <div className="text-right">Per-Claim Rate</div>
            <div className="text-right">Claims Cost</div>
            <div className="text-right">Licence (Annual)</div>
            <div className="text-right">Total</div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-border">
            {exampleBilling.map((row, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 py-3 text-sm">
                <div className="text-foreground">{row.claims}</div>
                <div className="text-right text-muted-foreground">{row.rate}</div>
                <div className="text-right text-muted-foreground">{row.claimsCost}</div>
                <div className="text-right text-muted-foreground">{row.licence}</div>
                <div className="text-right font-medium text-foreground">{row.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "users"
  const [selectedSetting, setSelectedSetting] = useState<string>(initialTab)

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
      case "permissions":
        return <PermissionsPanel />
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
