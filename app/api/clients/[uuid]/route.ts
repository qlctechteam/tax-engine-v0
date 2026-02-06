import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role for database operations
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }
  
  return createClient(url, key)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const { uuid } = await params
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    // Only update fields that are explicitly provided
    if (body.utr !== undefined) {
      updateData.utr = body.utr || null
    }
    if (body.payeReference !== undefined) {
      updateData.payeReference = body.payeReference || null
    }
    if (body.email !== undefined) {
      updateData.email = body.email || null
    }
    if (body.phone !== undefined) {
      updateData.phone = body.phone || null
    }
    if (body.companyName !== undefined) {
      updateData.companyName = body.companyName
    }

    const { data: updatedClient, error: updateError } = await supabase
      .from('ClientCompanies')
      .update(updateData)
      .eq('uuid', uuid)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating client:', updateError)
      return NextResponse.json(
        { error: `Failed to update client: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      client: updatedClient,
    })
  } catch (error) {
    console.error('Error in PATCH /api/clients/[uuid]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
