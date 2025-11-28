"use client"

/**
 * Gráficos para visualizar atividades do usuário
 * Usa dados da rota /api/statistics/my-activity
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { Activity, Calendar, MessageSquare, Paperclip, Ticket } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const COLORS = {
  ticket_created: '#3b82f6',
  ticket_updated: '#10b981',
  message_sent: '#8b5cf6',
  attachment_uploaded: '#f59e0b'
}

export function ActivityCharts({ data }) {
  if (!data || !data.timeline) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráficos de Atividades</CardTitle>
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
  const timelineData = data.timeline || []
  
  // Agrupar atividades por tipo
  const activitiesByType = timelineData.reduce((acc, activity) => {
    const type = activity.type || 'unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const typeChartData = Object.entries(activitiesByType).map(([type, count]) => ({
    name: type === 'ticket_created' ? 'Tickets Criados' :
          type === 'ticket_updated' ? 'Tickets Atualizados' :
          type === 'message_sent' ? 'Mensagens Enviadas' :
          type === 'attachment_uploaded' ? 'Anexos Enviados' : type,
    value: count,
    color: COLORS[type] || '#6b7280'
  }))

  // Agrupar atividades por dia
  const activitiesByDay = timelineData.reduce((acc, activity) => {
    const date = format(new Date(activity.created_at), 'dd/MM', { locale: ptBR })
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const dayChartData = Object.entries(activitiesByDay)
    .sort(([a], [b]) => {
      const [dayA, monthA] = a.split('/')
      const [dayB, monthB] = b.split('/')
      return new Date(2024, parseInt(monthA) - 1, parseInt(dayA)) - 
             new Date(2024, parseInt(monthB) - 1, parseInt(dayB))
    })
    .map(([date, count]) => ({
      date,
      atividades: count
    }))

  // Atividades por hora do dia
  const activitiesByHour = timelineData.reduce((acc, activity) => {
    const hour = format(new Date(activity.created_at), 'HH:00', { locale: ptBR })
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  const hourChartData = Object.entries(activitiesByHour)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, count]) => ({
      hour,
      atividades: count
    }))

  // Atividades por tipo ao longo do tempo
  const timelineByType = timelineData.reduce((acc, activity) => {
    const date = format(new Date(activity.created_at), 'dd/MM', { locale: ptBR })
    const type = activity.type || 'unknown'
    
    if (!acc[date]) {
      acc[date] = {
        date,
        ticket_created: 0,
        ticket_updated: 0,
        message_sent: 0,
        attachment_uploaded: 0
      }
    }
    
    if (acc[date][type] !== undefined) {
      acc[date][type]++
    }
    
    return acc
  }, {})

  const timelineByTypeData = Object.values(timelineByType)
    .sort((a, b) => {
      const [dayA, monthA] = a.date.split('/')
      const [dayB, monthB] = b.date.split('/')
      return new Date(2024, parseInt(monthA) - 1, parseInt(dayA)) - 
             new Date(2024, parseInt(monthB) - 1, parseInt(dayB))
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Gráficos de Atividades
        </CardTitle>
        <CardDescription>
          Visualização das suas atividades no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 min-h-[500px]">
        <Tabs defaultValue="by-type" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="by-type">Por Tipo</TabsTrigger>
            <TabsTrigger value="by-day">Por Dia</TabsTrigger>
            <TabsTrigger value="by-hour">Por Hora</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Gráfico de Pizza - Atividades por Tipo */}
          <TabsContent value="by-type" className="min-h-[400px]">
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Gráfico de Barras - Atividades por Dia */}
          <TabsContent value="by-day" className="min-h-[400px]">
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={dayChartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="atividades" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Gráfico de Linha - Atividades por Hora */}
          <TabsContent value="by-hour" className="min-h-[400px]">
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={hourChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="atividades" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Gráfico de Linhas Múltiplas - Timeline por Tipo */}
          <TabsContent value="timeline" className="min-h-[400px]">
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={timelineByTypeData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ticket_created" 
                    stroke={COLORS.ticket_created} 
                    strokeWidth={2}
                    name="Tickets Criados"
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ticket_updated" 
                    stroke={COLORS.ticket_updated} 
                    strokeWidth={2}
                    name="Tickets Atualizados"
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="message_sent" 
                    stroke={COLORS.message_sent} 
                    strokeWidth={2}
                    name="Mensagens Enviadas"
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attachment_uploaded" 
                    stroke={COLORS.attachment_uploaded} 
                    strokeWidth={2}
                    name="Anexos Enviados"
                    dot={{ r: 3 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

