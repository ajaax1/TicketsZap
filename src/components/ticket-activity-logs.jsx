"use client"

/**
 * Componente para exibir timeline de atividades de um ticket
 */

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { getTicketActivityLogs } from "@/services/activityLogs"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  RefreshCw,
  MessageSquare,
  Paperclip,
  Calendar
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

export function TicketActivityLogs({ ticketId, limit = 30 }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true)
        setError(null)
        const response = await getTicketActivityLogs(ticketId, {
          per_page: limit
        })
        setLogs(response.data || [])
      } catch (err) {
        console.error('Erro ao carregar logs de atividades:', err)
        setError('Não foi possível carregar o histórico de atividades')
        // Não mostra erro se for 404 (rota não implementada ainda)
        if (err?.response?.status !== 404) {
          setError('Não foi possível carregar o histórico de atividades')
        }
      } finally {
        setLoading(false)
      }
    }

    if (ticketId) {
      loadLogs()
    }
  }, [ticketId, limit])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Carregando histórico de atividades..." size="small" />
        </CardContent>
      </Card>
    )
  }

  if (error || !logs || logs.length === 0) {
    // Se for 404 ou não houver logs, não mostra erro, apenas mensagem discreta
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            {error ? (
              <p>Não foi possível carregar o histórico de atividades.</p>
            ) : (
              <p>Nenhuma atividade registrada ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline de Atividades
        </CardTitle>
        <CardDescription>
          Histórico completo de ações realizadas neste ticket
        </CardDescription>
      </CardHeader>
      <CardContent>
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

                  {/* Mostrar mudanças detalhadas */}
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
      </CardContent>
    </Card>
  )
}

