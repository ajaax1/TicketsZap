"use client"

/**
 * Gráficos aprimorados para estatísticas pessoais
 * Usa dados da rota /api/statistics/my-stats
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
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
import { 
  TrendingUp, 
  Clock, 
  Target,
  BarChart3,
  Activity
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const COLORS = {
  alta: '#ef4444',
  média: '#f59e0b',
  baixa: '#10b981',
  aberto: '#fbbf24',
  pendente: '#f97316',
  resolvido: '#10b981',
  finalizado: '#3b82f6'
}

export function MyStatsEnhancedCharts({ data }) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráficos de Estatísticas</CardTitle>
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
  const priorityData = data.by_priority 
    ? Object.entries(data.by_priority).map(([key, value]) => ({
        name: key === 'alta' ? 'Alta' : key === 'média' ? 'Média' : 'Baixa',
        value: typeof value === 'number' ? value : value.total || 0,
        color: COLORS[key] || '#6b7280'
      }))
    : []

  const statusData = data.by_status 
    ? Object.entries(data.by_status).map(([key, value]) => ({
        name: key === 'aberto' ? 'Aberto' : 
              key === 'pendente' ? 'Pendente' :
              key === 'resolvido' ? 'Resolvido' : 'Finalizado',
        value: value,
        color: COLORS[key] || '#6b7280'
      }))
    : []

  const byDayData = data.by_day 
    ? data.by_day.map(day => ({
        date: format(new Date(day.date), 'dd/MM', { locale: ptBR }),
        total: day.total
      }))
    : []

  const ticketsByOriginData = data.tickets_by_origin?.by_origin 
    ? Object.entries(data.tickets_by_origin.by_origin)
        .filter(([key]) => key !== 'null')
        .map(([key, value]) => ({
          name: key === 'formulario_web' ? 'Formulário Web' :
                key === 'email' ? 'E-mail' :
                key === 'api' ? 'API' :
                key === 'tel_manual' ? 'Telefone Manual' : key,
          value: value.total || 0,
          percentage: value.percentage || 0
        }))
    : []

  // Dados para gráfico de criados vs fechados
  const createdVsClosedData = data.tickets_closed_by_period 
    ? data.tickets_closed_by_period.map(item => ({
        period: format(new Date(item.period), 'dd/MM', { locale: ptBR }),
        criados: item.created || 0,
        fechados: item.closed || 0,
        abertos: item.open || 0
      }))
    : []

  // Dados de produtividade
  const productivityData = data.productivity ? [
    {
      name: 'Atribuídos',
      value: data.productivity.tickets_assigned || 0
    },
    {
      name: 'Fechados',
      value: data.productivity.tickets_closed || 0
    },
    {
      name: 'Respondidos',
      value: data.productivity.tickets_responded || 0
    },
    {
      name: 'Não Resolvidos',
      value: data.productivity.tickets_not_resolved || 0
    }
  ] : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Gráficos Detalhados
        </CardTitle>
        <CardDescription>
          Visualizações avançadas das suas estatísticas
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 min-h-[500px]">
        <Tabs defaultValue="productivity" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="productivity">Produtividade</TabsTrigger>
            <TabsTrigger value="priority">Prioridade</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="comparison">Criados vs Fechados</TabsTrigger>
          </TabsList>

          {/* Gráfico de Barras - Produtividade */}
          <TabsContent value="productivity" className="min-h-[400px]">
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={productivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
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
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Gráfico de Pizza - Prioridade */}
          <TabsContent value="priority" className="min-h-[400px]">
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Gráfico de Barras - Status */}
          <TabsContent value="status" className="min-h-[400px]">
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={statusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
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
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Gráfico de Área - Timeline */}
          <TabsContent value="timeline" className="min-h-[400px]">
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={byDayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
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
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </RechartsAreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Gráfico de Barras Agrupadas - Criados vs Fechados */}
          <TabsContent value="comparison" className="min-h-[400px]">
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={createdVsClosedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="period" 
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
                  <Bar dataKey="criados" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Criados" />
                  <Bar dataKey="fechados" fill="#10b981" radius={[8, 8, 0, 0]} name="Fechados" />
                  <Bar dataKey="abertos" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Abertos" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

