"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, HeadphonesIcon, UserCheck, UserCircle } from "lucide-react"
import { getUserStats } from "@/services/users"

export function UsersStats() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({ 
    total: 0, 
    admins: 0, 
    support: 0, 
    assistant: 0,
    cliente: 0
  })

  useEffect(() => {
    setMounted(true)
    async function fetchStats() {
      try {
        const data = await getUserStats()
        setStats({
          total: Number(data.total) || 0,
          admins: Number(data.admins) || 0,
          support: Number(data.support) || 0,
          assistant: Number(data.assistant) || 0,
          cliente: Number(data.cliente) || 0,
        })
      } catch (e) {
        console.error('Erro ao buscar estatísticas:', e)
        setStats({ 
          total: 0, 
          admins: 0, 
          support: 0, 
          assistant: 0,
          cliente: 0
        })
      }
    }
    fetchStats()
  }, [])

  const { total, admins, support, assistant, cliente } = stats

  // Renderiza sempre a mesma estrutura para evitar erro de hidratação
  // Os valores serão atualizados após o fetch, mas a estrutura HTML permanece igual
  // suppressHydrationWarning evita warnings quando extensões do navegador modificam o HTML
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5" suppressHydrationWarning>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" suppressHydrationWarning>{total}</div>
          <p className="text-xs text-muted-foreground mt-1">Todos os usuários registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          <Shield className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600" suppressHydrationWarning>{admins}</div>
          <p className="text-xs text-muted-foreground mt-1">Acesso total ao sistema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Suporte</CardTitle>
          <HeadphonesIcon className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600" suppressHydrationWarning>{support}</div>
          <p className="text-xs text-muted-foreground mt-1">Atendimento ao cliente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assistentes</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600" suppressHydrationWarning>{assistant}</div>
          <p className="text-xs text-muted-foreground mt-1">Auxiliares de suporte</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <UserCircle className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600" suppressHydrationWarning>{cliente}</div>
          <p className="text-xs text-muted-foreground mt-1">Clientes cadastrados</p>
        </CardContent>
      </Card>
    </div>
  )
}
