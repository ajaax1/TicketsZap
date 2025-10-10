"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FilterX } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getUsers } from "@/services/users";

export function TicketFilters() {
  const [dateRange, setDateRange] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [selectedStatus, setSelectedStatus] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchUsers() {
    if (users.length === 0) {
      setIsLoadingUsers(true);
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    }
  }

  function handleClearFilters() {
    setDateRange(null);
    setSelectedUser(undefined);
    setSelectedStatus(undefined);
    setSearchTerm("");
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Pesquisar por título"
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 min-w-[150px]">
        <Select onValueChange={setSelectedStatus} value={selectedStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Aberto</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="closed">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <Select
          onOpenChange={fetchUsers}
          onValueChange={setSelectedUser}
          value={selectedUser}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingUsers ? "Carregando..." : "Usuário"} />
          </SelectTrigger>
          <SelectContent>
            {users.length > 0
              ? users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.name}
                  </SelectItem>
                ))
              : !isLoadingUsers && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>
                {dateRange?.from
                  ? dateRange.to
                    ? `${format(dateRange.from, "dd/MM/yy", { locale: ptBR })} - ${format(
                        dateRange.to,
                        "dd/MM/yy",
                        { locale: ptBR }
                      )}`
                    : format(dateRange.from, "dd/MM/yy", { locale: ptBR })
                  : "Data de criação"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="range" selected={dateRange} onSelect={setDateRange} locale={ptBR} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-shrink-0">
        <Button variant="outline" onClick={handleClearFilters}>
          <FilterX className="mr-2 h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
