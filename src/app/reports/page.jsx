"use client"

import { useEffect, useState } from "react"
import { TicketsHeader } from "@/components/tickets-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import { 
  getDashboardStats, 
  getTicketsStats, 
  getUsersStats, 
  getMessagesStats
} from "@/services/statistics"
import { toast } from "sonner"
import useAuth from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"
import { formatarTempoCurto } from "@/utils/timeHelpers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import ChartErrorBoundary from "@/components/charts/ChartErrorBoundary"
import { AgentPerformanceChart } from "@/components/charts/AgentPerformanceChart"
import { PriorityChart } from "@/components/charts/PriorityChart"

export default function ReportsPage() {
  useAuth()
  const { isAdmin, isHydrated } = usePermissions()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('dashboard')

  // Estados para cada tipo de estatística
  const [dashboardData, setDashboardData] = useState(null)
  const [ticketsData, setTicketsData] = useState(null)
  const [usersData, setUsersData] = useState(null)
  const [messagesData, setMessagesData] = useState(null)

  // Verifica se é admin (apenas após hidratação)
  useEffect(() => {
    if (isHydrated && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar relatórios.")
      window.location.href = '/'
    }
  }, [isAdmin, isHydrated])

  // Carrega dados do dashboard
  const loadDashboard = async () => {
    try {
      console.log("📊 [API] GET /admin/statistics/dashboard?period=" + period)
      const data = await getDashboardStats(period)
      console.log("✅ [API] Dashboard retornado:", data)
      setDashboardData(data)
    } catch (error) {
      console.error("❌ [API] Erro ao carregar dashboard:", error)
      toast.error("Erro ao carregar estatísticas do dashboard")
    }
  }

  // Carrega dados de tickets
  const loadTickets = async () => {
    try {
      console.log("📊 [API] GET /admin/statistics/tickets?period=" + period)
      const data = await getTicketsStats(period)
      console.log("✅ [API] Tickets retornado:", data)
      setTicketsData(data)
    } catch (error) {
      console.error("❌ [API] Erro ao carregar estatísticas de tickets:", error)
      toast.error("Erro ao carregar estatísticas de tickets")
    }
  }

  // Carrega dados de usuários
  const loadUsers = async () => {
    try {
      console.log("📊 [API] GET /admin/statistics/users?period=" + period)
      const data = await getUsersStats(period)
      console.log("✅ [API] Users retornado:", data)
      setUsersData(data)
    } catch (error) {
      console.error("❌ [API] Erro ao carregar estatísticas de usuários:", error)
      toast.error("Erro ao carregar estatísticas de usuários")
    }
  }

  // Carrega dados de mensagens
  const loadMessages = async () => {
    try {
      console.log("📊 [API] GET /admin/statistics/messages?period=" + period)
      const data = await getMessagesStats(period)
      console.log("✅ [API] Messages retornado:", data)
      setMessagesData(data)
    } catch (error) {
      console.error("❌ [API] Erro ao carregar estatísticas de mensagens:", error)
      toast.error("Erro ao carregar estatísticas de mensagens")
    }
  }


  // Carrega todos os dados iniciais
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([
        loadDashboard(),
        loadTickets(),
        loadUsers(),
        loadMessages()
      ])
      setLoading(false)
    }
    
    if (isAdmin) {
      loadAll()
    }
  }, [isAdmin])

  // Verifica se há parâmetro de tab na URL e faz scroll para seções
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && ['dashboard', 'tickets', 'users', 'messages'].includes(tab)) {
      setActiveTab(tab)
    }
    
    // Faz scroll para seção se houver hash na URL
    const hash = window.location.hash
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }, [])

  // Recarrega quando o período muda
  useEffect(() => {
    if (isAdmin && !loading) {
      loadDashboard()
      loadTickets()
      loadUsers()
      loadMessages()
    }
  }, [period])

  // Aguarda hidratação antes de verificar permissões
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background" suppressHydrationWarning>
        <TicketsHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingSpinner text="Verificando permissões..." />
        </main>
      </div>
    )
  }

  // Se não for admin após hidratação, não renderiza
  if (!isAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TicketsHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingSpinner text="Carregando relatórios..." />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <TicketsHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatórios e Estatísticas</h1>
            <p className="text-muted-foreground mt-1">
              Análise completa do sistema de chamados
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <Ticket className="mr-2 h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Mensagens
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-4">
            {dashboardData && (
              <>
                {/* Cards de Resumo */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.tickets?.total || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.tickets?.abertos || 0} abertos
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.users?.total || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.users?.admins || 0} admins
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.messages?.total || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.messages?.internal || 0} internas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.performance?.resolution_rate?.toFixed(1) || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.performance?.resolved_tickets || 0} resolvidos
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Status de Tickets */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status de Tickets</CardTitle>
                    <CardDescription>Distribuição por status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Abertos</p>
                          <p className="text-2xl font-bold">{dashboardData.tickets?.abertos || 0}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-yellow-600">Pendentes</p>
                          <p className="text-2xl font-bold">{dashboardData.tickets?.pendentes || 0}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-green-600">Resolvidos</p>
                          <p className="text-2xl font-bold">{dashboardData.tickets?.resolvidos || 0}</p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Finalizados</p>
                          <p className="text-2xl font-bold">{dashboardData.tickets?.finalizados || 0}</p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-gray-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Atividades Recentes */}
                {dashboardData.recent_activity && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tickets Recentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {dashboardData.recent_activity.recent_tickets?.slice(0, 5).map((ticket) => (
                            <div key={ticket.id} className="p-3 border rounded-lg">
                              <p className="font-medium">{ticket.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {ticket.user_name} • {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Mensagens Recentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {dashboardData.recent_activity.recent_messages?.slice(0, 5).map((message) => (
                            <div key={message.id} className="p-3 border rounded-lg">
                              <p className="font-medium">{message.ticket_title}</p>
                              <p className="text-sm text-muted-foreground">
                                {message.user_name} • {new Date(message.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Tickets */}
          <TabsContent value="tickets" className="space-y-6">
            {ticketsData && (
              <>
                {/* Resumo dos Gráficos Disponíveis */}
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                  <Card className="border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Desempenho por Agente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Tickets atendidos, tempo de resposta e taxa de resolução por agente
                      </p>
                      <a 
                        href="#agents" 
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                        onClick={(e) => {
                          e.preventDefault()
                          if (typeof window !== 'undefined') {
                            document.getElementById('agents')?.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      >
                        Ver gráfico <span>→</span>
                      </a>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        Prioridade dos Tickets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Distribuição de tickets por nível de prioridade (Baixa, Média, Alta)
                      </p>
                      <a 
                        href="#priority" 
                        className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline font-medium inline-flex items-center gap-1"
                        onClick={(e) => {
                          e.preventDefault()
                          if (typeof window !== 'undefined') {
                            document.getElementById('priority')?.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      >
                        Ver gráfico <span>→</span>
                      </a>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        Tempo de Resolução
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Métricas de tempo médio, mínimo e máximo de resolução
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div id="tickets" className="scroll-mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visão Geral de Tickets</CardTitle>
                      <CardDescription>Período: {ticketsData.period}</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{ticketsData.overview?.total || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Abertos</p>
                        <p className="text-2xl font-bold">{ticketsData.overview?.abertos || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Resolvidos</p>
                        <p className="text-2xl font-bold">{ticketsData.overview?.resolvidos || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Finalizados</p>
                        <p className="text-2xl font-bold">{ticketsData.overview?.finalizados || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {ticketsData.resolution_time && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Tempo de Resolução</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Média (horas)</p>
                            <p className="text-2xl font-bold">
                              {ticketsData.resolution_time.average_hours?.toFixed(1) || 0}
                            </p>
                            {ticketsData.resolution_time.average_minutes && (
                              <p className="text-xs text-muted-foreground">
                                ({ticketsData.resolution_time.average_minutes.toFixed(0)} min)
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Média (dias)</p>
                            <p className="text-2xl font-bold">
                              {ticketsData.resolution_time.average_days?.toFixed(2) || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Mínimo (horas)</p>
                            <p className="text-2xl font-bold">{ticketsData.resolution_time.min_hours || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Máximo (horas)</p>
                            <p className="text-2xl font-bold">{ticketsData.resolution_time.max_hours || 0}</p>
                          </div>
                        </div>
                        {ticketsData.resolution_time.using_manual_time && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <strong>{ticketsData.resolution_time.manual_time_count || 0}</strong> tickets com tempo manual
                              {' • '}
                              <strong>{ticketsData.resolution_time.calculated_time_count || 0}</strong> tickets com tempo calculado
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {ticketsData.resolution_time_by_cliente && ticketsData.resolution_time_by_cliente.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Tempo de Resolução por Cliente</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {ticketsData.resolution_time_by_cliente.map((item, index) => (
                              <div key={item.cliente_id || index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{item.cliente_name || 'Sem cliente'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.total_tickets} ticket(s)
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold">
                                    {formatarTempoCurto(item.average_minutes)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Média: {item.average_hours?.toFixed(2) || 0}h
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Gráfico de Desempenho por Agente */}
                    <div id="agents" className="scroll-mt-8 mb-8">
                      {ticketsData?.agent_productivity && 
                       Array.isArray(ticketsData.agent_productivity) && 
                       ticketsData.agent_productivity.length > 0 ? (
                        <ChartErrorBoundary>
                          <AgentPerformanceChart data={ticketsData.agent_productivity} />
                        </ChartErrorBoundary>
                      ) : (
                        <Card>
                          <CardHeader>
                            <CardTitle>Desempenho por Agente</CardTitle>
                            <CardDescription>Dados de produtividade dos atendentes</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-center h-64 text-muted-foreground">
                              Nenhum dado disponível
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Gráfico de Prioridade dos Tickets */}
                    <div id="priority" className="scroll-mt-8 mb-8">
                      {ticketsData?.by_priority && 
                       typeof ticketsData.by_priority === 'object' &&
                       ticketsData.by_priority !== null &&
                       Object.keys(ticketsData.by_priority).length > 0 ? (
                        <ChartErrorBoundary>
                          <PriorityChart data={ticketsData.by_priority} />
                        </ChartErrorBoundary>
                      ) : (
                        <Card>
                          <CardHeader>
                            <CardTitle>Prioridade dos Tickets</CardTitle>
                            <CardDescription>Distribuição de tickets por prioridade</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-center h-64 text-muted-foreground">
                              Nenhum dado disponível
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </>
                )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="space-y-4">
            {usersData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Visão Geral de Usuários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{usersData.overview?.total || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Admins</p>
                        <p className="text-2xl font-bold">{usersData.overview?.admins || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Support</p>
                        <p className="text-2xl font-bold">{usersData.overview?.support || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Clientes</p>
                        <p className="text-2xl font-bold">{usersData.overview?.cliente || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {usersData.top_performers && usersData.top_performers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performers</CardTitle>
                      <CardDescription>
                        Usuários com mais tickets resolvidos ({usersData.top_performers.length} usuários)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {usersData.top_performers.map((performer, index) => (
                          <div key={performer.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{performer.user_name}</p>
                                <p className="text-sm text-muted-foreground">{performer.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">{performer.resolved_tickets}</p>
                              <p className="text-xs text-muted-foreground">tickets resolvidos</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {usersData.average_resolution_time_by_cliente && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tempo Médio de Resolução por Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Média Geral</p>
                          <p className="text-2xl font-bold">
                            {formatarTempoCurto(usersData.average_resolution_time_by_cliente.overall_average_minutes)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {usersData.average_resolution_time_by_cliente.overall_average_hours?.toFixed(2) || 0} horas
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Resolvidos</p>
                          <p className="text-2xl font-bold">
                            {usersData.average_resolution_time_by_cliente.total_resolved || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Variação</p>
                          <p className="text-sm font-medium">
                            {formatarTempoCurto(usersData.average_resolution_time_by_cliente.min_minutes)} - {formatarTempoCurto(usersData.average_resolution_time_by_cliente.max_minutes)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Mensagens */}
          <TabsContent value="messages" className="space-y-4">
            {messagesData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Visão Geral de Mensagens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{messagesData.overview?.total || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Internas</p>
                        <p className="text-2xl font-bold">{messagesData.overview?.internal || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Externas</p>
                        <p className="text-2xl font-bold">{messagesData.overview?.external || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

