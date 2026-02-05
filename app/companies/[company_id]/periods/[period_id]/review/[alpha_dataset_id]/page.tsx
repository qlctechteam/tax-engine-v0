"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { accountingPeriodsByCompany, type AccountingPeriod } from "@/lib/data"
import {
  ChevronRight,
  X,
  Check,
  AlertCircle,
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

// Mock CT600 alpha dataset values - these would come from the database
const mockCT600Values: Record<string, string> = {
  "145": "50,043",
  "150": "0",
  "155": "0",
  "160": "0",
  "165": "0",
  "170": "8",
  "175": "0",
  "180": "0",
  "185": "0",
  "190": "1,447",
  "195": "0",
  "200": "0",
  "205": "0",
  "210": "0",
  "215": "48,596",
  "220": "0",
  "225": "0",
  "230": "0",
  "235": "9,234",
  "240": "0",
  "245": "0",
  "250": "0",
  "255": "0",
  "260": "0",
  "265": "0",
  "270": "0",
  "275": "0",
  "280": "0",
  "285": "0",
  "290": "0",
  "295": "0",
  "300": "0",
  "305": "0",
  "310": "0",
  "315": "0",
  "320": "0",
  "325": "0",
  "330": "0",
  "335": "0",
  "340": "0",
  "345": "0",
  "350": "0",
  "355": "0",
  "360": "0",
  "365": "0",
  "370": "0",
  "375": "0",
  "380": "0",
  "385": "0",
  "390": "0",
  "395": "0",
  "400": "0",
  "405": "0",
  "410": "0",
}

// CT600 Box numbers in order
const ct600BoxNumbers = Object.keys(mockCT600Values).sort((a, b) => parseInt(a) - parseInt(b))

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { clientList } = useApp()
  
  const companyId = params.company_id as string
  const periodId = params.period_id as string
  const alphaDatasetId = params.alpha_dataset_id as string
  
  const client = clientList.find(c => c.id === companyId)
  const periods = accountingPeriodsByCompany[companyId] || []
  const period = periods.find(p => p.id === periodId)

  const currentStep = 2 // Review step
  
  // Editable CT600 values
  const [ct600Values, setCT600Values] = useState<Record<string, string>>(mockCT600Values)

  const handleValueChange = (boxNumber: string, value: string) => {
    setCT600Values(prev => ({
      ...prev,
      [boxNumber]: value
    }))
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Review CT600</h3>
              <p className="text-muted-foreground text-sm">
                Verify OCR extracted values against the uploaded document
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                SME
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                LOSS
              </Badge>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - CT600 Boxes */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">CT600 Boxes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-380px)]">
                  <div className="space-y-2 pr-4">
                    {ct600BoxNumbers.map((boxNumber) => (
                      <div
                        key={boxNumber}
                        className="flex items-center gap-4"
                      >
                        <span className="text-sm text-muted-foreground w-10 text-right font-mono">
                          {boxNumber}
                        </span>
                        <Input
                          value={ct600Values[boxNumber] || ""}
                          onChange={(e) => handleValueChange(boxNumber, e.target.value)}
                          className="font-mono bg-muted/50 border-border h-9"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Right Column - CT600 Document Preview */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">CT600 Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      No page at /placeholder-ct600.pdf detected. You can select a route below.
                    </span>
                  </div>
                </div>
                
                {/* File tree placeholder */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ChevronRight className="h-4 w-4" />
                    <span>📁 app</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground ml-6">
                    <span>📄 page</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => router.push(`/companies/${companyId}/periods/${periodId}/adjustments/${alphaDatasetId}`)}
              className="group h-11 px-6 text-sm tracking-tight text-primary-foreground font-semibold rounded-lg border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
            >
              Continue to Adjustments
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
