"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { AppNotification, Company } from "@/lib/types"
import { useClientCompanies, useGovernmentGateway, DbClientCompany } from "@/hooks/use-supabase-data"

interface AppContextType {
  // Company state
  clientList: Company[]
  isLoadingClients: boolean
  clientsError: string | null
  addClient: (client: Company) => void
  bulkAddClients: (clients: Company[]) => void
  refetchClients: () => void
  
  // Notifications
  notifications: AppNotification[]
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void
  markNotificationRead: (id: string) => void
  
  // Gateway connection
  isGatewayConnected: boolean
  setGatewayConnected: (connected: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Transform database company to UI company format
function transformCompany(dbCompany: DbClientCompany): Company {
  return {
    id: dbCompany.uuid, // Use UUID as the ID for URLs
    name: dbCompany.companyName,
    number: dbCompany.companyNumber || '',
    utr: dbCompany.utr || undefined,
    payeReference: dbCompany.payeReference || undefined,
    contactEmail: dbCompany.email || undefined,
    contactPhone: dbCompany.phone || undefined,
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Fetch companies from database
  const { 
    data: dbCompanies, 
    isLoading: isLoadingClients, 
    error: clientsError,
    refetch: refetchClients 
  } = useClientCompanies()
  
  // Fetch gateway status
  const { data: gateway } = useGovernmentGateway()
  
  // Transform database companies to UI format
  const [clientList, setClientList] = useState<Company[]>([])
  
  useEffect(() => {
    if (dbCompanies.length > 0) {
      setClientList(dbCompanies.map(transformCompany))
    }
  }, [dbCompanies])
  
  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  
  // Gateway connection state - derived from database
  const isGatewayConnected = gateway?.status === 'CONNECTED'
  const [, setGatewayConnected] = useState(true)

  const addClient = useCallback((client: Company) => {
    setClientList((prev) => [...prev, client])
  }, [])

  const bulkAddClients = useCallback((clients: Company[]) => {
    setClientList((prev) => [...prev, ...clients])
  }, [])

  const addNotification = useCallback((notification: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  return (
    <AppContext.Provider value={{
      clientList,
      isLoadingClients,
      clientsError,
      addClient,
      bulkAddClients,
      refetchClients,
      notifications,
      addNotification,
      markNotificationRead,
      isGatewayConnected,
      setGatewayConnected,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
