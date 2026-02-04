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

export const companies: Company[] = [
  { id: "c1", name: "Alpha Robotics Ltd", number: "11223344", utr: "1234567890", contactName: "John Smith", contactEmail: "john@alpharobotics.com", contactPhone: "07700 900123" },
  { id: "c2", name: "Beacon Analytics Ltd", number: "22114455", utr: "2345678901", payeReference: "123/AB456", contactName: "Sarah Jones", contactEmail: "sarah@beaconanalytics.com", contactPhone: "07700 900456" },
  { id: "c3", name: "Cobalt Systems Ltd", number: "33001122", utr: "3456789012", contactName: "Mike Brown", contactEmail: "mike@cobaltsystems.com", contactPhone: "07700 900789" },
  { id: "c4", name: "QLC Consulting Ltd", number: "14141414", utr: "4567890123", payeReference: "456/CD789", contactName: "Emma Wilson", contactEmail: "emma@qlcconsulting.com", contactPhone: "07700 900012" },
  { id: "c5", name: "Romilly & Co Ltd", number: "99887766", utr: "5678901234", payeReference: "789/EF012", contactName: "David Taylor", contactEmail: "david@romillyco.com", contactPhone: "07700 900345" },
  { id: "c6", name: "Zeta Materials Ltd", number: "55667788", utr: "6789012345", contactName: "Lisa Anderson", contactEmail: "lisa@zetamaterials.com", contactPhone: "07700 900678" },
]

export const claimsByCompany: Record<string, Claim[]> = {
  c5: [
    {
      id: "cl1",
      title: "CT600 pack - FY2024",
      period: "01 Apr 2024 - 31 Mar 2025",
      status: "In progress",
      next: "Build CT600",
      progress: 58,
    },
    {
      id: "cl2",
      title: "CT600 pack - FY2023",
      period: "01 Apr 2023 - 31 Mar 2024",
      status: "Ready",
      next: "Submit",
      progress: 92,
    },
  ],
  c4: [
    {
      id: "cl3",
      title: "CT600 pack - FY2024",
      period: "01 Apr 2024 - 31 Mar 2025",
      status: "Awaiting",
      next: "Scan & Extract",
      progress: 24,
    },
  ],
}

export const submissionsByCompany: Record<string, Submission[]> = {
  c5: [
    {
      id: "s1",
      title: "CT600 - FY2023",
      status: "Submitted",
      submittedAt: "12 Dec 2024 14:22",
      packRef: "PACK-2023-02",
    },
    {
      id: "s2",
      title: "CT600 - FY2022",
      status: "Submitted",
      submittedAt: "10 Dec 2023 11:05",
      packRef: "PACK-2022-01",
    },
  ],
  c4: [
    {
      id: "s3",
      title: "CT600 - FY2023",
      status: "Draft",
      submittedAt: "-",
      packRef: "-",
    },
  ],
}

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

// User roles
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

export const users: User[] = [
  {
    id: "u1",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@taxengine.co",
    role: "Administrator",
    status: "Active",
    lastLogin: "26 Jan 2026, 09:15",
  },
  {
    id: "u2",
    name: "James Harrison",
    email: "james.harrison@taxengine.co",
    role: "Claim Processor",
    status: "Active",
    lastLogin: "26 Jan 2026, 08:42",
  },
  {
    id: "u3",
    name: "Emily Chen",
    email: "emily.chen@taxengine.co",
    role: "Claim Processor",
    status: "Active",
    lastLogin: "25 Jan 2026, 17:30",
  },
  {
    id: "u4",
    name: "Michael Roberts",
    email: "michael.roberts@taxengine.co",
    role: "Claim Processor",
    status: "Inactive",
    lastLogin: "10 Jan 2026, 14:22",
  },
]

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

export type AuditLogEntry = {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
  category: "auth" | "claim" | "client" | "submission" | "settings"
}

export const auditLog: AuditLogEntry[] = [
  {
    id: "a1",
    timestamp: "26 Jan 2026, 09:15:42",
    user: "Sarah Mitchell",
    action: "Logged in",
    details: "Successful authentication via SSO",
    category: "auth",
  },
  {
    id: "a2",
    timestamp: "26 Jan 2026, 09:12:18",
    user: "James Harrison",
    action: "Claim stage advanced",
    details: "CT600 pack - FY2024 for Romilly & Co Ltd moved to Review stage",
    category: "claim",
  },
  {
    id: "a3",
    timestamp: "26 Jan 2026, 08:55:33",
    user: "Emily Chen",
    action: "Document uploaded",
    details: "Uploaded 3 source documents to QLC Consulting Ltd claim pack",
    category: "claim",
  },
  {
    id: "a4",
    timestamp: "26 Jan 2026, 08:42:07",
    user: "James Harrison",
    action: "Logged in",
    details: "Successful authentication via password",
    category: "auth",
  },
  {
    id: "a5",
    timestamp: "25 Jan 2026, 17:45:22",
    user: "Sarah Mitchell",
    action: "Submission created",
    details: "Created submission record PACK-2024-01 for Romilly & Co Ltd",
    category: "submission",
  },
  {
    id: "a6",
    timestamp: "25 Jan 2026, 17:30:15",
    user: "Emily Chen",
    action: "Logged out",
    details: "User session ended",
    category: "auth",
  },
  {
    id: "a7",
    timestamp: "25 Jan 2026, 16:22:41",
    user: "Sarah Mitchell",
    action: "Client updated",
    details: "Updated contact details for Alpha Robotics Ltd",
    category: "client",
  },
  {
    id: "a8",
    timestamp: "25 Jan 2026, 15:18:09",
    user: "James Harrison",
    action: "CT600 built",
    details: "Generated CT600 preview for Romilly & Co Ltd - FY2024",
    category: "claim",
  },
  {
    id: "a9",
    timestamp: "25 Jan 2026, 14:05:33",
    user: "Emily Chen",
    action: "Scan completed",
    details: "Extracted 47 line items from uploaded documents for QLC Consulting Ltd",
    category: "claim",
  },
  {
    id: "a10",
    timestamp: "25 Jan 2026, 11:30:00",
    user: "Sarah Mitchell",
    action: "User invited",
    details: "Sent invitation to new user: michael.roberts@taxengine.co",
    category: "settings",
  },
  {
    id: "a11",
    timestamp: "24 Jan 2026, 16:45:12",
    user: "Sarah Mitchell",
    action: "Template updated",
    details: "Modified CT600 Export Template - added new field mappings",
    category: "settings",
  },
  {
    id: "a12",
    timestamp: "24 Jan 2026, 14:22:08",
    user: "James Harrison",
    action: "Claim created",
    details: "Created new claim pack CT600 - FY2024 for QLC Consulting Ltd",
    category: "claim",
  },
]

export type Template = {
  id: string
  name: string
  description: string
  category: "export" | "report" | "letter"
  lastModified: string
  version: string
}

export const templates: Template[] = [
  {
    id: "t1",
    name: "Qualifying Expenditure Report",
    description: "Standard Excel template for documenting qualifying R&D expenditure by category",
    category: "report",
    lastModified: "24 Jan 2026",
    version: "2.1.0",
  },
  {
    id: "t2",
    name: "Letter of Authority",
    description: "Authorisation letter for acting on behalf of clients with HMRC",
    category: "letter",
    lastModified: "20 Jan 2026",
    version: "1.4.0",
  },
]
