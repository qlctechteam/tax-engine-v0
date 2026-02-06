/**
 * Data Types and Utilities
 * 
 * NOTE: Static mock data has been removed. Data now comes from the database.
 * Use the hooks from @/hooks/use-supabase-data to fetch data.
 * 
 * This file now only exports:
 * - Type definitions
 * - Utility functions
 * - Empty arrays for backwards compatibility (pages should migrate to hooks)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type Company = {
  id: string
  name: string
  number: string
  utr?: string
  payeReference?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
}

export type Claim = {
  id: string
  title: string
  period: string
  status: "In progress" | "Ready" | "Awaiting"
  next: string
  progress: number
}

export type Submission = {
  id: string
  title: string
  status: "Submitted" | "Draft"
  submittedAt: string
  packRef: string
}

export type AccountingPeriod = {
  id: string
  companyId: string
  yearEnd: string
  yearEndDate: string
  periodStart: string
  periodEnd: string
  status: "In Progress" | "Proofing" | "Signed" | "Issued" | "Submitted"
  processedBy?: string
  amount?: string
  claimId?: string
}

export type UserRole = "Administrator" | "Claim Processor"

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: "Active" | "Inactive"
  lastLogin: string
  avatar?: string
}

export type RolePermission = {
  role: string
  description: string
  permissions: {
    viewClaims: boolean
    createClaims: boolean
    editClaims: boolean
    submitClaims: boolean
    manageClients: boolean
    viewAuditLog: boolean
    manageUsers: boolean
    manageTemplates: boolean
    accessInvoicing: boolean
  }
}

export type AuditLogEntry = {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
  category: "auth" | "claim" | "client" | "submission" | "settings"
}

export type Template = {
  id: string
  name: string
  description: string
  category: "export" | "report" | "letter"
  lastModified: string
  version: string
}

export type GatewayCredentials = {
  agentUserId: string
  password: string
  status: "connected" | "disconnected" | "expired"
  lastVerified: string
  connectedAt: string
}

export type SubmissionPermission = {
  id: string
  name: string
  description: string
  authorised: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY DATA EXPORTS (for backwards compatibility - migrate to hooks)
// ═══════════════════════════════════════════════════════════════════════════════

/** @deprecated Use useClientCompanies() hook from @/hooks/use-supabase-data */
export const companies: Company[] = []

/** @deprecated Use useClaimPacks() hook from @/hooks/use-supabase-data */
export const claimsByCompany: Record<string, Claim[]> = {}

/** @deprecated Use useSubmissions() hook from @/hooks/use-supabase-data */
export const submissionsByCompany: Record<string, Submission[]> = {}

/** @deprecated Use useAccountingPeriods() hook from @/hooks/use-supabase-data */
export const accountingPeriodsByCompany: Record<string, AccountingPeriod[]> = {}

/** @deprecated Use useTaxEngineUsers() hook from @/hooks/use-supabase-data */
export const users: User[] = []

/** @deprecated Use useAuditLogs() hook from @/hooks/use-supabase-data */
export const auditLog: AuditLogEntry[] = []

/** @deprecated Use useTemplates() hook from @/hooks/use-supabase-data */
export const templates: Template[] = []

/** @deprecated Use useGovernmentGateway() hook from @/hooks/use-supabase-data */
export const governmentGateway: GatewayCredentials = {
  agentUserId: "",
  password: "",
  status: "disconnected",
  lastVerified: "",
  connectedAt: "",
}

// Role permissions are static config, not database data
export const rolePermissions: RolePermission[] = [
  {
    role: "Administrator",
    description: "Full access to all features including user management, submissions, and settings.",
    permissions: {
      viewClaims: true,
      createClaims: true,
      editClaims: true,
      submitClaims: true,
      manageClients: true,
      viewAuditLog: true,
      manageUsers: true,
      manageTemplates: true,
      accessInvoicing: true,
    },
  },
  {
    role: "Claim Processor",
    description: "Can view and edit claims, upload documents, and build CT600s. Cannot submit or manage users.",
    permissions: {
      viewClaims: true,
      createClaims: true,
      editClaims: true,
      submitClaims: false,
      manageClients: false,
      viewAuditLog: false,
      manageUsers: false,
      manageTemplates: false,
      accessInvoicing: false,
    },
  },
]

// Submission permissions are static config
export const submissionPermissions: SubmissionPermission[] = [
  {
    id: "ct600",
    name: "CT600 Corporation Tax Returns",
    description: "Submit CT600 corporation tax returns to HMRC",
    authorised: true,
  },
  {
    id: "rnd",
    name: "R&D Tax Credit Claims",
    description: "Submit R&D tax credit claims under SME and RDEC schemes",
    authorised: true,
  },
  {
    id: "ixbrl",
    name: "iXBRL Submissions",
    description: "Submit iXBRL tagged accounts and computations",
    authorised: true,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Claim stages (static config)
export const stages = [
  { id: 1, label: "Upload", description: "Attach source documents to the claim" },
  { id: 2, label: "Scan & Extract", description: "Parse documents and extract structured values" },
  { id: 3, label: "Build CT600", description: "Construct the CT600 model from extracted data" },
  { id: 4, label: "Review", description: "Confirm the CT600 and supporting outputs are reviewed" },
  { id: 5, label: "Submit", description: "Finalise and log the submission" },
]

export function getStageFromNext(next: string): number {
  const n = next.toLowerCase()
  if (n.includes("upload")) return 1
  if (n.includes("scan")) return 2
  if (n.includes("build")) return 3
  if (n.includes("review")) return 4
  if (n.includes("submit")) return 5
  return 2
}

export function groupCompaniesByLetter(companies: Company[]): Record<string, Company[]> {
  const groups: Record<string, Company[]> = {}
  for (const c of companies) {
    const letter = c.name.trim().slice(0, 1).toUpperCase() || "#"
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(c)
  }
  Object.keys(groups).forEach((k) =>
    groups[k].sort((a, b) => a.name.localeCompare(b.name))
  )
  return groups
}

/** @deprecated Data now comes from database. Use hooks instead. */
export function getAllAccountingPeriods(): (AccountingPeriod & { companyName: string })[] {
  return []
}

/** @deprecated Data now comes from database. Use hooks instead. */
export function getRecentClaims(): (AccountingPeriod & { companyName: string })[] {
  return []
}
