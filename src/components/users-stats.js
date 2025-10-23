"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, HeadphonesIcon, UserCheck } from "lucide-react"
import { getUserStats } from "@/services/users"

export function UsersStats() {
  const [stats, setStats] = useState({ 
    total: 0, 
    admins: 0, 
    support: 0, 
    assistant: 0
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getUserStats()
        setStats({
          total: Number(data.total) || 0,
          admins: Number(data.admins) || 0,
          support: Number(data.support) || 0,
          assistant: Number(data.assistant) || 0,
        })
      } catch (e) {
        setStats({ 
          total: 0, 
          admins: 0, 
          support: 0, 
          assistant: 0
        })
      }
    }
    fetchStats()
  }, [])

  const { total, admins, support, assistant } = stats

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">Todos os usuários registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          <Shield className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{admins}</div>
          <p className="text-xs text-muted-foreground mt-1">Acesso total ao sistema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Suporte</CardTitle>
          <HeadphonesIcon className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{support}</div>
          <p className="text-xs text-muted-foreground mt-1">Atendimento ao cliente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assistentes</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{assistant}</div>
          <p className="text-xs text-muted-foreground mt-1">Auxiliares de suporte</p>
        </CardContent>
      </Card>
    </div>
  )
}
