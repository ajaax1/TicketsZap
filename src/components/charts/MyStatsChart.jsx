"use client"

/**
 * Gráfico de Estatísticas Pessoais
 * 
 * Mostra múltiplas métricas em abas diferentes
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart, LineChart } from "@/components/charts"
import { 
  Ticket, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  AlertCircle
} from "lucide-react"

export function MyStatsChart({ data }) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados para gráficos
  const priorityData = data.by_priority ? Object.entries(data.by_priority).map(([key, value]) => ({
    label: key === 'alta' ? 'Alta' : key === 'média' ? 'Média' : 'Baixa',
    value: typeof value === 'number' ? value : value.total || 0
  })) : []

  const statusData = data.by_status ? Object.entries(data.by_status).map(([key, value]) => ({
    label: key === 'aberto' ? 'Aberto' : 
           key === 'pendente' ? 'Pendente' :
           key === 'resolvido' ? 'Resolvido' : 'Finalizado',
    value: value
  })) : []

  const byDayData = data.by_day ? data.by_day.map(day => ({
    label: new Date(day.date).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    }),
    value: day.total
  })) : []

  const ticketsByOriginData = data.tickets_by_origin?.by_origin 
    ? Object.entries(data.tickets_by_origin.by_origin)
        .filter(([key]) => key !== 'null')
        .map(([key, value]) => ({
          label: key === 'formulario_web' ? 'Formulário Web' :
                 key === 'email' ? 'E-mail' :
                 key === 'api' ? 'API' :
                 key === 'tel_manual' ? 'Telefone Manual' : key,
          value: value.total || 0,
          percentage: value.percentage || 0
        }))
    : []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Minhas Estatísticas
        </CardTitle>
        <CardDescription>
          Período: {data.period || 'N/A'} | Total de tickets: {data.overview?.total || 0}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 min-h-[500px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="priority" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Prioridade
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Status
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="mt-4 space-y-4" style={{ minHeight: '500px' }}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.overview?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {data.overview?.resolvidos || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.productivity?.resolution_rate?.toFixed(1) || 0}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio Resposta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.response_time?.first_response?.average_hours?.toFixed(2) || 0}h
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Tickets por Origem */}
            {ticketsByOriginData.length > 0 && (
              <PieChart
                data={ticketsByOriginData}
                title="Tickets por Origem"
                description="Distribuição de tickets por origem"
                valueKey="value"
                labelKey="label"
                showLegend={true}
                showPercentages={true}
              />
            )}
          </TabsContent>

          {/* Prioridade */}
          <TabsContent value="priority" className="mt-4" style={{ minHeight: '500px' }}>
            {priorityData.length > 0 ? (
              <PieChart
                data={priorityData}
                title="Distribuição por Prioridade"
                description="Meus tickets por nível de prioridade"
                valueKey="value"
                labelKey="label"
                showLegend={true}
                showPercentages={true}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Nenhum dado de prioridade disponível
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Status */}
          <TabsContent value="status" className="mt-4" style={{ minHeight: '500px' }}>
            {statusData.length > 0 ? (
              <BarChart
                data={statusData}
                title="Distribuição por Status"
                description="Meus tickets por status"
                dataKey="value"
                labelKey="label"
                color="#8b5cf6"
                height={300}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Nenhum dado de status disponível
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline" className="mt-4" style={{ minHeight: '500px' }}>
            {byDayData.length > 0 ? (
              <LineChart
                data={byDayData}
                title="Tickets por Dia"
                description="Evolução diária dos meus tickets"
                dataKey="value"
                labelKey="label"
                color="#22c55e"
                height={300}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Nenhum dado de timeline disponível
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

