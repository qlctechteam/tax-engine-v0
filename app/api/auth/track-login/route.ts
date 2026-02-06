import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Create Supabase client with service role for database operations
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }
  
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const { userId, userEmail } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Tracking login for user:', userEmail)

    // Get the user profile to get the integer id
    const { data: userProfile, error: profileError } = await supabase
      .from('TaxEngineUsers')
      .select('id, email')
      .eq('uuid', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      // Don't fail the request, just log
    }

    const now = new Date().toISOString()

    // Update last login timestamp
    const { error: updateError } = await supabase
      .from('TaxEngineUsers')
      .update({ lastLoginAt: now })
      .eq('uuid', userId)

    if (updateError) {
      console.error('Error updating lastLoginAt:', updateError)
    }

    // Create audit log entry
    const { error: auditError } = await supabase
      .from('AuditLog')
      .insert({
        uuid: randomUUID(),
        action: 'User logged in',
        details: `${userEmail || 'User'} signed in successfully`,
        category: 'AUTH',
        userId: userProfile?.id || null,
        timestamp: now,
      })

    if (auditError) {
      console.error('Error creating audit log:', auditError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
