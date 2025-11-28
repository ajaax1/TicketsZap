"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getMyActivity } from "@/services/statistics"
import { 
  Ticket, 
  MessageSquare, 
  Paperclip, 
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ActivityCharts } from "@/components/charts"

export function MyActivity({ period: initialPeriod = 'month', data: externalData = null }) {
  const [data, setData] = useState(externalData)
  const [loading, setLoading] = useState(!externalData)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState(initialPeriod)
  const [activeTab, setActiveTab] = useState("timeline")

  // Atualiza dados quando dados externos mudam
  useEffect(() => {
    if (externalData) {
      setData(externalData)
      setLoading(false)
    }
  }, [externalData])

  // Carrega dados apenas se não foram fornecidos externamente
  useEffect(() => {
    if (externalData) {
      // Dados já foram fornecidos, não precisa carregar
      return
    }

    const loadActivity = async () => {
      try {
        setLoading(true)
        setError(null)
        const activityData = await getMyActivity(period, 100)
        setData(activityData)
      } catch (err) {
        console.error("Erro ao carregar atividades:", err)
        setError("Erro ao carregar histórico de atividades")
      } finally {
        setLoading(false)
      }
    }
    loadActivity()
  }, [period, externalData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Carregando atividades..." />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">
            {error || "Nenhum dado disponível"}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'ticket_created':
        return <Ticket className="h-4 w-4" />
      case 'ticket_updated':
        return <FileText className="h-4 w-4" />
      case 'message_sent':
        return <MessageSquare className="h-4 w-4" />
      case 'attachment_uploaded':
        return <Paperclip className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'ticket_created':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'ticket_updated':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'message_sent':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'attachment_uploaded':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      aberto: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      pendente: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      resolvido: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      finalizado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    }
    return (
      <Badge variant="outline" className={statusColors[status] || ''}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      alta: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      média: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      baixa: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    }
    return (
      <Badge variant="outline" className={priorityColors[priority] || ''}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Minhas Atividades</CardTitle>
            <CardDescription>
              Histórico completo das suas ações no sistema
            </CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Resumo */}
        {data.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tickets Criados</p>
                    <p className="text-2xl font-bold">{data.summary.tickets_created || 0}</p>
                  </div>
                  <Ticket className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tickets Atualizados</p>
                    <p className="text-2xl font-bold">{data.summary.tickets_updated || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mensagens Enviadas</p>
                    <p className="text-2xl font-bold">{data.summary.messages_sent || 0}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Anexos Enviados</p>
                    <p className="text-2xl font-bold">{data.summary.attachments_uploaded || 0}</p>
                  </div>
                  <Paperclip className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        <div className="mb-6">
          <ActivityCharts data={data} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
          </TabsList>

          {/* Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            {data.timeline && data.timeline.length > 0 ? (
              <div className="space-y-4">
                {data.timeline.map((activity, index) => (
                  <Card key={index} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{activity.description || activity.title}</p>
                              {activity.ticket_title && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Ticket: {activity.ticket_title}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {activity.status && getStatusBadge(activity.status)}
                              {activity.priority && getPriorityBadge(activity.priority)}
                              {activity.is_internal !== undefined && (
                                <Badge variant="outline">
                                  {activity.is_internal ? 'Interna' : 'Externa'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {activity.message_preview && (
                            <p className="text-sm text-muted-foreground italic">
                              "{activity.message_preview}"
                            </p>
                          )}
                          {activity.file_name && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Paperclip className="h-4 w-4" />
                              <span>{activity.file_name}</span>
                              {activity.file_size && (
                                <span className="text-xs">
                                  ({(activity.file_size / 1024).toFixed(2)} KB)
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma atividade encontrada neste período
              </div>
            )}
          </TabsContent>

          {/* Tickets */}
          <TabsContent value="tickets" className="space-y-4">
            <div className="space-y-4">
              {data.tickets_created && data.tickets_created.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tickets Criados</h3>
                  {data.tickets_created.map((ticket) => (
                    <Card key={ticket.id} className="mb-3">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{ticket.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(ticket.created_at)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {data.tickets_updated && data.tickets_updated.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tickets Atualizados</h3>
                  {data.tickets_updated.map((ticket) => (
                    <Card key={ticket.id} className="mb-3">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{ticket.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Última atualização: {formatDate(ticket.updated_at)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {(!data.tickets_created || data.tickets_created.length === 0) &&
               (!data.tickets_updated || data.tickets_updated.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum ticket encontrado neste período
                </div>
              )}
            </div>
          </TabsContent>

          {/* Mensagens */}
          <TabsContent value="messages" className="space-y-4">
            {data.messages_sent && data.messages_sent.length > 0 ? (
              <div className="space-y-4">
                {data.messages_sent.map((message) => (
                  <Card key={message.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{message.ticket_title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(message.created_at)}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {message.is_internal ? 'Interna' : 'Externa'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {message.message}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma mensagem encontrada neste período
              </div>
            )}
          </TabsContent>

          {/* Anexos */}
          <TabsContent value="attachments" className="space-y-4">
            {data.attachments_uploaded && data.attachments_uploaded.length > 0 ? (
              <div className="space-y-4">
                {data.attachments_uploaded.map((attachment) => (
                  <Card key={attachment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Paperclip className="h-5 w-5 text-muted-foreground mt-1" />
                          <div>
                            <p className="font-medium">{attachment.file_name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {attachment.ticket_title}
                            </p>
                            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{attachment.file_type}</span>
                              <span>•</span>
                              <span>{(attachment.file_size / 1024).toFixed(2)} KB</span>
                              <span>•</span>
                              <span>{formatDate(attachment.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum anexo encontrado neste período
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

