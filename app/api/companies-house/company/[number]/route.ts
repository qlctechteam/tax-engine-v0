import { NextRequest, NextResponse } from 'next/server'

const COMPANIES_HOUSE_API_URL = 'https://api.company-information.service.gov.uk'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params

  if (!number) {
    return NextResponse.json({ error: 'Company number is required' }, { status: 400 })
  }

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY

  if (!apiKey) {
    console.error('COMPANIES_HOUSE_API_KEY not configured')
    return NextResponse.json(
      { error: 'Companies House API not configured' },
      { status: 500 }
    )
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64')

    const response = await fetch(
      `${COMPANIES_HOUSE_API_URL}/company/${encodeURIComponent(number)}`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    )

    if (!response.ok) {
      console.error('Companies House API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch company details' },
        { status: response.status }
      )
    }

    const company = await response.json()

    // Extract the accounting reference date (year end)
    const accountingRefDate = company.accounts?.accounting_reference_date
    
    // Parse month and day - Companies House returns them as strings like "3" or "31"
    const yearEndMonth = accountingRefDate?.month ? parseInt(String(accountingRefDate.month), 10) : null
    const yearEndDay = accountingRefDate?.day ? parseInt(String(accountingRefDate.day), 10) : null
    
    console.log('Company:', company.company_name, 'Year end:', yearEndDay, '/', yearEndMonth)
    
    return NextResponse.json({
      name: company.company_name,
      number: company.company_number,
      status: company.company_status,
      type: company.type,
      dateOfCreation: company.date_of_creation,
      // Accounting reference date (year end)
      yearEndMonth,
      yearEndDay,
      // Full address
      registeredAddress: company.registered_office_address
        ? {
            line1: company.registered_office_address.address_line_1,
            line2: company.registered_office_address.address_line_2,
            locality: company.registered_office_address.locality,
            region: company.registered_office_address.region,
            postalCode: company.registered_office_address.postal_code,
            country: company.registered_office_address.country,
          }
        : null,
      // SIC codes
      sicCodes: company.sic_codes || [],
    })
  } catch (error) {
    console.error('Error fetching company details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company details' },
      { status: 500 }
    )
  }
}
