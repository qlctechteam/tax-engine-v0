import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Super Admin user
  // Note: You must first create this user in Supabase Auth (Dashboard > Authentication > Users)
  // Then copy the user's UUID here
  const superAdminUuid = process.env.SUPER_ADMIN_UUID

  if (!superAdminUuid) {
    console.log('⚠️  SUPER_ADMIN_UUID not set in .env')
    console.log('   To create a super admin:')
    console.log('   1. Go to Supabase Dashboard > Authentication > Users')
    console.log('   2. Click "Add user" and create a user with email/password')
    console.log('   3. Copy the user UUID and add to .env: SUPER_ADMIN_UUID=<uuid>')
    console.log('   4. Run: npx prisma db seed')
    return
  }

  const superAdmin = await prisma.taxEngineUser.upsert({
    where: { uuid: superAdminUuid },
    update: {
      role: 'ADMINISTRATOR',
      status: 'ACTIVE',
    },
    create: {
      uuid: superAdminUuid,
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@taxengine.co.uk',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'ADMINISTRATOR',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Super Admin created/updated:', superAdmin.email)

  // Create default permissions
  const permissions = [
    { name: 'View Claims', code: 'claims.view', description: 'View all claims', administrator: true, claimProcessor: true },
    { name: 'Edit Claims', code: 'claims.edit', description: 'Edit claim details', administrator: true, claimProcessor: true },
    { name: 'Submit Claims', code: 'claims.submit', description: 'Submit claims to HMRC', administrator: true, claimProcessor: false },
    { name: 'View Clients', code: 'clients.view', description: 'View client companies', administrator: true, claimProcessor: true },
    { name: 'Edit Clients', code: 'clients.edit', description: 'Edit client details', administrator: true, claimProcessor: true },
    { name: 'Manage Users', code: 'users.manage', description: 'Add/edit/remove users', administrator: true, claimProcessor: false },
    { name: 'View Settings', code: 'settings.view', description: 'View system settings', administrator: true, claimProcessor: false },
    { name: 'Edit Settings', code: 'settings.edit', description: 'Modify system settings', administrator: true, claimProcessor: false },
    { name: 'View Audit Log', code: 'audit.view', description: 'View audit log', administrator: true, claimProcessor: false },
    { name: 'Manage Templates', code: 'templates.manage', description: 'Manage document templates', administrator: true, claimProcessor: false },
    { name: 'Manage Gateway', code: 'gateway.manage', description: 'Manage Government Gateway', administrator: true, claimProcessor: false },
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: perm,
      create: perm,
    })
  }

  console.log('✅ Permissions created/updated')

  // Create default Government Gateway placeholder
  const gateway = await prisma.governmentGateway.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Primary Gateway',
      isDefault: true,
      agentUserId: 'AGENT-ID-PLACEHOLDER',
      status: 'DISCONNECTED',
      ct600Authorised: false,
      rndAuthorised: false,
      ixbrlAuthorised: false,
    },
  })

  console.log('✅ Government Gateway placeholder created')

  // Create default templates
  const templates = [
    { name: 'CT600 Export', category: 'EXPORT' as const, version: '1.0', description: 'Standard CT600 export template' },
    { name: 'R&D Report', category: 'REPORT' as const, version: '1.0', description: 'R&D claim summary report' },
    { name: 'Client Letter', category: 'LETTER' as const, version: '1.0', description: 'Standard client correspondence' },
  ]

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: templates.indexOf(template) + 1 },
      update: template,
      create: template,
    })
  }

  console.log('✅ Default templates created')

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
