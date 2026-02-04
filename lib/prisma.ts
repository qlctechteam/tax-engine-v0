import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton
 * 
 * This file creates a singleton instance of the Prisma Client to prevent
 * multiple instances during development hot reloading.
 * 
 * Usage:
 *   import { prisma } from '@/lib/prisma'
 *   
 *   // In Server Components or API routes
 *   const users = await prisma.taxEngineUser.findMany()
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
