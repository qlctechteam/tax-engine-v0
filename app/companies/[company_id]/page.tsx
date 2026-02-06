"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { useClaimPacks } from "@/hooks/use-supabase-data"
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Download,
  FileText,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react"

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { clientList, refetchClients } = useApp()
  
  const companyId = params.company_id as string
  const client = clientList.find(c => c.id === companyId)
  
  // UTR edit state
  const [isEditingUtr, setIsEditingUtr] = useState(false)
  const [utrValue, setUtrValue] = useState(client?.utr || "")
  const [isSavingUtr, setIsSavingUtr] = useState(false)
  
  // Handle UTR save
  const handleSaveUtr = async () => {
    if (!client) return
    
    setIsSavingUtr(true)
    try {
      const response = await fetch(`/api/clients/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utr: utrValue }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update UTR')
      }
      
      // Refresh client list to get updated data
      refetchClients()
      setIsEditingUtr(false)
    } catch (error) {
      console.error('Error saving UTR:', error)
    } finally {
      setIsSavingUtr(false)
    }
  }
  
  // Cancel UTR edit
  const handleCancelUtrEdit = () => {
    setUtrValue(client?.utr || "")
    setIsEditingUtr(false)
  }

  // Fetch claims from database
  const { data: dbClaimPacks, isLoading: isLoadingClaims } = useClaimPacks()

  // Filter and transform claims for this company
  const historicalClaims = useMemo(() => {
    if (!client) return []
    
    return dbClaimPacks
      .filter(claim => String(claim.clientCompanyId) === companyId || claim.clientCompanyUuid === companyId)
      .map(claim => ({
        id: claim.uuid,
        name: `R&D Tax Credit Claim`,
        status: claim.status === 'COMPLETED' ? 'Submitted' as const :
                claim.status === 'READY' ? 'Signed' as const :
                claim.status === 'IN_PROGRESS' ? 'In Progress' as const : 'In Progress' as const,
        submittedDate: claim.submittedAt 
          ? new Date(claim.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : null,
        yearEnd: '-',
        amount: claim.creditAmount ? `£${claim.creditAmount.toLocaleString()}` : 'TBD',
      }))
  }, [dbClaimPacks, companyId, client])

  const getStatusBadge = (status: "In Progress" | "Issued" | "Signed" | "Submitted") => {
    const styles = {
      "In Progress": "bg-amber-500/10 text-amber-600 border-amber-500/20",
      Issued: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      Signed: "bg-sky-500/10 text-sky-600 border-sky-500/20",
      Submitted: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    }
    return styles[status]
  }

  if (!client) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/companies")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Clients
        </button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Company not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back button and header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/companies")}
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
            <p className="text-muted-foreground mb-1">UTR</p>
            {isEditingUtr ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={utrValue}
                  onChange={(e) => setUtrValue(e.target.value)}
                  placeholder="Enter UTR"
                  className="h-8 w-32 font-mono text-sm"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={handleSaveUtr}
                  disabled={isSavingUtr}
                >
                  {isSavingUtr ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleCancelUtrEdit}
                  disabled={isSavingUtr}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-mono text-foreground">{client.utr || "-"}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setUtrValue(client.utr || "")
                    setIsEditingUtr(true)
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA: View Accounting Periods */}
      <div className="mb-8">
        <Button
          onClick={() => router.push(`/companies/${client.id}/periods`)}
          className="group h-11 px-6 text-sm tracking-tight text-primary-foreground font-semibold rounded-lg border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Accounting Periods
          <ChevronRight className="h-4 w-4 ml-2 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Button>
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
            {isLoadingClaims ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Loading claims...</p>
              </div>
            ) : historicalClaims.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium text-foreground">No claims yet</p>
                <p className="text-sm text-muted-foreground">Process a claim to see it here</p>
              </div>
            ) : (
              historicalClaims.map((claim) => (
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
              ))
            )}
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
