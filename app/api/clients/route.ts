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
    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error - missing database credentials' },
        { status: 500 }
      )
    }

    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const {
      companyName,
      companyNumber,
      utr,
      payeReference,
      contactName,
      contactEmail,
      contactPhone,
      companyYearEndMonth,
      companyYearEndDay,
    } = body

    console.log('Creating client:', { companyName, companyNumber, companyYearEndMonth, companyYearEndDay })

    // Validate required fields
    if (!companyName || !companyNumber) {
      return NextResponse.json(
        { error: 'Company name and number are required' },
        { status: 400 }
      )
    }


    // Check if company already exists
    const { data: existingCompany, error: checkError } = await supabase
      .from('ClientCompanies')
      .select('id')
      .eq('companyNumber', companyNumber)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected
      console.error('Error checking existing company:', checkError)
      return NextResponse.json(
        { error: `Database error: ${checkError.message}` },
        { status: 500 }
      )
    }

    if (existingCompany) {
      return NextResponse.json(
        { error: 'A client with this company number already exists' },
        { status: 409 }
      )
    }

    // Insert the new client
    const now = new Date().toISOString()
    const clientUuid = randomUUID()
    
    const yearEndMonth = companyYearEndMonth || null
    const yearEndDay = companyYearEndDay || null
    
    const { data: newClient, error: insertError } = await supabase
      .from('ClientCompanies')
      .insert({
        uuid: clientUuid,
        companyName,
        companyNumber,
        utr: utr || null,
        payeReference: payeReference || null,
        email: contactEmail || null,
        phone: contactPhone || null,
        // Store contact name in bio field for now (or we could add a dedicated field)
        bio: contactName ? `Key Contact: ${contactName}` : null,
        isActive: true,
        sicCodes: [],
        companyYearEndMonth: yearEndMonth,
        companyYearEndDay: yearEndDay,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating client:', insertError)
      return NextResponse.json(
        { error: `Failed to create client: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Create 3 accounting periods: 2 past + 1 future (only if year end is provided)
    let periodsCreated = 0
    if (yearEndMonth && yearEndDay) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      
      // Calculate the most recent past year end date
      // If we haven't reached this year's year end yet, the most recent past is last year
      let mostRecentPastYearEndYear = currentYear
      const thisYearEnd = new Date(currentYear, yearEndMonth - 1, yearEndDay)
      if (currentDate < thisYearEnd) {
        mostRecentPastYearEndYear = currentYear - 1
      }
      
      // Create 3 periods: 2 past and 1 future
      const periods = []
      
      // 1 future period (next year end after the most recent past)
      const futureEndYear = mostRecentPastYearEndYear + 1
      const futureEndDate = new Date(futureEndYear, yearEndMonth - 1, yearEndDay)
      const futureStartDate = new Date(futureEndYear - 1, yearEndMonth - 1, yearEndDay + 1)
      periods.push({
        uuid: randomUUID(),
        clientCompanyId: newClient.id,
        clientCompanyUuid: clientUuid,
        startDate: futureStartDate.toISOString(),
        endDate: futureEndDate.toISOString(),
        status: 'NOT_STARTED',
        createdAt: now,
        updatedAt: now,
      })
      
      // 2 past periods
      for (let i = 0; i < 2; i++) {
        const endYear = mostRecentPastYearEndYear - i
        const endDate = new Date(endYear, yearEndMonth - 1, yearEndDay)
        const startDate = new Date(endYear - 1, yearEndMonth - 1, yearEndDay + 1)
        
        periods.push({
          uuid: randomUUID(),
          clientCompanyId: newClient.id,
          clientCompanyUuid: clientUuid,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'NOT_STARTED',
          createdAt: now,
          updatedAt: now,
        })
      }
      
      // Insert accounting periods
      const { error: periodsError } = await supabase
        .from('AccountingPeriods')
        .insert(periods)
      
      if (periodsError) {
        console.error('Error creating accounting periods:', periodsError)
        // Don't fail the whole request, just log the error
      } else {
        periodsCreated = periods.length
        console.log(`Created ${periods.length} accounting periods for ${companyName}`)
      }
    }

    // Also create an audit log entry
    await supabase.from('AuditLog').insert({
      uuid: randomUUID(),
      action: 'Client created',
      details: periodsCreated > 0 
        ? `New client added: ${companyName} (${companyNumber}) with ${periodsCreated} accounting periods`
        : `New client added: ${companyName} (${companyNumber})`,
      category: 'CLIENT',
      timestamp: now,
    })

    return NextResponse.json({
      success: true,
      client: {
        id: newClient.uuid,
        name: newClient.companyName,
        number: newClient.companyNumber,
        utr: newClient.utr,
        payeReference: newClient.payeReference,
        contactEmail: newClient.email,
        contactPhone: newClient.phone,
        yearEndMonth: newClient.companyYearEndMonth,
        yearEndDay: newClient.companyYearEndDay,
      },
      accountingPeriods: periodsCreated,
    })
  } catch (error) {
    console.error('Error in POST /api/clients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Bulk import clients
export async function PUT(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error - missing database credentials' },
        { status: 500 }
      )
    }

    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const { clients } = body

    if (!clients || !Array.isArray(clients) || clients.length === 0) {
      return NextResponse.json(
        { error: 'Clients array is required' },
        { status: 400 }
      )
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (const client of clients) {
      // Check if company already exists
      const { data: existingCompany } = await supabase
        .from('ClientCompanies')
        .select('id')
        .eq('companyNumber', client.number)
        .single()

      if (existingCompany) {
        results.skipped++
        results.errors.push(`${client.name} (${client.number}) - already exists`)
        continue
      }

      // Insert the client
      const now = new Date().toISOString()
      const { error: insertError } = await supabase
        .from('ClientCompanies')
        .insert({
          uuid: randomUUID(),
          companyName: client.name,
          companyNumber: client.number,
          utr: client.utr || null,
          payeReference: client.payeReference || null,
          email: client.contactEmail || null,
          phone: client.contactPhone || null,
          bio: client.contactName ? `Key Contact: ${client.contactName}` : null,
          isActive: true,
          sicCodes: [],
          createdAt: now,
          updatedAt: now,
        })

      if (insertError) {
        results.errors.push(`${client.name} - failed to create`)
      } else {
        results.created++
      }
    }

    // Create audit log for bulk import
    if (results.created > 0) {
      const auditNow = new Date().toISOString()
      await supabase.from('AuditLog').insert({
        uuid: randomUUID(),
        action: 'Bulk client import',
        details: `Imported ${results.created} clients (${results.skipped} skipped)`,
        category: 'CLIENT',
        timestamp: auditNow,
      })
    }

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error('Error in PUT /api/clients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
