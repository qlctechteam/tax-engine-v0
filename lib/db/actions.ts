'use server'

/**
 * Server Actions for Database Mutations
 * 
 * These are Next.js Server Actions that can be called from client components
 * to perform database mutations. They automatically handle the server/client boundary.
 * 
 * Usage in client component:
 *   import { createCompany } from '@/lib/db/actions'
 *   
 *   async function handleSubmit(formData: FormData) {
 *     const result = await createCompany(formData)
 *   }
 */

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Prisma, AuditCategory } from '@prisma/client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// CLIENT COMPANIES
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function createCompanyAction(data: {
  companyName: string
  companyNumber?: string
  utr?: string
  email?: string
  phone?: string
}) {
  try {
    const company = await prisma.clientCompany.create({
      data: {
        companyName: data.companyName,
        companyNumber: data.companyNumber,
        utr: data.utr,
        email: data.email,
        phone: data.phone,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'Client created',
        details: `Created client company: ${data.companyName}`,
        category: 'CLIENT',
        clientCompanyId: company.id,
      },
    })

    revalidatePath('/companies')
    return { success: true, data: company }
  } catch (error) {
    console.error('Error creating company:', error)
    return { success: false, error: 'Failed to create company' }
  }
}

export async function updateCompanyAction(
  id: number,
  data: Prisma.ClientCompanyUpdateInput
) {
  try {
    const company = await prisma.clientCompany.update({
      where: { id },
      data,
    })

    await prisma.auditLog.create({
      data: {
        action: 'Client updated',
        details: `Updated client company: ${company.companyName}`,
        category: 'CLIENT',
        clientCompanyId: company.id,
      },
    })

    revalidatePath('/companies')
    revalidatePath(`/companies/${id}`)
    return { success: true, data: company }
  } catch (error) {
    console.error('Error updating company:', error)
    return { success: false, error: 'Failed to update company' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CLAIM PACKS
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function createClaimPackAction(data: {
  title: string
  clientCompanyId: number
  accountingPeriodId?: number
  periodLabel?: string
}) {
  try {
    const claimPack = await prisma.claimPack.create({
      data: {
        title: data.title,
        periodLabel: data.periodLabel,
        clientCompany: { connect: { id: data.clientCompanyId } },
        ...(data.accountingPeriodId && {
          accountingPeriod: { connect: { id: data.accountingPeriodId } },
        }),
      },
      include: {
        clientCompany: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'Claim created',
        details: `Created claim pack: ${data.title} for ${claimPack.clientCompany.companyName}`,
        category: 'CLAIM',
        clientCompanyId: data.clientCompanyId,
        claimPackId: claimPack.id,
      },
    })

    revalidatePath('/claims')
    revalidatePath(`/companies/${data.clientCompanyId}`)
    return { success: true, data: claimPack }
  } catch (error) {
    console.error('Error creating claim pack:', error)
    return { success: false, error: 'Failed to create claim pack' }
  }
}

export async function updateClaimPackStageAction(
  id: number,
  stage: 'UPLOAD' | 'SCAN_EXTRACT' | 'BUILD_CT600' | 'REVIEW' | 'SUBMIT',
  progress: number
) {
  try {
    const stageTimestamps: Record<string, string> = {
      UPLOAD: 'uploadCompletedAt',
      SCAN_EXTRACT: 'scanExtractCompletedAt',
      BUILD_CT600: 'buildCt600CompletedAt',
      REVIEW: 'reviewCompletedAt',
      SUBMIT: 'submittedAt',
    }

    const claimPack = await prisma.claimPack.update({
      where: { id },
      data: {
        currentStage: stage,
        progress,
        [stageTimestamps[stage]]: new Date(),
        ...(stage === 'SUBMIT' && { status: 'COMPLETED' }),
      },
      include: {
        clientCompany: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'Claim stage advanced',
        details: `${claimPack.title} for ${claimPack.clientCompany.companyName} moved to ${stage} stage`,
        category: 'CLAIM',
        clientCompanyId: claimPack.clientCompanyId,
        claimPackId: claimPack.id,
      },
    })

    revalidatePath('/claims')
    revalidatePath(`/companies/${claimPack.clientCompanyId}`)
    return { success: true, data: claimPack }
  } catch (error) {
    console.error('Error updating claim pack stage:', error)
    return { success: false, error: 'Failed to update claim pack' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SUBMISSIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function createSubmissionAction(data: {
  title: string
  clientCompanyId: number
  claimPackId?: number
  ct600GroupId?: number
  submittedById?: number
}) {
  try {
    // Generate pack reference
    const packRef = `PACK-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

    const submission = await prisma.submission.create({
      data: {
        title: data.title,
        packRef,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        clientCompany: { connect: { id: data.clientCompanyId } },
        ...(data.claimPackId && {
          claimPack: { connect: { id: data.claimPackId } },
        }),
        ...(data.ct600GroupId && {
          ct600Group: { connect: { id: data.ct600GroupId } },
        }),
        ...(data.submittedById && {
          submittedBy: { connect: { id: data.submittedById } },
        }),
      },
      include: {
        clientCompany: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'Submission created',
        details: `Created submission ${packRef} for ${submission.clientCompany.companyName}`,
        category: 'SUBMISSION',
        clientCompanyId: data.clientCompanyId,
        claimPackId: data.claimPackId,
      },
    })

    revalidatePath('/submissions')
    revalidatePath(`/companies/${data.clientCompanyId}`)
    return { success: true, data: submission }
  } catch (error) {
    console.error('Error creating submission:', error)
    return { success: false, error: 'Failed to create submission' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function logAuditAction(data: {
  action: string
  details?: string
  category: AuditCategory
  userId?: number
  clientCompanyId?: number
  claimPackId?: number
  ipAddress?: string
  userAgent?: string
}) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        action: data.action,
        details: data.details,
        category: data.category,
        userId: data.userId,
        clientCompanyId: data.clientCompanyId,
        claimPackId: data.claimPackId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })

    return { success: true, data: log }
  } catch (error) {
    console.error('Error creating audit log:', error)
    return { success: false, error: 'Failed to create audit log' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GOVERNMENT GATEWAY
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function updateGatewayStatusAction(
  id: number,
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED'
) {
  try {
    const gateway = await prisma.governmentGateway.update({
      where: { id },
      data: {
        status,
        ...(status === 'CONNECTED' && {
          connectedAt: new Date(),
          lastVerifiedAt: new Date(),
        }),
        ...(status === 'DISCONNECTED' && {
          disconnectedAt: new Date(),
        }),
      },
    })

    await prisma.auditLog.create({
      data: {
        action: `Gateway ${status.toLowerCase()}`,
        details: `Government Gateway status changed to ${status}`,
        category: 'SETTINGS',
      },
    })

    revalidatePath('/settings')
    return { success: true, data: gateway }
  } catch (error) {
    console.error('Error updating gateway status:', error)
    return { success: false, error: 'Failed to update gateway status' }
  }
}
