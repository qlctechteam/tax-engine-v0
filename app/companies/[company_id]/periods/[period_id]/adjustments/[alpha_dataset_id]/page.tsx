"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { accountingPeriodsByCompany } from "@/lib/data"
import {
  ChevronRight,
  X,
  Check,
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

export default function AdjustmentsPage() {
  const params = useParams()
  const router = useRouter()
  const { clientList } = useApp()
  
  const companyId = params.company_id as string
  const periodId = params.period_id as string
  const alphaDatasetId = params.alpha_dataset_id as string
  
  const client = clientList.find(c => c.id === companyId)
  const periods = accountingPeriodsByCompany[companyId] || []
  const period = periods.find(p => p.id === periodId)

  const currentStep = 3 // Adjustments step
  
  // Adjustment values
  const [preRDTaxableProfit, setPreRDTaxableProfit] = useState("342,500")
  const [rdEnhancedExpenditure, setRDEnhancedExpenditure] = useState("31,250")
  const [lossesBroughtForward, setLossesBroughtForward] = useState("")
  const [customAdjustment, setCustomAdjustment] = useState("")
  const [customAdjustmentNote, setCustomAdjustmentNote] = useState("")

  // Calculate Post-R&D Taxable Profit/Loss
  const calculatePostRD = () => {
    const preRD = parseFloat(preRDTaxableProfit.replace(/,/g, "")) || 0
    const rdExpenditure = parseFloat(rdEnhancedExpenditure.replace(/,/g, "")) || 0
    const losses = parseFloat(lossesBroughtForward.replace(/,/g, "")) || 0
    const custom = parseFloat(customAdjustment.replace(/,/g, "")) || 0
    
    const postRD = preRD - rdExpenditure - losses + custom
    return postRD.toLocaleString()
  }

  // Trading Losses Summary data
  const tradingLosses = [
    { item: "Surrendered for Credit", beforeRD: "£0", afterRD: "£0" },
    { item: "Losses Arising", beforeRD: "£0", afterRD: "£31,250" },
    { item: "Losses Utilised", beforeRD: "£0", afterRD: "£0" },
    { item: "Carried Back", beforeRD: "£0", afterRD: "£0" },
    { item: "Carried Forward", beforeRD: "£0", afterRD: "£31,250" },
    { item: "Preserved Losses", beforeRD: "£0", afterRD: "£0" },
  ]

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
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground">R&D Adjustments</h3>
            <p className="text-muted-foreground">
              Configure adjustments to taxable profit and trading losses
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Adjustment to Taxable Profit */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Adjustment to Taxable Profit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Pre-R&D Taxable Profit/Loss */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Pre-R&D Taxable Profit/Loss</Label>
                  <Input
                    value={`£${preRDTaxableProfit}`}
                    onChange={(e) => setPreRDTaxableProfit(e.target.value.replace(/[£,]/g, ""))}
                    className="font-mono bg-muted/50 border-border"
                  />
                </div>

                {/* R&D Enhanced Expenditure (25%) */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">R&D Enhanced Expenditure (25%)</Label>
                  <Input
                    value={`£${rdEnhancedExpenditure}`}
                    onChange={(e) => setRDEnhancedExpenditure(e.target.value.replace(/[£,]/g, ""))}
                    className="font-mono bg-muted/50 border-border"
                  />
                </div>

                {/* Losses Brought Forward */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Losses Brought Forward</Label>
                  <Input
                    value={lossesBroughtForward}
                    onChange={(e) => setLossesBroughtForward(e.target.value)}
                    placeholder="Enter amount ..."
                    className="font-mono bg-muted/50 border-border"
                  />
                </div>

                {/* Custom Adjustment */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Custom Adjustment</Label>
                  <Input
                    value={customAdjustment}
                    onChange={(e) => setCustomAdjustment(e.target.value)}
                    placeholder="Enter amount ..."
                    className="font-mono bg-muted/50 border-border"
                  />
                  <Input
                    value={customAdjustmentNote}
                    onChange={(e) => setCustomAdjustmentNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="bg-muted/50 border-border text-sm"
                  />
                </div>

                {/* Post-R&D Taxable Profit/Loss */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-muted-foreground">Post-R&D Taxable Profit/Loss</Label>
                  <div className="px-3 py-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-mono font-semibold text-emerald-600">£{calculatePostRD()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Trading Losses Summary */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Trading Losses Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_80px_80px_40px] gap-2 pb-3 border-b border-border text-xs text-muted-foreground">
                  <span>Item</span>
                  <span className="text-right">Before R&D</span>
                  <span className="text-right">After R&D</span>
                  <span className="text-center">Edit</span>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {tradingLosses.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_80px_80px_40px] gap-2 py-3 items-center"
                    >
                      <span className="text-sm text-foreground">{row.item}</span>
                      <span className="text-sm text-muted-foreground text-right font-mono">{row.beforeRD}</span>
                      <span className="text-sm text-foreground text-right font-mono">{row.afterRD}</span>
                      <div className="flex justify-center">
                        <Checkbox className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/companies/${companyId}/periods/${periodId}/review/${alphaDatasetId}`)}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                // Create a ct600 group ID (in real app, this would be created via API)
                const ct600GroupId = `CT600GROUP-${Date.now()}`
                router.push(`/companies/${companyId}/periods/${periodId}/final-review/${ct600GroupId}`)
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue to Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
