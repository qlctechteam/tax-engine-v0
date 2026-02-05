"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useApp } from "@/providers/app-provider"
import {
  FileText,
  Briefcase,
  Send,
  ChevronRight,
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()  
  const { clientList } = useApp()

  // Navigation card component
  const NavCard = ({ 
    icon: Icon, 
    title, 
    description, 
    count, 
    countLabel,
    onClick 
  }: { 
    icon: React.ElementType
    title: string
    description: string
    count?: number
    countLabel?: string
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      className="group relative flex flex-col p-5 rounded-xl border border-border bg-card text-left transition-all duration-150 hover:border-border/80 hover:bg-muted active:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary transition-colors text-primary-foreground group-hover:text-popover-foreground">
          <Icon className="h-5 w-5" />
        </div>
        {count !== undefined && (
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground tabular-nums">{count}</p>
            <p className="text-xs text-muted-foreground">{countLabel}</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-foreground tracking-tight mb-1">{title}</h3>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-all duration-150 group-hover:text-muted-foreground group-hover:translate-x-0.5" />
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  )

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">TaxEngine</h1>
        <p className="text-muted-foreground">R&D Tax Credit Infrastructure</p>
      </div>

      {/* Primary CTA - Start Claim */}
      <div className="mb-12 flex justify-center">
        <Button
          size="lg"
          className="group h-12 px-8 text-base tracking-tight text-primary-foreground font-bold rounded-xl border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary animate-cta-breathe hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
          onClick={() => router.push("/claims")}
        >
          <span>Start Claim</span>
          <ChevronRight className="h-5 w-5 ml-2 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Button>
      </div>

      {/* Navigation Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <NavCard
          icon={FileText}
          title="Claims"
          description="Process and manage R&D claims"
          count={7}
          countLabel="active"
          onClick={() => router.push("/claims")}
        />
        <NavCard
          icon={Briefcase}
          title="Clients"
          description="View and manage client records"
          count={clientList.length}
          countLabel="total"
          onClick={() => router.push("/companies")}
        />
        <NavCard
          icon={Send}
          title="Submissions"
          description="Track HMRC submissions"
          count={3}
          countLabel="pending"
          onClick={() => router.push("/submissions")}
        />
      </div>
    </div>
  )
}
