"use client"

import { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { useAccountingPeriods, useClientCompany } from "@/hooks/use-supabase-data"
import { type AccountingPeriod } from "@/lib/data"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  Calendar,
  User,
  Loader2,
} from "lucide-react"

export default function PeriodsPage() {
  const params = useParams()
  const router = useRouter()
  const { clientList } = useApp()
  
  const companyId = params.company_id as string
  const client = clientList.find(c => c.id === companyId)
  
  // Fetch company details to get year end
  const { data: dbCompany } = useClientCompany(companyId)
  
  // Fetch accounting periods from database
  const { data: dbPeriods, isLoading: isLoadingPeriods, refetch: refetchPeriods } = useAccountingPeriods(companyId)
  
  // Modal state
  const [showNewPeriodModal, setShowNewPeriodModal] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  
  // Auto-fill end date based on company year end
  useEffect(() => {
    if (showNewPeriodModal && dbCompany?.companyYearEndMonth && dbCompany?.companyYearEndDay) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      
      // Calculate next year end from today
      const thisYearEnd = new Date(currentYear, dbCompany.companyYearEndMonth - 1, dbCompany.companyYearEndDay)
      let nextYearEnd = thisYearEnd
      
      if (currentDate > thisYearEnd) {
        // If we've passed this year's year end, use next year's
        nextYearEnd = new Date(currentYear + 1, dbCompany.companyYearEndMonth - 1, dbCompany.companyYearEndDay)
      }
      
      // Calculate start date (day after previous year end)
      const periodStartDate = new Date(nextYearEnd)
      periodStartDate.setFullYear(periodStartDate.getFullYear() - 1)
      periodStartDate.setDate(periodStartDate.getDate() + 1)
      
      // Format as YYYY-MM-DD for input
      const formatDateForInput = (date: Date) => {
        return date.toISOString().split('T')[0]
      }
      
      setEndDate(formatDateForInput(nextYearEnd))
      setStartDate(formatDateForInput(periodStartDate))
    }
  }, [showNewPeriodModal, dbCompany])
  
  // Reset modal state
  const resetModal = () => {
    setStartDate("")
    setEndDate("")
    setCreateError(null)
    setShowNewPeriodModal(false)
  }
  
  // Handle create period
  const handleCreatePeriod = async () => {
    if (!startDate || !endDate) {
      setCreateError("Please select both start and end dates")
      return
    }
    
    setIsCreating(true)
    setCreateError(null)
    
    try {
      const response = await fetch('/api/accounting-periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientCompanyUuid: companyId,
          startDate,
          endDate,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create period')
      }
      
      // Refresh the periods list
      refetchPeriods()
      resetModal()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create period')
    } finally {
      setIsCreating(false)
    }
  }
  
  // Transform database periods to UI format
  const periods = useMemo(() => {
    return dbPeriods.map(p => ({
      id: p.uuid,
      companyId: String(p.clientCompanyId),
      yearEnd: p.endDate ? new Date(p.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '-',
      yearEndDate: p.endDate ? new Date(p.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
      periodStart: p.startDate ? new Date(p.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
      periodEnd: p.endDate ? new Date(p.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
      status: (p.status as AccountingPeriod['status']) || 'In Progress',
    }))
  }, [dbPeriods])

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
          onClick={() => router.push(`/companies/${companyId}`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {client.name}
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Accounting Periods</h2>
            <p className="text-muted-foreground">{client.name}</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowNewPeriodModal(true)}
            className="group h-9 px-4 text-sm tracking-tight text-primary-foreground font-semibold rounded-lg border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Period
          </Button>
        </div>
      </div>

      {/* Accounting Periods List */}
      <div className="space-y-4">
        {isLoadingPeriods ? (
          <div className="rounded-lg border border-border p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Loading periods...</p>
          </div>
        ) : periods.length === 0 ? (
          <div className="rounded-lg border border-border p-8 text-center">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-foreground mb-1">No accounting periods</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new accounting period to get started with claims processing.
            </p>
            <Button size="sm" onClick={() => setShowNewPeriodModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Period
            </Button>
          </div>
        ) : (
          periods.map((period) => (
            <button
              key={period.id}
              onClick={() => router.push(`/companies/${companyId}/periods/${period.id}`)}
              className="w-full text-left rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Year End: {period.yearEnd}</p>
                    <p className="text-sm text-muted-foreground">{period.periodStart} - {period.periodEnd}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn("text-xs", getStatusBadge(period.status))}>
                    {period.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-4 text-sm">
                  {period.processedBy && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>{period.processedBy}</span>
                    </div>
                  )}
                </div>
                {period.amount && (
                  <p className={cn(
                    "font-semibold",
                    period.amount === "TBD" ? "text-muted-foreground" : "text-emerald-600"
                  )}>
                    {period.amount}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
      
      {/* New Period Modal */}
      <Dialog open={showNewPeriodModal} onOpenChange={setShowNewPeriodModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Accounting Period</DialogTitle>
            <DialogDescription>
              Add a new accounting period for {client?.name || 'this company'}.
              {dbCompany?.companyYearEndMonth && dbCompany?.companyYearEndDay && (
                <span className="block mt-1 text-xs">
                  Company year end: {dbCompany.companyYearEndDay}/{dbCompany.companyYearEndMonth}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Year End)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            {createError && (
              <p className="text-sm text-destructive">{createError}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetModal}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePeriod}
              disabled={isCreating || !startDate || !endDate}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Period
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
