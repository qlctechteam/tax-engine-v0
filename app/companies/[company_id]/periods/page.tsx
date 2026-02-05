"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { accountingPeriodsByCompany, type AccountingPeriod } from "@/lib/data"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  Calendar,
  User,
} from "lucide-react"

export default function PeriodsPage() {
  const params = useParams()
  const router = useRouter()
  const { clientList } = useApp()
  
  const companyId = params.company_id as string
  const client = clientList.find(c => c.id === companyId)
  const periods = accountingPeriodsByCompany[companyId] || []

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
      <div className="container mx-auto p-6 lg:p-8">
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
            className="group h-9 px-4 text-sm tracking-tight text-primary-foreground font-semibold rounded-lg border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Period
          </Button>
        </div>
      </div>

      {/* Accounting Periods List */}
      <div className="space-y-4">
        {periods.length === 0 ? (
          <div className="rounded-lg border border-border p-8 text-center">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-foreground mb-1">No accounting periods</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new accounting period to get started with claims processing.
            </p>
            <Button size="sm">
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
    </div>
  )
}
