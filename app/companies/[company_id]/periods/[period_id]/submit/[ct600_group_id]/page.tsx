"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { accountingPeriodsByCompany } from "@/lib/data"
import {
  ChevronRight,
  X,
  Check,
  CheckCircle,
  Send,
  Loader2,
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

export default function SubmitPage() {
  const params = useParams()
  const router = useRouter()
  const { clientList } = useApp()
  
  const companyId = params.company_id as string
  const periodId = params.period_id as string
  const ct600GroupId = params.ct600_group_id as string
  
  const client = clientList.find(c => c.id === companyId)
  const periods = accountingPeriodsByCompany[companyId] || []
  const period = periods.find(p => p.id === periodId)

  const currentStep = 6 // Submit step
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 3000)
  }

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
          <div className="flex items-center justify-between mb-4">
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
          <div className="flex items-center gap-2">
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
                    <span className="hidden sm:inline">{step.label}</span>
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
            <h3 className="text-2xl font-bold text-foreground">Submit to HMRC</h3>
            <p className="text-muted-foreground">
              Final submission of the R&D claim via Government Gateway
            </p>
          </div>

          {/* Submission Card */}
          <Card className="border-border mb-8">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center text-center">
                {/* Status Icon */}
                <div className={cn(
                  "h-20 w-20 rounded-full flex items-center justify-center mb-6",
                  isSubmitted 
                    ? "bg-emerald-500/20" 
                    : "bg-emerald-500/10 border-2 border-emerald-500/30"
                )}>
                  {isSubmitting ? (
                    <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                  ) : (
                    <CheckCircle className={cn(
                      "h-10 w-10",
                      isSubmitted ? "text-emerald-500" : "text-emerald-500/70"
                    )} />
                  )}
                </div>

                {/* Status Text */}
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  {isSubmitting 
                    ? "Submitting to HMRC..." 
                    : isSubmitted 
                      ? "Submission Complete" 
                      : "Ready for Submission"
                  }
                </h4>
                <p className="text-muted-foreground mb-6">
                  {isSubmitting
                    ? "Please wait while we submit your claim to HMRC."
                    : isSubmitted
                      ? "Your R&D claim has been successfully submitted to HMRC."
                      : "All documents have been prepared and signed. Click below to submit to HMRC."
                  }
                </p>

                {/* Details */}
                <div className="w-full max-w-md grid grid-cols-2 gap-4 text-left mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Company</p>
                    <p className="font-medium text-foreground">{client.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">UTR</p>
                    <p className="font-medium text-foreground">{client.utr || "1234567890"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Period</p>
                    <p className="font-medium text-foreground">{period.periodStart} - {period.periodEnd}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Estimated Credit</p>
                    <p className="font-medium text-emerald-600">£31,250</p>
                  </div>
                </div>

                {/* Submit Button */}
                {!isSubmitted && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit to HMRC
                      </>
                    )}
                  </Button>
                )}

                {isSubmitted && (
                  <Button
                    onClick={() => router.push(`/companies/${companyId}/periods`)}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 h-11 px-6"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done - Return to Periods
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          {!isSubmitted && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/companies/${companyId}/periods/${periodId}/docusign/${ct600GroupId}`)}
              >
                Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
