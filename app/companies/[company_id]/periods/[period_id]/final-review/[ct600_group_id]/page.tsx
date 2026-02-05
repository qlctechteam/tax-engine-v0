"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { accountingPeriodsByCompany } from "@/lib/data"
import {
  ChevronRight,
  X,
  Check,
  FileText,
  BarChart3,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
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

export default function FinalReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { clientList } = useApp()
  
  const companyId = params.company_id as string
  const periodId = params.period_id as string
  const ct600GroupId = params.ct600_group_id as string
  
  const client = clientList.find(c => c.id === companyId)
  const periods = accountingPeriodsByCompany[companyId] || []
  const period = periods.find(p => p.id === periodId)

  const currentStep = 4 // Final Review step
  
  // Validation state
  const [validationStatus, setValidationStatus] = useState<"validating" | "success" | "error">("validating")
  const [validationProgress, setValidationProgress] = useState(0)

  // Simulate HMRC validation
  useEffect(() => {
    const interval = setInterval(() => {
      setValidationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setValidationStatus("success")
          return 100
        }
        return prev + Math.random() * 10
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

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

  // Document preview cards
  const documentPreviews = [
    { id: "ct600", label: "CT600 Preview", icon: FileText },
    { id: "amendment", label: "Amendment Summary", icon: BarChart3 },
    { id: "expenditure", label: "Expenditure Report", icon: FileSpreadsheet },
  ]

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
          {/* Document Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {documentPreviews.map((doc) => {
              const Icon = doc.icon
              return (
                <Card 
                  key={doc.id} 
                  className="border-border hover:border-primary/30 transition-colors cursor-pointer min-h-[320px] flex flex-col"
                >
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
                    <Icon className="h-12 w-12 text-muted-foreground mb-4" />
                    <span className="text-sm text-muted-foreground">{doc.label}</span>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* HMRC Validation Card */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold",
                    validationStatus === "validating" 
                      ? "bg-amber-500/20 text-amber-500"
                      : validationStatus === "success"
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "bg-red-500/20 text-red-500"
                  )}>
                    {validationStatus === "success" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      "C"
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">Automatic CT600 Validation</CardTitle>
                    <CardDescription className="text-sm">
                      Validates CT600 compatibility with HMRC systems
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    validationStatus === "validating"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : validationStatus === "success"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}
                >
                  {validationStatus === "validating" ? "Validating..." : validationStatus === "success" ? "Validated" : "Error"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Validation Progress */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  {validationStatus === "validating" ? (
                    <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                  ) : validationStatus === "success" ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium text-foreground">
                    {validationStatus === "validating" 
                      ? "Validating with HMRC..." 
                      : validationStatus === "success"
                        ? "Validation Complete"
                        : "Validation Failed"
                    }
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {validationStatus === "validating"
                    ? "This may take a few moments. You can leave this page and we will notify you when complete."
                    : validationStatus === "success"
                      ? "Your CT600 has been validated successfully and is ready for signing."
                      : "There was an issue validating your CT600. Please review and try again."
                  }
                </p>
                <Progress 
                  value={validationProgress} 
                  className={cn(
                    "h-1.5",
                    validationStatus === "validating" && "[&>div]:bg-amber-500",
                    validationStatus === "success" && "[&>div]:bg-emerald-500",
                    validationStatus === "error" && "[&>div]:bg-red-500"
                  )}
                />
              </div>

              {/* Note */}
              <p className="text-xs text-muted-foreground">
                Note: This is a validation check only, not the final submission to HMRC.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Button
              onClick={() => router.push(`/companies/${companyId}/periods/${periodId}/docusign/${ct600GroupId}`)}
              disabled={validationStatus !== "success"}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Proceed to DocuSign
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
