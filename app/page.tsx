"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/providers/auth-provider"
import { useApp } from "@/providers/app-provider"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  claimsByCompany,
  submissionsByCompany,
  getAllAccountingPeriods,
} from "@/lib/data"
import {
  FileText,
  Briefcase,
  Send,
  Download,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"

const barChartConfig = {
  periods: { label: "Accounting periods", color: "var(--chart-1)" },
} satisfies ChartConfig

const periodStageColors: Record<string, string> = {
  "In Progress": "var(--chart-1)",
  Proofing: "var(--chart-2)",
  Signed: "var(--chart-3)",
  Issued: "var(--chart-4)",
  Submitted: "var(--chart-5)",
}

export default function HomePage() {
  const router = useRouter()
  const { clientList } = useApp()
  const { currentUser } = useAuth()

  const firstName = currentUser?.name?.split(/\s+/)[0] ?? "there"

  const dateRangeLabel = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 31)
    return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
  }, [])

  // TaxEngine data: flatten claims, submissions, and get all accounting periods
  const allClaims = useMemo(
    () => Object.values(claimsByCompany).flat(),
    []
  )
  const allSubmissions = useMemo(
    () => Object.values(submissionsByCompany).flat(),
    []
  )
  const allPeriods = useMemo(() => getAllAccountingPeriods(), [])

  const activeRndClaims = useMemo(
    () => allClaims.filter((c) => c.status === "In progress").length,
    [allClaims]
  )
  const pendingHmrcSubmissions = useMemo(
    () => allSubmissions.filter((s) => s.status === "Draft").length,
    [allSubmissions]
  )
  const periodsSubmitted = useMemo(
    () => allPeriods.filter((p) => p.status === "Submitted").length,
    [allPeriods]
  )

  // Bar chart: accounting periods by year-end (e.g. Mar 2025, Dec 2024)
  const barData = useMemo(() => {
    const byYearEnd: Record<string, number> = {}
    for (const p of allPeriods) {
      byYearEnd[p.yearEnd] = (byYearEnd[p.yearEnd] ?? 0) + 1
    }
    return Object.entries(byYearEnd)
      .sort(([a], [b]) => {
        const parse = (s: string) => {
          const [mon, year] = s.split(" ")
          const months: Record<string, number> = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
          }
          return new Date(parseInt(year, 10), months[mon] ?? 0).getTime()
        }
        return parse(a) - parse(b)
      })
      .map(([yearEnd, count]) => ({ yearEnd, periods: count }))
  }, [allPeriods])

  // Donut: accounting periods by stage (In Progress, Proofing, Signed, Issued, Submitted), largest first
  const donutData = useMemo(() => {
    const statusOrder = ["In Progress", "Proofing", "Signed", "Issued", "Submitted"]
    const byStatus: Record<string, number> = {}
    for (const p of allPeriods) {
      byStatus[p.status] = (byStatus[p.status] ?? 0) + 1
    }
    return statusOrder
      .filter((s) => (byStatus[s] ?? 0) > 0)
      .map((status) => ({
        name: status,
        value: byStatus[status] ?? 0,
        color: periodStageColors[status] ?? "var(--chart-1)",
      }))
      .sort((a, b) => b.value - a.value)
  }, [allPeriods])

  const donutChartConfig = useMemo(
    () =>
      Object.fromEntries(
        donutData.map((d) => [
          d.name,
          { label: d.name, color: d.color },
        ])
      ) as ChartConfig,
    [donutData]
  )

  const kpis = [
    {
      label: "R&D claims in progress",
      value: activeRndClaims,
      trend: activeRndClaims > 0 ? 5.2 : 0,
      trendUp: true,
      icon: FileText,
      href: "/claims",
    },
    {
      label: "Clients",
      value: clientList.length,
      trend: clientList.length > 0 ? 2.0 : 0,
      trendUp: true,
      icon: Briefcase,
      href: "/companies",
    },
    {
      label: "Pending HMRC submissions",
      value: pendingHmrcSubmissions,
      trend: pendingHmrcSubmissions > 0 ? -1.0 : 0,
      trendUp: false,
      icon: Send,
      href: "/submissions",
    },
    {
      label: "CT600 submitted to HMRC",
      value: periodsSubmitted,
      trend: periodsSubmitted > 0 ? 8.0 : 0,
      trendUp: true,
      icon: FileText,
      href: "/submissions",
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-background">
      <div className="container mx-auto p-6 lg:p-8 space-y-6">
        {/* Header: Welcome + actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-card shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download R&D report
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-card shadow-sm min-w-[140px] justify-between"
            >
              <span className="text-muted-foreground">{dateRangeLabel}</span>
              <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* KPI cards - 2x4 grid style (2 rows, 4 cols) */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {kpis.map(({ label, value, trend, trendUp, icon: Icon, href }) => (
            <Card
              key={label}
              className="bg-card border-border shadow-[var(--shadow-elevation-low)] rounded-xl overflow-hidden cursor-pointer transition-shadow hover:shadow-[var(--shadow-elevation-medium)]"
              onClick={() => router.push(href)}
            >
              <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="rounded p-1 hover:bg-muted">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      View all
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      Export
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                {trend !== 0 ? (
                  <div className="flex items-center gap-1 mt-2">
                    {trendUp ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        trendUp ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {trendUp ? "+" : ""}
                      {trend}%
                    </span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom: Bar chart (left) + Donut (right) */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* R&D / CT600 activity by accounting period */}
          <Card className="lg:col-span-2 bg-card border-border shadow-[var(--shadow-elevation-low)] rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    R&D accounting periods
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Total: {allPeriods.length} periods across clients
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-border bg-card shadow-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download R&D report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig} className="h-[280px] w-full">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="yearEnd" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} width={28} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="periods" fill="var(--color-periods)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Accounting periods by stage (CT600 pipeline) */}
          <Card className="bg-card border-border shadow-[var(--shadow-elevation-low)] rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">
                  Periods by stage
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded p-1 hover:bg-muted">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push("/companies")}>
                      View clients
                    </DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ChartContainer config={donutChartConfig} className="h-[220px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {donutData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
              {donutData.length > 0 && (
                <p className="text-center text-lg font-bold text-foreground mt-2">
                  {donutData[0].name} {donutData[0].value}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
