/**
 * Database Access Layer
 * 
 * Server-side functions for accessing the database via Prisma.
 * These should be used in:
 * - Server Components
 * - Server Actions
 * - API Route Handlers
 * 
 * DO NOT import this in client components. Use the hooks from hooks/use-data.ts instead.
 */

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// CLIENT COMPANIES
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function getClientCompanies() {
  return prisma.clientCompany.findMany({
    where: { isActive: true },
    orderBy: { companyName: 'asc' },
  })
}

export async function getClientCompany(id: number) {
  return prisma.clientCompany.findUnique({
    where: { id },
    include: {
      accountingPeriods: {
        orderBy: { endDate: 'desc' },
      },
      clientContacts: true,
      clientAccountant: true,
    },
  })
}

export async function getClientCompanyByUuid(uuid: string) {
  return prisma.clientCompany.findUnique({
    where: { uuid },
    include: {
      accountingPeriods: {
        orderBy: { endDate: 'desc' },
      },
      clientContacts: true,
      clientAccountant: true,
    },
  })
}

export async function createClientCompany(data: Prisma.ClientCompanyCreateInput) {
  return prisma.clientCompany.create({ data })
}

export async function updateClientCompany(id: number, data: Prisma.ClientCompanyUpdateInput) {
  return prisma.clientCompany.update({
    where: { id },
    data,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ACCOUNTING PERIODS
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function getAccountingPeriods(clientCompanyId: number) {
  return prisma.accountingPeriod.findMany({
    where: { clientCompanyId },
    orderBy: { endDate: 'desc' },
  })
}

export async function getAccountingPeriod(id: number) {
  return prisma.accountingPeriod.findUnique({
    where: { id },
    include: {
      clientCompany: true,
      claimPacks: true,
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CLAIM PACKS
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function getClaimPacks(options?: { clientCompanyId?: number; status?: string }) {
  return prisma.claimPack.findMany({
    where: {
      ...(options?.clientCompanyId && { clientCompanyId: options.clientCompanyId }),
      ...(options?.status && { status: options.status as any }),
    },
    include: {
      clientCompany: true,
      accountingPeriod: true,
      assignedTo: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getClaimPack(id: number) {
  return prisma.claimPack.findUnique({
    where: { id },
    include: {
      clientCompany: true,
      accountingPeriod: true,
      assignedTo: true,
      createdBy: true,
      ct600Group: true,
    },
  })
}

export async function createClaimPack(data: Prisma.ClaimPackCreateInput) {
  return prisma.claimPack.create({
    data,
    include: {
      clientCompany: true,
    },
  })
}

export async function updateClaimPack(id: number, data: Prisma.ClaimPackUpdateInput) {
  return prisma.claimPack.update({
    where: { id },
    data,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SUBMISSIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function getSubmissions(options?: { clientCompanyId?: number; status?: string }) {
  return prisma.submission.findMany({
    where: {
      ...(options?.clientCompanyId && { clientCompanyId: options.clientCompanyId }),
      ...(options?.status && { status: options.status as any }),
    },
    include: {
      clientCompany: true,
      claimPack: true,
      submittedBy: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSubmission(id: number) {
  return prisma.submission.findUnique({
    where: { id },
    include: {
      clientCompany: true,
      claimPack: true,
      submittedBy: true,
      ct600Group: true,
    },
  })
}

export async function createSubmission(data: Prisma.SubmissionCreateInput) {
  return prisma.submission.create({ data })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function getAuditLogs(options?: { 
  limit?: number
  category?: string
  userId?: number
  clientCompanyId?: number
}) {
  return prisma.auditLog.findMany({
    where: {
      ...(options?.category && { category: options.category as any }),
      ...(options?.userId && { userId: options.userId }),
      ...(options?.clientCompanyId && { clientCompanyId: options.clientCompanyId }),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      clientCompany: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: options?.limit,
  })
}

export async function createAuditLog(data: Prisma.AuditLogCreateInput) {
  return prisma.auditLog.create({ data })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function getUsers() {
  return prisma.taxEngineUser.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUserByUuid(uuid: string) {
  return prisma.taxEngineUser.findUnique({
    where: { uuid },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.taxEngineUser.findUnique({
    where: { email },
  })
}

export async function createUser(data: Prisma.TaxEngineUserCreateInput) {
  return prisma.taxEngineUser.create({ data })
}

export async function updateUser(id: number, data: Prisma.TaxEngineUserUpdateInput) {
  return prisma.taxEngineUser.update({
    where: { id },
    data,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function getTemplates() {
  return prisma.template.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function getTemplate(id: number) {
  return prisma.template.findUnique({
    where: { id },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GOVERNMENT GATEWAY
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function getDefaultGateway() {
  return prisma.governmentGateway.findFirst({
    where: { isDefault: true },
  })
}

export async function getGateways() {
  return prisma.governmentGateway.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateGateway(id: number, data: Prisma.GovernmentGatewayUpdateInput) {
  return prisma.governmentGateway.update({
    where: { id },
    data,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CT600 DATA
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function getCt600Group(id: number) {
  return prisma.ct600Group.findUnique({
    where: { id },
    include: {
      clientCompany: true,
      accountingPeriod: true,
      ct600AlphaDataset: true,
    },
  })
}

export async function getCt600AlphaDataset(id: number) {
  return prisma.ct600AlphaDataset.findUnique({
    where: { id },
    include: {
      clientCompany: true,
      accountingPeriod: true,
      ct600File: true,
    },
  })
}
