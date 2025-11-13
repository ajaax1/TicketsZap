"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/services/auth"

export function usePermissions() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSupport, setIsSupport] = useState(false)
  const [isAssistant, setIsAssistant] = useState(false)
  const [isCliente, setIsCliente] = useState(false)
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
      setIsCliente(userData.role === 'cliente')
    }
  }, [])

  const canManageUsers = isAdmin
  const canCreateUsers = isAdmin
  const canEditUsers = isAdmin
  const canDeleteUsers = isAdmin
  
  // Permissões de tickets
  const canEditTickets = isAdmin || isSupport || isAssistant
  const canDeleteTickets = isAdmin || isSupport
  const canDeleteAttachments = isAdmin || isSupport || isAssistant
  const canAssignCliente = isAdmin || isSupport

  return {
    user,
    isAdmin,
    isSupport,
    isAssistant,
    isCliente,
    canManageUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canEditTickets,
    canDeleteTickets,
    canDeleteAttachments,
    canAssignCliente,
    isHydrated
  }
}
