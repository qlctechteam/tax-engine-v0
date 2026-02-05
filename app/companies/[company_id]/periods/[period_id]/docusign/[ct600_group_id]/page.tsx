"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { accountingPeriodsByCompany } from "@/lib/data"
import {
  ChevronRight,
  X,
  Check,
  FileText,
  Mail,
  Send,
  Play,
} from "lucide-react"

// Workflow steps for the claim processor
const workflowSteps = [
  { id: 1, label: "Scan CT600" },
  { id: 2, label: "Review" },
  { id: 3, label: "Adjustments" },
  { id: 4, label: "Final Review" },
  { id: 5, label: "DocuSign" },
  { id: 6, label: "Submit" },
]

export default function DocuSignPage() {
  const params = useParams()
  const router = useRouter()
  const { clientList } = useApp()
  
  const companyId = params.company_id as string
  const periodId = params.period_id as string
  const ct600GroupId = params.ct600_group_id as string
  
  const client = clientList.find(c => c.id === companyId)
  const periods = accountingPeriodsByCompany[companyId] || []
  const period = periods.find(p => p.id === periodId)

  const currentStep = 5 // DocuSign step
  
  // Form state
  const [recipientEmail, setRecipientEmail] = useState(client?.contactEmail || "john@alpharobotics.com")
  const [estimatedCredit, setEstimatedCredit] = useState("31,250")
  const [docuSignSent, setDocuSignSent] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  if (!client || !period) {
    return (
      <div className="container mx-auto p-6 lg:p-8">
        <button
          onClick={() => router.push("/companies")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <X className="h-4 w-4" />
          Back
        </button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Data not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="container mx-auto p-6 lg:p-8">
          {/* Back button and header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/companies/${companyId}/periods/${periodId}`)}
                className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{client.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Year End: {period.yearEnd} ({period.periodStart} - {period.periodEnd})
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Processing
            </Badge>
          </div>

          {/* Workflow Progress Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {workflowSteps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep
              const isLast = index === workflowSteps.length - 1

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className={cn(
                        "flex items-center justify-center h-5 w-5 rounded text-xs font-semibold",
                        isActive
                          ? "bg-primary-foreground/20"
                          : "bg-muted-foreground/20"
                      )}>
                        {step.id}
                      </span>
                    )}
                    <span className={isActive ? "inline" : "hidden sm:inline"}>{step.label}</span>
                  </div>
                  {!isLast && (
                    <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/40 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto p-6 lg:p-8">
        <div className="">
          {/* Page Header */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground">Issue Documents</h3>
            <p className="text-muted-foreground">
              Send documents via DocuSign and email estimate to client
            </p>
          </div>

          {/* DocuSign Documents Card */}
          <Card className="border-border mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">DocuSign Documents</CardTitle>
                  <CardDescription className="text-sm">
                    Send the claim documents for digital signature
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">R&D Claim Documentation Pack</p>
                    <p className="text-sm text-muted-foreground">Includes CT600 amendment and supporting documents</p>
                  </div>
                </div>
                <Button
                  variant={docuSignSent ? "outline" : "default"}
                  onClick={() => setDocuSignSent(true)}
                  disabled={docuSignSent}
                  className={docuSignSent ? "text-emerald-600 border-emerald-500/20" : ""}
                >
                  {docuSignSent ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Send via DocuSign
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Client Estimate Email Card */}
          <Card className="border-border mb-8">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Client Estimate Email</CardTitle>
                  <CardDescription className="text-sm">
                    Send the R&D tax credit estimate to the client
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Recipient</Label>
                  <Input
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Estimated Credit</Label>
                  <Input
                    value={`£${estimatedCredit}`}
                    onChange={(e) => setEstimatedCredit(e.target.value.replace(/[£,]/g, ""))}
                    className="bg-muted/50 border-border font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant={emailSent ? "outline" : "secondary"}
                  onClick={() => setEmailSent(true)}
                  disabled={emailSent}
                  className={emailSent ? "text-emerald-600 border-emerald-500/20" : ""}
                >
                  {emailSent ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Estimate Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/companies/${companyId}/periods/${periodId}/final-review/${ct600GroupId}`)}
            >
              Back
            </Button>
            <Button
              onClick={() => router.push(`/companies/${companyId}/periods/${periodId}/submit/${ct600GroupId}`)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue to Submission
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
