"use client"

/**
 * Gráfico de Desempenho por Agente usando Recharts
 * 
 * Mostra múltiplas métricas em abas diferentes
 */

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, CheckCircle2, TrendingUp } from "lucide-react"
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"

export function AgentPerformanceChart({ data = [] }) {
  const containerRef = useRef(null)
  const [activeTab, setActiveTab] = useState("tickets")

  // Sempre garantir que data é um array válido
  const chartData = Array.isArray(data) ? data : []
  
  // Log para verificar quantos agentes estão sendo recebidos
  useEffect(() => {
    console.log(`📊 [AgentPerformanceChart] Recebidos ${chartData.length} agentes:`, chartData.map(a => a.user_name))
  }, [chartData])

  // Se não tem dados, mostrar mensagem
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Desempenho por Agente
          </CardTitle>
          <CardDescription>Produtividade e métricas dos atendentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados para cada gráfico
  const ticketsData = chartData.map(agent => ({
    name: agent?.user_name || `Agente ${agent?.user_id || 'N/A'}`,
    tickets: agent?.tickets_assigned || agent?.tickets_received || 0
  }))

  const responseTimeData = chartData.map(agent => ({
    name: agent?.user_name || `Agente ${agent?.user_id || 'N/A'}`,
    horas: agent?.average_response_time_hours || 0
  }))

  const resolutionRateData = chartData.map(agent => ({
    name: agent?.user_name || `Agente ${agent?.user_id || 'N/A'}`,
    taxa: agent?.resolution_rate || 0
  }))

  const resolutionTimeData = chartData.map(agent => ({
    name: agent?.user_name || `Agente ${agent?.user_id || 'N/A'}`,
    horas: agent?.average_resolution_time_hours || 0
  }))

  // Componente de gráfico reutilizável
  const ChartWrapper = ({ data, dataKey, title, description, color, formatter }) => {
    const wrapperRef = useRef(null)

    if (!data || data.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Nenhum dado disponível
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6" style={{ minHeight: '450px' }}>
          <div 
            ref={wrapperRef}
            style={{ width: '100%', height: '400px', minHeight: '400px' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart 
                data={data} 
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '4px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={formatter}
                />
                <Bar 
                  dataKey={dataKey} 
                  fill={color}
                  radius={[8, 8, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full" ref={containerRef}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Desempenho por Agente
        </CardTitle>
        <CardDescription>
          Produtividade e métricas dos atendentes ({chartData.length} {chartData.length === 1 ? 'agente' : 'agentes'})
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 min-h-[500px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="response" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Resposta
            </TabsTrigger>
            <TabsTrigger value="resolution-rate" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Taxa
            </TabsTrigger>
            <TabsTrigger value="resolution-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Res.
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-4" style={{ minHeight: '500px' }}>
            <ChartWrapper
              data={ticketsData}
              dataKey="tickets"
              title="Tickets Atendidos por Agente"
              description="Quantidade de tickets atribuídos a cada agente"
              color="#3b82f6"
            />
          </TabsContent>

          <TabsContent value="response" className="mt-4" style={{ minHeight: '500px' }}>
            <ChartWrapper
              data={responseTimeData}
              dataKey="horas"
              title="Tempo Médio de Resposta por Agente"
              description="Tempo médio até primeira resposta (em horas)"
              color="#22c55e"
              formatter={(value) => [`${value.toFixed(2)}h`, 'Tempo']}
            />
          </TabsContent>

          <TabsContent value="resolution-rate" className="mt-4" style={{ minHeight: '500px' }}>
            <ChartWrapper
              data={resolutionRateData}
              dataKey="taxa"
              title="Taxa de Resolução por Agente"
              description="Percentual de tickets resolvidos"
              color="#8b5cf6"
              formatter={(value) => [`${value.toFixed(2)}%`, 'Taxa']}
            />
          </TabsContent>

          <TabsContent value="resolution-time" className="mt-4" style={{ minHeight: '500px' }}>
            <ChartWrapper
              data={resolutionTimeData}
              dataKey="horas"
              title="Tempo Médio de Resolução por Agente"
              description="Tempo médio até resolução completa (em horas)"
              color="#f97316"
              formatter={(value) => [`${value.toFixed(2)}h`, 'Tempo']}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
