/**
 * Supabase Client Exports
 * 
 * Use these exports based on your context:
 * 
 * Client Components:
 *   import { getSupabaseClient } from '@/lib/supabase'
 * 
 * Server Components / Route Handlers:
 *   import { createServerSupabaseClient } from '@/lib/supabase/server'
 * 
 * Middleware:
 *   import { updateSession } from '@/lib/supabase/middleware'
 */

export { createClient, getSupabaseClient } from './client'
export type { Database } from './database.types'
export type * from './database.types'
