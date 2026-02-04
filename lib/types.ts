"use client"

import type { Company, Claim, Submission, User as UserType, RolePermission, AuditLogEntry, Template } from "./data"

// Re-export data types
export type { Company, Claim, Submission, UserType, RolePermission, AuditLogEntry, Template }

// Route types (for backwards compatibility with existing components)
export type Route = "home" | "claims" | "clients" | "client-detail" | "submissions" | "settings"

// Notification system types
export interface AppNotification {
  id: string
  type: "hmrc-validation" | "general"
  title: string
  message: string
  timestamp: Date
  read: boolean
  // For navigation back to context
  claimId?: string
  companyName?: string
}

// Automatic CT600 Validation states
export type HMRCValidationStatus = "pending" | "running" | "passed" | "failed"

export interface HMRCValidationResult {
  status: HMRCValidationStatus
  message?: string
  timestamp?: Date
}

// Auth types
export interface AuthUser {
  email: string
  name: string
}

// Auth storage key
export const AUTH_STORAGE_KEY = "taxengine_auth"

// Demo credentials - in production, this would be handled by a backend
export const DEMO_USER = {
  email: "demo@taxengine.io",
  // This is a hash representation - in production, use bcrypt on backend
  passwordHash: "demo123",
  name: "Demo User",
}

// Simple hash check - in production, use bcrypt.compare on backend
export const verifyPassword = (input: string, hash: string) => input === hash

// Claim Processor Types
export type ProcessorStep = "select-year" | "scan-ct600" | "extracting" | "review-info" | "adjustments" | "final-review" | "docusign" | "submission"

export type UploadedFile = {
  id: string
  name: string
  type: "ct600" | "expenditure"
  uploadedAt: string
}

export type YearEnd = {
  id: string
  date: string
  label: string
  periodStart: string
  periodEnd: string
}

// Generate year ends within 2 years of today (simulating Companies House data)
export function getRelevantYearEnds(): YearEnd[] {
  const today = new Date()
  const yearEnds: YearEnd[] = []
  
  // Common year end months
  const yearEndMonths = [
    { month: 2, label: "March" },
    { month: 11, label: "December" },
    { month: 8, label: "September" },
    { month: 5, label: "June" },
  ]
  
  for (const ye of yearEndMonths) {
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const year = today.getFullYear() - yearOffset
      const yearEndDate = new Date(year, ye.month, ye.month === 2 ? 31 : ye.month === 11 ? 31 : ye.month === 8 ? 30 : 30)
      const twoYearsAgo = new Date(today)
      twoYearsAgo.setFullYear(today.getFullYear() - 2)
      
      if (yearEndDate >= twoYearsAgo && yearEndDate <= today) {
        const periodStart = new Date(yearEndDate)
        periodStart.setFullYear(periodStart.getFullYear() - 1)
        periodStart.setDate(periodStart.getDate() + 1)
        
        yearEnds.push({
          id: `ye-${ye.label.toLowerCase()}-${year}`,
          date: yearEndDate.toISOString(),
          label: `${ye.label} ${year}`,
          periodStart: periodStart.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          periodEnd: yearEndDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        })
      }
    }
  }
  
  return yearEnds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
