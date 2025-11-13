"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, FilterX } from "lucide-react";
import { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";

export function UsersFilters({ onApply, initialFilters = {} }) {
  const [roleFilter, setRoleFilter] = useState(initialFilters.role || "todos");
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || "");
  const { canCreateUsers, isHydrated } = usePermissions();

  // Atualiza os filtros quando initialFilters mudam
  useEffect(() => {
    setRoleFilter(initialFilters.role || "todos");
    setSearchTerm(initialFilters.search || "");
  }, [initialFilters]);

  function handleClear() {
    setRoleFilter("todos");
    setSearchTerm("");
    onApply?.({
      role: "todos",
      search: "",
    });
  }

  return (
    <div className="space-y-6 mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Usuários do Sistema
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie e acompanhe todos os usuários do sistema
          </p>
        </div>
        {isHydrated && canCreateUsers && (
          <Button className="gap-2 cursor-pointer" asChild>
            <Link href="/users/new">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Link>
          </Button>
        )}
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
                  placeholder="Buscar usuários..."
                  className="pl-9 h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* 👤 Função */}
            <div className="flex-shrink-0">
              <label htmlFor="role-filter" className="block text-sm font-medium text-foreground mb-1">Função</label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-40 h-10 rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="todos">Todos</option>
                <option value="admin">Administrador</option>
                <option value="support">Suporte</option>
                <option value="assistant">Assistente</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
          </div>

          {/* 🔘 Botões de ação */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-10 cursor-pointer"
              onClick={() => {
                onApply?.({
                  role: roleFilter,
                  search: searchTerm,
                });
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" className="h-10 cursor-pointer" onClick={handleClear}>
              <FilterX className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
