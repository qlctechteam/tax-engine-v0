"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { accountingPeriodsByCompany, type AccountingPeriod } from "@/lib/data"
import { type UploadedFile } from "@/lib/types"
import {
  ChevronRight,
  Upload,
  FileSpreadsheet,
  Check,
  FileText,
  X,
  Sparkles,
} from "lucide-react"

// Workflow steps for the claim processor
const workflowSteps = [
  { id: 1, label: "Scan CT600", description: "Upload and scan CT600 documents" },
  { id: 2, label: "Review", description: "Review extracted data" },
  { id: 3, label: "Adjustments", description: "Make any necessary adjustments" },
  { id: 4, label: "Final Review", description: "Final review before signing" },
  { id: 5, label: "DocuSign", description: "Send for digital signature" },
  { id: 6, label: "Submit", description: "Submit to HMRC" },
]

export default function PeriodWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const { clientList } = useApp()
  
  const companyId = params.company_id as string
  const periodId = params.period_id as string
  
  const client = clientList.find(c => c.id === companyId)
  const periods = accountingPeriodsByCompany[companyId] || []
  const period = periods.find(p => p.id === periodId)

  // Processor state
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState(0)

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

  // Generate dynamic filename based on company and period
  const generateFileName = (type: "ct600" | "expenditure") => {
    const companyName = client?.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "") || "Company"
    const yearEnd = period?.yearEnd.replace(/\s+/g, "_") || "Period"
    
    if (type === "ct600") {
      return `CT600_${companyName}_${yearEnd}.pdf`
    } else {
      return `QualifyingExpenditure_${yearEnd}.xlsx`
    }
  }

  // Handle file upload
  const handleFileUpload = (type: "ct600" | "expenditure") => {
    // Check if file of this type already exists
    const existingFile = uploadedFiles.find(f => f.type === type)
    if (existingFile) return // Don't add duplicate

    const now = new Date()
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, "/")
    const formattedTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    const newFile: UploadedFile = {
      id: `file-${Date.now()}`,
      name: generateFileName(type),
      type,
      uploadedAt: `${formattedDate}, ${formattedTime}`,
    }
    setUploadedFiles(prev => [...prev, newFile])
    setSelectedFileIds(prev => [...prev, newFile.id])
  }

  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  // Handle processing
  const handleStartProcessing = () => {
    if (selectedFileIds.length === 0) return
    setIsProcessing(true)
    
    // Simulate extraction progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setIsProcessing(false)
        // Generate a mock alpha dataset ID and navigate to review page
        const alphaDatasetId = `alpha-${Date.now()}`
        router.push(`/companies/${companyId}/periods/${periodId}/review/${alphaDatasetId}`)
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
          <X className="h-4 w-4" />
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
          <X className="h-4 w-4" />
          Back to Periods
        </button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Accounting period not found</p>
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
                onClick={() => router.push(`/companies/${companyId}/periods`)}
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
                    <span className={cn(
                      "flex items-center justify-center h-5 w-5 rounded text-xs font-semibold",
                      isActive
                        ? "bg-primary-foreground/20"
                        : isCompleted
                          ? "bg-primary/20"
                          : "bg-muted-foreground/20"
                    )}>
                      {step.id}
                    </span>
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
          {/* Step 1: Scan CT600 */}
          {currentStep === 1 && !isProcessing && (
            <div className="space-y-6">
              {/* Upload Areas */}
              <div className="grid sm:grid-cols-2 gap-6">
                {/* CT600 Upload */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">CT600 Document</CardTitle>
                        <CardDescription className="text-sm">Upload the CT600 PDF for this period</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                        uploadedFiles.some(f => f.type === "ct600")
                          ? "border-primary/30 bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      )}
                      onClick={() => handleFileUpload("ct600")}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium text-foreground mb-1">Click to upload CT600 PDF</p>
                      <p className="text-sm text-muted-foreground">or drag and drop</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Expenditure Upload */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Qualifying Expenditure</CardTitle>
                        <CardDescription className="text-sm">Upload the Excel expenditure report</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                        uploadedFiles.some(f => f.type === "expenditure")
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border hover:border-emerald-500/50 hover:bg-muted/30"
                      )}
                      onClick={() => handleFileUpload("expenditure")}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium text-foreground mb-1">Click to upload Excel file</p>
                      <p className="text-sm text-muted-foreground">or drag and drop</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Uploaded Documents Section */}
              {uploadedFiles.length > 0 && (
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Uploaded Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {uploadedFiles.map((file) => {
                      const isSelected = selectedFileIds.includes(file.id)
                      return (
                        <div
                          key={file.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                            isSelected
                              ? file.type === "ct600"
                                ? "bg-primary/10 border-primary/20"
                                : "bg-emerald-500/10 border-emerald-500/20"
                              : "border-border hover:bg-muted/30"
                          )}
                        >
                          <Checkbox
                            id={file.id}
                            checked={isSelected}
                            onCheckedChange={() => toggleFileSelection(file.id)}
                            className="h-5 w-5"
                          />
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            isSelected
                              ? file.type === "ct600"
                                ? "bg-primary/10"
                                : "bg-emerald-500/10"
                              : "bg-muted"
                          )}>
                            {file.type === "ct600" ? (
                              <FileText className={cn(
                                "h-5 w-5",
                                isSelected
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )} />
                            ) : (
                              <FileSpreadsheet className={cn(
                                "h-5 w-5",
                                isSelected
                                  ? "text-emerald-600"
                                  : "text-muted-foreground"
                              )} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">Uploaded: {file.uploadedAt}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs flex-shrink-0",
                              file.type === "ct600" 
                                ? "bg-primary/10 text-primary border-primary/20" 
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            )}
                          >
                            {file.type === "ct600" ? "CT600" : "Expenditure"}
                          </Badge>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Process Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleStartProcessing}
                  disabled={selectedFileIds.length === 0}
                  className="group h-11 px-6 text-sm tracking-tight text-primary-foreground font-semibold rounded-lg border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Read Documents
                </Button>
              </div>
            </div>
          )}

          {/* Processing State - Full screen modal */}
          {isProcessing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <Card className="w-full max-w-lg mx-4 border-border">
                <CardContent className="pt-12 pb-10 px-8">
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center">
                      <FileSpreadsheet className="h-10 w-10 text-primary-foreground" />
                    </div>
                    
                    {/* Title and description */}
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-foreground">Extracting CT600</h2>
                      <p className="text-muted-foreground">
                        Reading and preparing your dataset for review
                      </p>
                    </div>
                    
                    {/* Progress */}
                    <div className="w-full space-y-3">
                      <Progress value={extractionProgress} className="h-2" />
                      <p className="text-lg font-semibold text-foreground">
                        {Math.round(extractionProgress)}%
                      </p>
                    </div>
                    
                    {/* Warning */}
                    <p className="text-sm text-muted-foreground">
                      Please do not refresh or navigate away from this page.
                    </p>
                    
                    {/* Divider */}
                    <div className="w-full border-t border-border" />
                    
                    {/* Additional info */}
                    <p className="text-sm text-muted-foreground/70">
                      We are scanning your CT600 document and extracting R&D qualifying expenditure data. This typically takes a few moments.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
