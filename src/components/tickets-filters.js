"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Calendar as CalendarIcon, FilterX } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getUsersAlphabetical } from "@/services/users";

export function TicketsFilters({ onApply }) {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [ownerFilter, setOwnerFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const usersData = await getUsersAlphabetical();
        setUsers(usersData);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    }
    loadUsers();
  }, []);

  function handleClear() {
    setStatusFilter("todos");
    setOwnerFilter("todos");
    setPriorityFilter("todos");
    setSearchTerm("");
    setDateRange(null);
    onApply?.({
      status: "todos",
      owner: "todos",
      priority: "todos",
      search: "", // 🔄 alterado de q → search
      from: undefined,
      to: undefined
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Tickets de Suporte
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie e acompanhe todos os chamados de suporte
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/tickets/new">
            <Plus className="h-4 w-4" />
            Novo Ticket
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3 justify-between">
          <div className="flex flex-wrap items-end gap-3">
            {/* 🔍 Campo de busca */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-foreground mb-1">Buscar</label>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar tickets..."
                  className="pl-9 h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* 🔖 Status */}
            <div className="flex-shrink-0">
              <label htmlFor="status-filter" className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-32 h-10 rounded-md border border-input bg-background pl-3 pr-12 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="todos">Todos</option>
                <option value="aberto">Aberto</option>
                <option value="pendente">Pendente</option>
                <option value="resolvido">Resolvido</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            {/* 👤 Responsável */}
            <div className="flex-shrink-0">
              <label htmlFor="owner-filter" className="block text-sm font-medium text-foreground mb-1">Responsável</label>
              <select
                id="owner-filter"
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="w-40 h-10 rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="todos">Todos</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ⚠️ Prioridade */}
            <div className="flex-shrink-0">
              <label htmlFor="priority-filter" className="block text-sm font-medium text-foreground mb-1">Prioridade</label>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-32 h-10 rounded-md border border-input bg-background pl-3 pr-12 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="todos">Todos</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            {/* 📅 Período */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-foreground mb-1">Período</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-52 h-10 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>
                      {dateRange?.from
                        ? dateRange.to
                          ? `${format(dateRange.from, "dd/MM/yy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yy", { locale: ptBR })}`
                          : format(dateRange.from, "dd/MM/yy", { locale: ptBR })
                        : "Selecione um período"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} locale={ptBR} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* 🔘 Botões de ação */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-10"
              onClick={() => {
                const from = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
                const to = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;
                onApply?.({
                  status: statusFilter,
                  owner: ownerFilter,
                  priority: priorityFilter,
                  search: searchTerm, // 🔄 alterado de q → search
                  from,
                  to
                });
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" className="h-10" onClick={handleClear}>
              <FilterX className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
