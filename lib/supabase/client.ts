import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * Creates a Supabase client for use in browser/client components
 * This client uses the anon key and respects Row Level Security (RLS)
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Singleton instance for client-side use
 * Use this in React components and hooks
 */
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}
