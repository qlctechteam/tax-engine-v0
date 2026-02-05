import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from "@prisma/client"

type DemoUser = {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "ADMINISTRATOR" | "CLAIM_PROCESSOR"
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env")
  if (!fs.existsSync(envPath)) {
    return
  }
  const contents = fs.readFileSync(envPath, "utf8")
  for (const line of contents.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) {
      continue
    }
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

async function main() {
  loadEnvFile()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    process.exit(1)
  }

  const demoUser: DemoUser = {
    email: process.env.DEMO_USER_EMAIL || "demo@taxengine.io",
    password: process.env.DEMO_USER_PASSWORD || "demo123",
    firstName: process.env.DEMO_USER_FIRST_NAME || "Demo",
    lastName: process.env.DEMO_USER_LAST_NAME || "User",
    role: (process.env.DEMO_USER_ROLE as DemoUser["role"]) || "ADMINISTRATOR",
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Create or fetch auth user
  let userId: string | null = null
  const createResult = await supabase.auth.admin.createUser({
    email: demoUser.email,
    password: demoUser.password,
    email_confirm: true,
    user_metadata: {
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
    },
  })

  if (createResult.error) {
    const existingUsers = await supabase.auth.admin.listUsers({ perPage: 200 })
    const existing = existingUsers.data.users.find((u) => u.email === demoUser.email)
    if (!existing) {
      console.error("Failed to create user:", createResult.error.message)
      process.exit(1)
    }
    userId = existing.id
    console.log("Auth user already exists:", userId)
  } else {
    userId = createResult.data.user?.id || null
    console.log("Auth user created:", userId)
  }

  if (!userId) {
    console.error("Could not resolve auth user id.")
    process.exit(1)
  }

  // Upsert TaxEngineUsers profile using Prisma (avoids PostgREST permissions)
  const prisma = new PrismaClient()
  try {
    await prisma.taxEngineUser.upsert({
      where: { uuid: userId },
      update: {
        email: demoUser.email,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        role: demoUser.role,
        status: "ACTIVE",
      },
      create: {
        uuid: userId,
        email: demoUser.email,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        role: demoUser.role,
        status: "ACTIVE",
      },
    })
  } catch (error) {
    console.error("Failed to upsert TaxEngineUsers via Prisma:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }

  console.log("✅ Demo user is ready:", demoUser.email)
}

main().catch((err) => {
  console.error("Unexpected error:", err)
  process.exit(1)
})
