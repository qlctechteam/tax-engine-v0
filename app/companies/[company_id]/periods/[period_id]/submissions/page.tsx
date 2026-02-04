"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { claimsByCompany, submissionsByCompany } from "@/lib/data"
import {
  ChevronLeft,
  Download,
  Send,
} from "lucide-react"

export default function SubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const { clientList } = useApp()
  
  const companyId = params.company_id as string
  const periodId = params.period_id as string
  
  const client = clientList.find(c => c.id === companyId)
  const claims = claimsByCompany[companyId] || []
  const claim = claims.find(c => c.id === periodId)
  const submissions = submissionsByCompany[companyId] || []

  if (!client || !claim) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/companies")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Not found</p>
        </div>
      </div>
    )
  }

  const handleDownloadReceipt = (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId)
    if (submission) {
      const filename = `HMRC_Receipt_${client.name.replace(/\s+/g, '_')}_${submission.title.replace(/\s+/g, '_')}.pdf`
      alert(`Downloading: ${filename}`)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back button and header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/companies/${companyId}/periods/${periodId}`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {claim.title}
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Submissions</h2>
            <p className="text-muted-foreground">{client.name} • {claim.period}</p>
          </div>
          <Button
            className="group h-9 px-4 text-sm tracking-tight text-primary-foreground font-semibold rounded-lg border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
          >
            <Send className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </div>
      </div>

      {/* Submissions Table */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Submission History</h3>
        
        <div className="rounded-lg border border-border overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-8 text-center">
              <Send className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium text-foreground">No submissions yet</p>
              <p className="text-sm text-muted-foreground">
                Submit this claim to HMRC when ready
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Submission</span>
                <span>Date Submitted</span>
                <span>Status</span>
                <span>Receipt</span>
              </div>
              
              {/* Table Rows */}
              <div className="divide-y divide-border">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{submission.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{submission.packRef}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{submission.submittedAt}</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "w-fit text-xs",
                        submission.status === "Submitted" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}
                    >
                      {submission.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDownloadReceipt(submission.id)}
                      title={`Download HMRC Receipt`}
                      disabled={submission.status === "Draft"}
                    >
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
