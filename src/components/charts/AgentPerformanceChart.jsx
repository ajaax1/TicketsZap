"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, CheckCircle2, TrendingUp } from "lucide-react"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function AgentPerformanceChart({ data = [] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log("📈 AgentPerformanceChart - Dados recebidos:", {
      data,
      isArray: Array.isArray(data),
      length: data?.length || 0,
      firstItem: data?.[0]
    })
  }, [data])

  if (!mounted) {
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
            Carregando gráficos...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log("⚠️ AgentPerformanceChart - Sem dados válidos:", {
      data,
      isArray: Array.isArray(data),
      length: data?.length
    })
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Desempenho por Agente
          </CardTitle>
          <CardDescription>Produtividade dos atendentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <p>Nenhum dado disponível</p>
              <p className="text-xs mt-2">
                Tipo: {typeof data}, É array: {Array.isArray(data) ? 'Sim' : 'Não'}, 
                Tamanho: {data?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados para cada gráfico
  const ticketsData = data.map(agent => ({
    name: agent?.user_name || `Agente ${agent?.user_id || 'N/A'}`,
    tickets: agent?.tickets_assigned || agent?.tickets_received || 0
  }))

  const responseTimeData = data.map(agent => ({
    name: agent?.user_name || `Agente ${agent?.user_id || 'N/A'}`,
    horas: agent?.average_response_time_hours || 0
  }))

  const resolutionRateData = data.map(agent => ({
    name: agent?.user_name || `Agente ${agent?.user_id || 'N/A'}`,
    taxa: agent?.resolution_rate || 0
  }))

  const resolutionTimeData = data.map(agent => ({
    name: agent?.user_name || `Agente ${agent?.user_id || 'N/A'}`,
    horas: agent?.average_resolution_time_hours || 0
  }))

  console.log("📊 AgentPerformanceChart - Dados processados:", {
    ticketsData,
    responseTimeData,
    resolutionRateData,
    resolutionTimeData
  })
  
  console.log("🔍 AgentPerformanceChart - Estado:", {
    mounted,
    dataLength: data?.length,
    ticketsDataLength: ticketsData?.length,
    hasTicketsData: !!ticketsData && ticketsData.length > 0
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Desempenho por Agente
        </CardTitle>
        <CardDescription>Produtividade e métricas dos atendentes</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="tickets" className="w-full">
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

          <TabsContent value="tickets" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tickets Atendidos por Agente</CardTitle>
                <CardDescription>Quantidade de tickets atribuídos a cada agente</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="w-full" style={{ height: '400px' }}>
                  {ticketsData && ticketsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart 
                        data={ticketsData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          stroke="hsl(var(--border))"
                        />
                        <YAxis 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          stroke="hsl(var(--border))"
                        />
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
                        />
                        <Bar 
                          dataKey="tickets" 
                          fill="hsl(var(--primary))"
                          radius={[8, 8, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="response" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Resposta por Agente</CardTitle>
                <CardDescription>Tempo médio até primeira resposta (em horas)</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="w-full" style={{ height: '400px' }}>
                  {responseTimeData && responseTimeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={responseTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          stroke="hsl(var(--border))"
                        />
                        <YAxis 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          stroke="hsl(var(--border))"
                        />
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
                          formatter={(value) => [`${value.toFixed(2)}h`, 'Tempo']}
                        />
                        <Bar 
                          dataKey="horas" 
                          fill="hsl(142, 71%, 45%)"
                          radius={[8, 8, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolution-rate" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Resolução por Agente</CardTitle>
                <CardDescription>Percentual de tickets resolvidos</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="w-full" style={{ height: '400px' }}>
                  {resolutionRateData && resolutionRateData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={resolutionRateData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          stroke="hsl(var(--border))"
                        />
                        <YAxis 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          stroke="hsl(var(--border))"
                        />
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
                          formatter={(value) => [`${value.toFixed(2)}%`, 'Taxa']}
                        />
                        <Bar 
                          dataKey="taxa" 
                          fill="hsl(262, 83%, 58%)"
                          radius={[8, 8, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolution-time" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Resolução por Agente</CardTitle>
                <CardDescription>Tempo médio até resolução completa (em horas)</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="w-full" style={{ height: '400px' }}>
                  {resolutionTimeData && resolutionTimeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={resolutionTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          stroke="hsl(var(--border))"
                        />
                        <YAxis 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          stroke="hsl(var(--border))"
                        />
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
                          formatter={(value) => [`${value.toFixed(2)}h`, 'Tempo']}
                        />
                        <Bar 
                          dataKey="horas" 
                          fill="hsl(24, 95%, 53%)"
                          radius={[8, 8, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
