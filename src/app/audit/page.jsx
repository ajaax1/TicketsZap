"use client"

/**
 * Página de Auditoria - Logs de Atividades do Sistema
 * Apenas para Administradores
 */

import { useEffect, useState } from "react"
import { TicketsHeader } from "@/components/tickets-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityLogsList } from "@/components/activity-logs-list"
import { getActivityLogsStats } from "@/services/activityLogs"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Activity, Shield, TrendingUp } from "lucide-react"
import { usePermissions } from "@/hooks/usePermissions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function AuditPage() {
  const { isAdmin, isHydrated } = usePermissions()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    // Verifica permissões apenas após hidratação
    if (isHydrated && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.")
      router.push('/')
      return
    }
  }, [isAdmin, isHydrated, router])

  useEffect(() => {
    async function loadStats() {
      try {
        setLoadingStats(true)
        const data = await getActivityLogsStats({ period })
        setStats(data)
      } catch (error) {
        // Não mostra erro se for 404 (rota não implementada ainda)
        if (error?.response?.status !== 404) {
          console.error('Erro ao carregar estatísticas de logs:', error)
        }
      } finally {
        setLoadingStats(false)
      }
    }

    if (isHydrated && isAdmin) {
      loadStats()
    }
  }, [period, isAdmin, isHydrated])

  // Aguarda hidratação antes de verificar permissões
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background" suppressHydrationWarning>
        <TicketsHeader />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingSpinner text="Verificando permissões..." />
        </div>
      </div>
    )
  }

  // Se não for admin após hidratação, não renderiza
  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <TicketsHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="mb-6" suppressHydrationWarning>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Auditoria do Sistema
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize todos os logs de atividades do sistema para auditoria e rastreamento
          </p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Todas as ações registradas
                </p>
              </CardContent>
            </Card>

            {stats.by_action && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Criados</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.by_action.created || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Itens criados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Atualizados</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.by_action.updated || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Itens atualizados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deletados</CardTitle>
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {stats.by_action.deleted || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Itens deletados
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Lista de Logs */}
        <ActivityLogsList
          showFilters={true}
          allowUserFilter={true}
          title="Logs de Atividades"
          description="Histórico completo de todas as ações realizadas no sistema. Você pode filtrar por usuário, ação e período."
        />
      </div>
    </div>
  )
}

