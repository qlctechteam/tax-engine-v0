"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

// Types matching the Prisma schema
export interface DbClientCompany {
  id: number
  uuid: string
  companyName: string
  companyNumber: string | null
  utr: string | null
  payeReference: string | null
  email: string | null
  phone: string | null
  isActive: boolean
  companyYearEndMonth: number | null
  companyYearEndDay: number | null
  createdAt: string
  updatedAt: string
}

export interface DbAccountingPeriod {
  id: number
  uuid: string
  clientCompanyId: number | null
  status: string | null
  startDate: string | null
  endDate: string | null
  value: number | null
  createdAt: string
  updatedAt: string
}

export interface DbClaimPack {
  id: number
  uuid: string
  title: string
  status: string
  currentStage: string
  progress: number
  clientCompanyId: number
  createdAt: string
  updatedAt: string
}

export interface DbSubmission {
  id: number
  uuid: string
  title: string
  status: string
  clientCompanyId: number
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DbAuditLog {
  id: number
  uuid: string
  action: string
  details: string | null
  category: string
  userId: number | null
  timestamp: string
}

export interface DbTemplate {
  id: number
  uuid: string
  name: string
  description: string | null
  category: string
  version: string
  isActive: boolean
}

export interface DbGovernmentGateway {
  id: number
  uuid: string
  agentUserId: string
  status: string
  isDefault: boolean
  lastVerifiedAt: string | null
}

export interface DbTaxEngineUser {
  id: number
  uuid: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  status: string
  lastLoginAt: string | null
}

/**
 * Hook to fetch client companies from database
 */
export function useClientCompanies() {
  const [data, setData] = useState<DbClientCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Fetching client companies...')
      const { data: companies, error: fetchError } = await supabase
        .from('ClientCompanies')
        .select('*')
        .eq('isActive', true)
        .order('companyName', { ascending: true })

      if (fetchError) {
        console.error('Error fetching companies:', fetchError.message, fetchError.code)
        throw fetchError
      }
      console.log('Fetched companies:', companies?.length || 0)
      setData(companies || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch companies'
      console.error('useClientCompanies error:', message)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Hook to fetch a single client company by ID or UUID
 */
export function useClientCompany(id: number | string | null) {
  const [data, setData] = useState<DbClientCompany | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const query = typeof id === 'number'
          ? supabase.from('ClientCompanies').select('*').eq('id', id).single()
          : supabase.from('ClientCompanies').select('*').eq('uuid', id).single()

        const { data: company, error: fetchError } = await query

        if (fetchError) throw fetchError
        setData(company)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch company')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, supabase])

  return { data, isLoading, error }
}

/**
 * Hook to fetch accounting periods for a company
 */
export function useAccountingPeriods(clientCompanyUuid: string | null) {
  const [data, setData] = useState<DbAccountingPeriod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  
  const supabase = getSupabaseClient()

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (!clientCompanyUuid) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { data: periods, error: fetchError } = await supabase
          .from('AccountingPeriods')
          .select('*')
          .eq('clientCompanyUuid', clientCompanyUuid)
          .order('endDate', { ascending: false })

        if (fetchError) throw fetchError
        setData(periods || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch accounting periods')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [clientCompanyUuid, supabase, refetchTrigger])

  return { data, isLoading, error, refetch }
}

/**
 * Hook to fetch claim packs
 */
export function useClaimPacks(clientCompanyId?: number) {
  const [data, setData] = useState<DbClaimPack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('ClaimPacks')
        .select('*')
        .order('createdAt', { ascending: false })

      if (clientCompanyId) {
        query = query.eq('clientCompanyId', clientCompanyId)
      }

      const { data: claims, error: fetchError } = await query

      if (fetchError) throw fetchError
      setData(claims || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch claims')
    } finally {
      setIsLoading(false)
    }
  }, [clientCompanyId, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Hook to fetch submissions
 */
export function useSubmissions(clientCompanyId?: number) {
  const [data, setData] = useState<DbSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('Submissions')
        .select('*')
        .order('createdAt', { ascending: false })

      if (clientCompanyId) {
        query = query.eq('clientCompanyId', clientCompanyId)
      }

      const { data: submissions, error: fetchError } = await query

      if (fetchError) throw fetchError
      setData(submissions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions')
    } finally {
      setIsLoading(false)
    }
  }, [clientCompanyId, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Hook to fetch audit logs
 */
export function useAuditLogs(options?: { limit?: number; category?: string }) {
  const [data, setData] = useState<DbAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        console.log('Fetching audit logs via API...')
        const params = new URLSearchParams()
        if (options?.limit) params.set('limit', String(options.limit))
        if (options?.category) params.set('category', options.category)
        
        const response = await fetch(`/api/audit-logs?${params.toString()}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch audit logs')
        }
        
        console.log('Fetched audit logs:', result.logs?.length || 0)
        setData(result.logs || [])
      } catch (err) {
        console.error('useAuditLogs error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch audit logs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [options?.limit, options?.category])

  return { data, isLoading, error }
}

/**
 * Hook to fetch templates
 */
export function useTemplates() {
  const [data, setData] = useState<DbTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { data: templates, error: fetchError } = await supabase
          .from('Templates')
          .select('*')
          .eq('isActive', true)
          .order('name', { ascending: true })

        if (fetchError) throw fetchError
        setData(templates || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  return { data, isLoading, error }
}

/**
 * Hook to fetch Government Gateway status
 */
export function useGovernmentGateway() {
  const [data, setData] = useState<DbGovernmentGateway | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data: gateway, error: fetchError } = await supabase
        .from('GovernmentGateway')
        .select('*')
        .eq('isDefault', true)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is OK
        throw fetchError
      }
      setData(gateway)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gateway status')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Hook to fetch TaxEngine users (for settings page)
 */
export function useTaxEngineUsers() {
  const [data, setData] = useState<DbTaxEngineUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { data: users, error: fetchError } = await supabase
          .from('TaxEngineUsers')
          .select('*')
          .order('createdAt', { ascending: false })

        if (fetchError) throw fetchError
        setData(users || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  return { data, isLoading, error }
}
