"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/services/auth"

export function usePermissions() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSupport, setIsSupport] = useState(false)
  const [isAssistant, setIsAssistant] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Marca como hidratado após a primeira renderização no cliente
    setIsHydrated(true)
    
    const userData = getCurrentUser()
    setUser(userData)
    
    if (userData?.role) {
      setIsAdmin(userData.role === 'admin')
      setIsSupport(userData.role === 'support')
      setIsAssistant(userData.role === 'assistant')
    }
  }, [])

  const canManageUsers = isAdmin
  const canCreateUsers = isAdmin
  const canEditUsers = isAdmin
  const canDeleteUsers = isAdmin

  return {
    user,
    isAdmin,
    isSupport,
    isAssistant,
    canManageUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    isHydrated
  }
}
