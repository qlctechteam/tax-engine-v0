"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type {
  ClientCompany,
  AccountingPeriod,
  ClaimPack,
  Submission,
  AuditLog,
  Template,
  GovernmentGateway,
} from '@/lib/supabase/database.types'

/**
 * Hook to fetch client companies
 */
export function useClientCompanies() {
  const [data, setData] = useState<ClientCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data: companies, error: fetchError } = await supabase
        .from('client_companies')
        .select('*')
        .eq('isActive', true)
        .order('companyName', { ascending: true })

      if (fetchError) throw fetchError
      setData(companies || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies')
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
 * Hook to fetch a single client company by ID
 */
export function useClientCompany(id: number | string | null) {
  const [data, setData] = useState<ClientCompany | null>(null)
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
          ? supabase.from('client_companies').select('*').eq('id', id).single()
          : supabase.from('client_companies').select('*').eq('uuid', id).single()

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
export function useAccountingPeriods(clientCompanyId: number | null) {
  const [data, setData] = useState<AccountingPeriod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!clientCompanyId) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { data: periods, error: fetchError } = await supabase
          .from('accounting_period')
          .select('*')
          .eq('clientCompanyId', clientCompanyId)
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
  }, [clientCompanyId, supabase])

  return { data, isLoading, error }
}

/**
 * Hook to fetch claim packs
 */
export function useClaimPacks(clientCompanyId?: number) {
  const [data, setData] = useState<ClaimPack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('claim_packs')
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
  const [data, setData] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('submissions')
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
  const [data, setData] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        let query = supabase
          .from('audit_log')
          .select('*')
          .order('timestamp', { ascending: false })

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        if (options?.category) {
          query = query.eq('category', options.category)
        }

        const { data: logs, error: fetchError } = await query

        if (fetchError) throw fetchError
        setData(logs || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch audit logs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [options?.limit, options?.category, supabase])

  return { data, isLoading, error }
}

/**
 * Hook to fetch templates
 */
export function useTemplates() {
  const [data, setData] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { data: templates, error: fetchError } = await supabase
          .from('templates')
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
  const [data, setData] = useState<GovernmentGateway | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseClient()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data: gateway, error: fetchError } = await supabase
        .from('government_gateway')
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
