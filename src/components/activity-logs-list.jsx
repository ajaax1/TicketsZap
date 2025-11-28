"use client"

/**
 * Componente genérico para exibir lista de logs de atividades
 * Pode ser usado em diferentes contextos (auditoria, perfil, etc.)
 */

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { getActivityLogs } from "@/services/activityLogs"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  RefreshCw,
  Calendar,
  Filter
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/pagination"
import { getUsersAlphabetical } from "@/services/users"
import { usePermissions } from "@/hooks/usePermissions"

const getActionIcon = (action) => {
  switch (action) {
    case 'created':
      return <Plus className="h-4 w-4 text-green-600" />
    case 'updated':
      return <Edit className="h-4 w-4 text-blue-600" />
    case 'deleted':
      return <Trash2 className="h-4 w-4 text-red-600" />
    case 'viewed':
      return <Eye className="h-4 w-4 text-gray-600" />
    case 'assigned':
      return <UserCheck className="h-4 w-4 text-purple-600" />
    case 'status_changed':
      return <RefreshCw className="h-4 w-4 text-orange-600" />
    default:
      return <Calendar className="h-4 w-4 text-gray-600" />
  }
}

const getActionLabel = (action) => {
  const labels = {
    created: 'Criado',
    updated: 'Atualizado',
    deleted: 'Deletado',
    viewed: 'Visualizado',
    assigned: 'Atribuído',
    status_changed: 'Status alterado'
  }
  return labels[action] || action
}

const getActionColor = (action) => {
  switch (action) {
    case 'created':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    case 'updated':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    case 'deleted':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    case 'viewed':
      return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    case 'assigned':
      return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    case 'status_changed':
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    default:
      return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
  }
}

const formatModelType = (modelType) => {
  if (!modelType) return ''
  const parts = modelType.split('\\')
  const modelName = parts[parts.length - 1]
  
  const labels = {
    Ticket: 'Ticket',
    TicketMessage: 'Mensagem',
    TicketAttachment: 'Anexo',
    MessageAttachment: 'Anexo de Mensagem'
  }
  
  return labels[modelName] || modelName
}

export function ActivityLogsList({ 
  filters = {},
  showFilters = false,
  title = "Logs de Atividades",
  description = "Histórico completo de ações realizadas no sistema",
  allowUserFilter = false // Se true, permite filtrar por usuário
}) {
  const { isAdmin, isSupport, isAssistant } = usePermissions()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAction, setSelectedAction] = useState(filters.action || 'all')
  const [selectedPeriod, setSelectedPeriod] = useState(filters.period || 'month')
  const [selectedUserId, setSelectedUserId] = useState(filters.user_id || 'all')
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  // Verifica se pode filtrar por outros usuários
  const canFilterByUser = allowUserFilter && (isAdmin || isSupport || isAssistant)

  // Carrega lista de usuários se pode filtrar por usuário
  useEffect(() => {
    async function loadUsers() {
      if (!canFilterByUser) return
      
      try {
        setLoadingUsers(true)
        const usersData = await getUsersAlphabetical()
        setUsers(Array.isArray(usersData) ? usersData : [])
      } catch (err) {
        console.error('Erro ao carregar usuários:', err)
      } finally {
        setLoadingUsers(false)
      }
    }

    loadUsers()
  }, [canFilterByUser])

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true)
        setError(null)
        
        const params = {
          page: currentPage,
          per_page: 50,
          ...filters
        }

        if (selectedAction !== 'all') {
          params.action = selectedAction
        }

        if (selectedPeriod && selectedPeriod !== 'all') {
          params.period = selectedPeriod
        }

        // Adiciona filtro de usuário se selecionado
        if (canFilterByUser && selectedUserId && selectedUserId !== 'all') {
          params.user_id = selectedUserId
        }

        const response = await getActivityLogs(params)
        setLogs(response.data || [])
        setPagination({
          current_page: response.current_page || 1,
          last_page: response.last_page || 1,
          per_page: response.per_page || 50,
          total: response.total || 0
        })
      } catch (err) {
        console.error('Erro ao carregar logs de atividades:', err)
        // Não mostra erro se for 404 (rota não implementada ainda)
        if (err?.response?.status !== 404) {
          setError('Não foi possível carregar os logs de atividades')
        }
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [currentPage, selectedAction, selectedPeriod, selectedUserId, canFilterByUser, JSON.stringify(filters)])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedAction, selectedPeriod, selectedUserId])

  if (loading && !logs.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="mb-6 flex gap-4 flex-wrap">
              {canFilterByUser && (
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Usuário</label>
                  <Select 
                    value={selectedUserId} 
                    onValueChange={setSelectedUserId}
                    disabled={loadingUsers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingUsers ? "Carregando..." : "Todos os usuários"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os usuários</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} {user.email && `(${user.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Ação</label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    <SelectItem value="created">Criado</SelectItem>
                    <SelectItem value="updated">Atualizado</SelectItem>
                    <SelectItem value="deleted">Deletado</SelectItem>
                    <SelectItem value="viewed">Visualizado</SelectItem>
                    <SelectItem value="assigned">Atribuído</SelectItem>
                    <SelectItem value="status_changed">Status alterado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <LoadingSpinner text="Carregando logs de atividades..." size="small" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="mb-6 flex gap-4 flex-wrap">
            {canFilterByUser && (
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Usuário</label>
                <Select 
                  value={selectedUserId} 
                  onValueChange={setSelectedUserId}
                  disabled={loadingUsers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? "Carregando..." : "Todos os usuários"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name} {user.email && `(${user.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Ação</label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="created">Criado</SelectItem>
                  <SelectItem value="updated">Atualizado</SelectItem>
                  <SelectItem value="deleted">Deletado</SelectItem>
                  <SelectItem value="viewed">Visualizado</SelectItem>
                  <SelectItem value="assigned">Atribuído</SelectItem>
                  <SelectItem value="status_changed">Status alterado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Hoje</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {(!logs || logs.length === 0) && !loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {error ? (
              <p>Não foi possível carregar os logs de atividades.</p>
            ) : (
              <p>Nenhuma atividade registrada com os filtros selecionados.</p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${getActionColor(log.action)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm">
                          {getActionLabel(log.action)}
                        </span>
                        {log.model_type && (
                          <Badge variant="outline" className="text-xs">
                            {formatModelType(log.model_type)}
                          </Badge>
                        )}
                        {log.user && (
                          <span className="text-sm text-muted-foreground">
                            por <span className="font-medium">{log.user.name}</span>
                          </span>
                        )}
                      </div>
                      
                      {log.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {log.description}
                        </p>
                      )}

                      {/* Link para ticket se disponível */}
                      {log.model_type?.includes('Ticket') && log.model_id && (
                        <div className="mb-2">
                          <a 
                            href={`/tickets/${log.model_id}`}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            Ver ticket #{log.model_id} →
                          </a>
                        </div>
                      )}

                      {/* Mostrar mudanças de status */}
                      {log.action === 'status_changed' && log.old_values?.status && log.new_values?.status && (
                        <div className="text-sm mb-2 p-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground font-medium">Status: </span>
                          <span className="font-medium line-through text-red-600">
                            {log.old_values.status}
                          </span>
                          <span className="mx-2">→</span>
                          <span className="font-medium text-green-600">
                            {log.new_values.status}
                          </span>
                        </div>
                      )}

                      {/* Mostrar mudança de prioridade */}
                      {log.action === 'updated' && log.old_values?.priority && log.new_values?.priority && 
                       log.old_values.priority !== log.new_values.priority && (
                        <div className="text-sm mb-2 p-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground font-medium">Prioridade: </span>
                          <span className="font-medium line-through text-red-600 capitalize">
                            {log.old_values.priority}
                          </span>
                          <span className="mx-2">→</span>
                          <span className="font-medium text-green-600 capitalize">
                            {log.new_values.priority}
                          </span>
                        </div>
                      )}

                      {/* Mostrar atribuição */}
                      {log.action === 'assigned' && log.metadata?.assigned_to_user_id && (
                        <div className="text-sm mb-2 p-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground font-medium">Atribuído para: </span>
                          <span className="font-medium">
                            {log.metadata.assigned_to_user_name || `Usuário #${log.metadata.assigned_to_user_id}`}
                          </span>
                        </div>
                      )}

                      {/* Mostrar mudanças gerais (old_values → new_values) */}
                      {log.action === 'updated' && log.old_values && log.new_values && 
                       log.action !== 'status_changed' && !(log.old_values.priority && log.new_values.priority) && (
                        <div className="text-sm mb-2 p-2 bg-muted/50 rounded space-y-1">
                          <div className="font-medium text-muted-foreground mb-1">Mudanças:</div>
                          {Object.keys(log.new_values).map((key) => {
                            const oldVal = log.old_values[key]
                            const newVal = log.new_values[key]
                            if (oldVal !== newVal && key !== 'updated_at' && key !== 'created_at') {
                              return (
                                <div key={key} className="text-xs">
                                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}: </span>
                                  <span className="line-through text-red-600">{String(oldVal || '-')}</span>
                                  <span className="mx-1">→</span>
                                  <span className="text-green-600">{String(newVal || '-')}</span>
                                </div>
                              )
                            }
                            return null
                          })}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.last_page > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

