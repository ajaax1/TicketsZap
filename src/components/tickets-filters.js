"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Filter } from "lucide-react"
import { useState } from "react"

export function TicketsFilters() {
  const [statusFilter, setStatusFilter] = useState("todos")
  const [ownerFilter, setOwnerFilter] = useState("todos")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Tickets de Suporte</h2>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie e acompanhe todos os chamados de suporte</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Ticket
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-foreground whitespace-nowrap">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="todos">Todos</option>
            <option value="aberto">Aberto</option>
            <option value="pendente">Pendente</option>
            <option value="resolvido">Resolvido</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar tickets..." className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="owner-filter" className="text-sm font-medium text-foreground whitespace-nowrap">
              Dono:
            </label>
            <select
              id="owner-filter"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="todos">Todos</option>
              <option value="joao-silva">João Silva</option>
              <option value="maria-santos">Maria Santos</option>
              <option value="pedro-oliveira">Pedro Oliveira</option>
              <option value="ana-costa">Ana Costa</option>
            </select>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
