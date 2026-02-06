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
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = getSupabaseAdmin()
    const body = await request.json()
    
    const { clientCompanyUuid, startDate, endDate } = body

    if (!clientCompanyUuid || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Client company UUID, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Get the client company to get the integer ID
    const { data: company, error: companyError } = await supabase
      .from('ClientCompanies')
      .select('id')
      .eq('uuid', clientCompanyUuid)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Client company not found' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()
    const periodUuid = randomUUID()

    // Create the accounting period
    const { data: newPeriod, error: insertError } = await supabase
      .from('AccountingPeriods')
      .insert({
        uuid: periodUuid,
        clientCompanyId: company.id,
        clientCompanyUuid: clientCompanyUuid,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status: 'NOT_STARTED',
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating accounting period:', insertError)
      return NextResponse.json(
        { error: `Failed to create accounting period: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Create audit log
    await supabase.from('AuditLog').insert({
      uuid: randomUUID(),
      action: 'Accounting period created',
      details: `New accounting period: ${startDate} to ${endDate}`,
      category: 'CLIENT',
      clientCompanyId: company.id,
      timestamp: now,
    })

    return NextResponse.json({
      success: true,
      period: newPeriod,
    })
  } catch (error) {
    console.error('Error in POST /api/accounting-periods:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
