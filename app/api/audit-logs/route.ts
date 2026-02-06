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

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = getSupabaseAdmin()
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const category = searchParams.get('category')

    let query = supabase
      .from('AuditLog')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching audit logs:', error)
      return NextResponse.json(
        { error: `Failed to fetch audit logs: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ logs: logs || [] })
  } catch (error) {
    console.error('Error in GET /api/audit-logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
