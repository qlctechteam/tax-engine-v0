import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// Use service_role key to bypass RLS
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Missing userId or userEmail' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('TaxEngineUsers')
      .select('*')
      .eq('uuid', userId)
      .single()

    if (existingProfile) {
      return NextResponse.json({ profile: existingProfile, created: false })
    }

    // Check if this is the first user (make them admin)
    const { count } = await supabase
      .from('TaxEngineUsers')
      .select('*', { count: 'exact', head: true })

    const isFirstUser = count === 0
    const role = isFirstUser ? 'ADMINISTRATOR' : 'CLAIM_PROCESSOR'

    // Create the profile
    const now = new Date().toISOString()
    const { data: newProfile, error: insertError } = await supabase
      .from('TaxEngineUsers')
      .insert({
        uuid: userId,
        email: userEmail,
        role: role,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating profile:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Create audit log entry for new user
    try {
      await supabase.from('AuditLog').insert({
        uuid: randomUUID(),
        userId: newProfile.id,
        action: 'User account created',
        category: 'USER',
        details: JSON.stringify({ email: userEmail, role: role }),
        timestamp: now,
      })
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError)
    }

    return NextResponse.json({ profile: newProfile, created: true })
  } catch (error) {
    console.error('Error in create-profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
