"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import {
  Search,
  ChevronRight,
  FileText,
  Download,
} from "lucide-react"

export default function SubmissionsPage() {
  const router = useRouter()
  const { clientList } = useApp()
  
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

  const handleCompanyClick = (companyName: string) => {
    const matchingClient = clientList?.find(c => c.name === companyName)
    if (matchingClient) {
      router.push(`/companies/${matchingClient.id}`)
    }
  }

  const handleDownloadReceipt = (claim: { company: string; claimName: string }) => {
    // Generate receipt filename based on company and claim
    const filename = `HMRC_Receipt_${claim.company.replace(/\s+/g, '_')}_${claim.claimName.replace(/\s+/g, '_')}.pdf`
    // In production, this would fetch the actual receipt from storage
    // For demo, we simulate a download
    alert(`Downloading: ${filename}`)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-background">
      <div className="container mx-auto p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Submissions</h1>
          <Dialog open={startSubmissionOpen} onOpenChange={(open) => {
            setStartSubmissionOpen(open)
            if (!open) setSearchQuery("")
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="group h-9 px-4 text-sm tracking-tight font-semibold rounded-lg">
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

        <h2 className="text-lg font-semibold text-foreground">Submitted claims</h2>

        {/* White card - table header is top of card */}
        <div className="bg-card border border-border shadow-[var(--shadow-elevation-low)] rounded-xl overflow-hidden pt-0 pb-0">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_120px_100px_80px] gap-4 px-6 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide rounded-t-xl">
            <span>Company</span>
            <span>Claim</span>
            <span>Date Submitted</span>
            <span>Status</span>
            <span className="text-center">Receipt</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border">
            {submittedClaims.map((claim) => {
              const matchingClient = clientList?.find(c => c.name === claim.company)
              return (
                <div
                  key={claim.id}
                  className="grid grid-cols-[1fr_1fr_120px_100px_80px] gap-4 px-6 py-3 items-center hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <button
                      onClick={() => handleCompanyClick(claim.company)}
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
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDownloadReceipt(claim)}
                      title={`Download HMRC Receipt for ${claim.company}`}
                    >
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
