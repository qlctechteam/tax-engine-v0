"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { getRecentClaims, accountingPeriodsByCompany, type AccountingPeriod } from "@/lib/data"
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Building2,
  Check,
} from "lucide-react"

export default function ClaimsPage() {
  const router = useRouter()
  const { clientList } = useApp()
  
  // Start Claim Dialog State
  const [startClaimOpen, setStartClaimOpen] = useState(false)
  const [selectedClientForClaim, setSelectedClientForClaim] = useState<{ id: string; name: string; number: string } | null>(null)
  const [showYearEndSelection, setShowYearEndSelection] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<AccountingPeriod | null>(null)
  
  // Get accounting periods for selected client
  const clientPeriods = useMemo(() => {
    if (!selectedClientForClaim) return []
    return accountingPeriodsByCompany[selectedClientForClaim.id] || []
  }, [selectedClientForClaim])

  // Get recent claims from accounting periods data
  const recentClaims = useMemo(() => getRecentClaims(), [])

  const getStatusBadge = (status: AccountingPeriod["status"]) => {
    const styles = {
      "In Progress": "bg-amber-500/10 text-amber-600 border-amber-500/20",
      "Proofing": "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "Signed": "bg-sky-500/10 text-sky-600 border-sky-500/20",
      "Issued": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      "Submitted": "bg-violet-500/10 text-violet-600 border-violet-500/20",
    }
    return styles[status]
  }

  const handleStartClaim = () => {
    setStartClaimOpen(true)
    setSelectedClientForClaim(null)
    setShowYearEndSelection(false)
    setSelectedPeriod(null)
  }

  const handleSelectClientForClaim = (client: { id: string; name: string; number: string }) => {
    setSelectedClientForClaim(client)
    setShowYearEndSelection(true)
    setSelectedPeriod(null)
  }

  const handleSelectPeriod = (period: AccountingPeriod) => {
    setSelectedPeriod(period)
  }

  const handleProcessClaim = () => {
    if (selectedClientForClaim && selectedPeriod) {
      setStartClaimOpen(false)
      // Navigate directly to the selected accounting period
      router.push(`/companies/${selectedClientForClaim.id}/periods/${selectedPeriod.id}`)
    }
  }

  return (
    <div className="p-6 lg:p-8 container mx-auto">
      <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-foreground">Claims</h1>
      {/* Primary CTA - Start Claim */}
      <div>
        <Dialog open={startClaimOpen} onOpenChange={setStartClaimOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="group h-9 px-4 text-sm tracking-tight text-primary-foreground font-semibold rounded-lg border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary animate-cta-breathe hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
              onClick={handleStartClaim}
            >
              <span>Start New Claim</span>
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
                  {clientPeriods.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No accounting periods found for this client.</p>
                      <p className="text-sm mt-1">Create a new period to get started.</p>
                    </div>
                  ) : (
                    clientPeriods.map((period) => (
                      <div
                        key={period.id}
                        onClick={() => handleSelectPeriod(period)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-lg border text-left transition-colors cursor-pointer",
                          selectedPeriod?.id === period.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <div>
                          <p className="font-semibold text-foreground">{period.yearEnd}</p>
                          <p className="text-sm text-muted-foreground">{period.periodStart} - {period.periodEnd}</p>
                          {period.status !== "Submitted" && (
                            <Badge variant="outline" className={cn("mt-1 text-xs", getStatusBadge(period.status))}>
                              {period.status}
                            </Badge>
                          )}
                        </div>
                        {selectedPeriod?.id === period.id ? (
                          <Check className="h-5 w-5 text-primary" />
                        ) : (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectPeriod(period)
                            }}
                          >
                            Process Claim
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              {showYearEndSelection && selectedPeriod && (
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
              <button
                key={claim.id}
                onClick={() => router.push(`/companies/${claim.companyId}/periods/${claim.id}`)}
                className="w-full grid grid-cols-[1fr_140px_100px_100px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer text-left"
              >
                <span className="font-medium text-foreground truncate">{claim.companyName}</span>
                <span className="text-sm text-muted-foreground truncate">{claim.processedBy || "-"}</span>
                <span className="text-sm text-muted-foreground">{claim.yearEnd}</span>
                <Badge variant="outline" className={cn("w-fit text-xs", getStatusBadge(claim.status))}>
                  {claim.status}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
