"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { getTicketStats } from "@/services/tickets"

export function TicketsStats() {
  const [stats, setStats] = useState({ total: 0, abertos: 0, resolvidos: 0, pendentes: 0 })

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getTicketStats()
        setStats({
          total: Number(data.total) || 0,
          abertos: Number(data.abertos) || 0,
          resolvidos: Number(data.resolvidos) || 0,
          pendentes: Number(data.pendentes) || 0,
        })
      } catch (e) {
        setStats({ total: 0, abertos: 0, resolvidos: 0, pendentes: 0 })
      }
    }
    fetchStats()
  }, [])

  const { total, abertos, resolvidos, pendentes } = stats

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">Todos os tickets registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
          <AlertCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{abertos}</div>
          <p className="text-xs text-muted-foreground mt-1">Aguardando atendimento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tickets Resolvidos</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{resolvidos}</div>
          <p className="text-xs text-muted-foreground mt-1">Finalizados com sucesso</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tickets Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{pendentes}</div>
          <p className="text-xs text-muted-foreground mt-1">Em análise ou aguardando</p>
        </CardContent>
      </Card>
    </div>
  )
}


