"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { AppNotification, Company } from "@/lib/types"
import { companies as initialCompanies } from "@/lib/data"

interface AppContextType {
  // Company state
  clientList: Company[]
  addClient: (client: Company) => void
  bulkAddClients: (clients: Company[]) => void
  
  // Notifications
  notifications: AppNotification[]
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void
  markNotificationRead: (id: string) => void
  
  // Gateway connection
  isGatewayConnected: boolean
  setGatewayConnected: (connected: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Company state
  const [clientList, setClientList] = useState<Company[]>(initialCompanies)
  
  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  
  // Gateway connection state
  const [isGatewayConnected, setGatewayConnected] = useState(true)

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
      addClient,
      bulkAddClients,
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
