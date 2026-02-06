import { NextRequest, NextResponse } from 'next/server'

const COMPANIES_HOUSE_API_URL = 'https://api.company-information.service.gov.uk'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ items: [] })
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
    // Basic auth with API key as username and empty password
    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64')

    const response = await fetch(
      `${COMPANIES_HOUSE_API_URL}/search/companies?q=${encodeURIComponent(query)}&items_per_page=10`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    )

    if (!response.ok) {
      console.error('Companies House API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to search Companies House' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transform the response to only include the fields we need
    const companies = (data.items || []).map((company: {
      title: string
      company_number: string
      company_status: string
      company_type: string
      date_of_creation: string
      registered_office_address?: {
        address_line_1?: string
        address_line_2?: string
        locality?: string
        region?: string
        postal_code?: string
        country?: string
      }
    }) => ({
      name: company.title,
      number: company.company_number,
      status: company.company_status,
      type: company.company_type,
      dateOfCreation: company.date_of_creation,
      address: company.registered_office_address
        ? [
            company.registered_office_address.address_line_1,
            company.registered_office_address.address_line_2,
            company.registered_office_address.locality,
            company.registered_office_address.region,
            company.registered_office_address.postal_code,
          ]
            .filter(Boolean)
            .join(', ')
        : null,
    }))

    return NextResponse.json({ items: companies })
  } catch (error) {
    console.error('Error searching Companies House:', error)
    return NextResponse.json(
      { error: 'Failed to search Companies House' },
      { status: 500 }
    )
  }
}
