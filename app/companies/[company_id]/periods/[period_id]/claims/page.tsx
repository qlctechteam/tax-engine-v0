"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { accountingPeriodsByCompany, stages, getStageFromNext, type AccountingPeriod } from "@/lib/data"
import { type ProcessorStep, type UploadedFile, type HMRCValidationResult } from "@/lib/types"
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  ScanSearch,
  FileSpreadsheet,
  CheckCircle,
  SendHorizontal,
  Check,
  FileText,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Calendar,
  FileUp,
  X,
} from "lucide-react"

export default function ClaimsWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const { clientList, addNotification } = useApp()
  
  const companyId = params.company_id as string
  const periodId = params.period_id as string
  
  const client = clientList.find(c => c.id === companyId)
  const periods = accountingPeriodsByCompany[companyId] || []
  const period = periods.find(p => p.id === periodId)

  const currentStage = 1 // Default to first stage
  
  // Processor state
  const [currentStep, setCurrentStep] = useState<ProcessorStep>("scan-ct600")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState(0)
  
  // HMRC Validation state
  const [hmrcValidation, setHmrcValidation] = useState<HMRCValidationResult>({ status: "pending" })

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

  // Handle file upload
  const handleFileUpload = (type: "ct600" | "expenditure") => {
    const newFile: UploadedFile = {
      id: `file-${Date.now()}`,
      name: type === "ct600" ? "CT600_2024.pdf" : "Expenditure_Report.xlsx",
      type,
      uploadedAt: new Date().toLocaleString(),
    }
    setUploadedFiles(prev => [...prev, newFile])
    setSelectedFiles(prev => [...prev, newFile.id])
  }

  // Handle processing
  const handleStartProcessing = () => {
    if (selectedFiles.length === 0) return
    setIsProcessing(true)
    setCurrentStep("extracting")
    
    // Simulate extraction progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setIsProcessing(false)
        setCurrentStep("review-info")
      }
      setExtractionProgress(progress)
    }, 500)
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

  if (!period) {
    return (
      <div className="container mx-auto p-6 lg:p-8">
        <button
          onClick={() => router.push(`/companies/${companyId}/periods`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Periods
        </button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Accounting period not found</p>
        </div>
      </div>
    )
  }

  const icons = [Upload, ScanSearch, FileSpreadsheet, CheckCircle, SendHorizontal]

  return (
    <div className="container mx-auto p-6 lg:p-8">
      {/* Back button and header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/companies/${companyId}/periods/${periodId}`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Period Workspace
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Claim Processing</h2>
            <p className="text-muted-foreground">{client.name} • {period.periodStart} - {period.periodEnd}</p>
          </div>
          <Badge variant="outline" className={cn("text-sm", getStatusBadge(period.status))}>
            {period.status}
          </Badge>
        </div>
      </div>

      {/* Workflow Progress Bar */}
      <div className="w-full bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const Icon = icons[index]
            const isActive = stage.id === currentStage
            const isCompleted = stage.id < currentStage
            const isLast = index === stages.length - 1

            return (
              <div key={stage.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium text-center max-w-20",
                      isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-all",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Step Content */}
      {currentStep === "scan-ct600" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanSearch className="h-5 w-5 text-primary" />
              Scan & Extract CT600
            </CardTitle>
            <CardDescription>
              Upload your CT600 and expenditure documents to begin extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Areas */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleFileUpload("ct600")}
              >
                <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-foreground mb-1">Upload CT600</p>
                <p className="text-sm text-muted-foreground">PDF or XML format</p>
              </div>
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleFileUpload("expenditure")}
              >
                <FileUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-foreground mb-1">Upload Numbers</p>
                <p className="text-sm text-muted-foreground">Excel spreadsheet</p>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Uploaded Files</p>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      selectedFiles.includes(file.id)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.uploadedAt}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Process Button */}
            <Button
              onClick={handleStartProcessing}
              disabled={uploadedFiles.length === 0}
              className="w-full sm:w-auto"
            >
              <ScanSearch className="h-4 w-4 mr-2" />
              Start Extraction
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === "extracting" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              Extracting Data
            </CardTitle>
            <CardDescription>
              Processing your documents and extracting structured data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={extractionProgress} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(extractionProgress)}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "review-info" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Extraction Complete
            </CardTitle>
            <CardDescription>
              Review the extracted data before proceeding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Check className="h-4 w-4" />
                <span className="font-medium text-sm">Data extracted successfully</span>
              </div>
              <p className="text-xs text-muted-foreground">
                47 line items extracted from uploaded documents
              </p>
            </div>
            
            <Button
              onClick={() => setCurrentStep("adjustments")}
            >
              Continue to Adjustments
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {(currentStep === "adjustments" || currentStep === "final-review" || currentStep === "docusign" || currentStep === "submission") && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {currentStep === "adjustments" && "Make Adjustments"}
              {currentStep === "final-review" && "Final Review"}
              {currentStep === "docusign" && "DocuSign"}
              {currentStep === "submission" && "Submit to HMRC"}
            </CardTitle>
            <CardDescription>
              {currentStep === "adjustments" && "Review and adjust the extracted data as needed"}
              {currentStep === "final-review" && "Review all data before submission"}
              {currentStep === "docusign" && "Send for digital signature"}
              {currentStep === "submission" && "Submit the CT600 to HMRC"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                const steps: ProcessorStep[] = ["adjustments", "final-review", "docusign", "submission"]
                const currentIndex = steps.indexOf(currentStep)
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1])
                }
              }}
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <span className="text-2xl font-bold text-foreground">0%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={0} className="h-3" />
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Next step:</span> Scan CT600
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
