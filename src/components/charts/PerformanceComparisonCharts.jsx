"use client"

/**
 * Gráficos para comparação de performance
 * Usa dados da rota /api/admin/statistics/compare-performance
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const getStatusColor = (status) => {
  switch (status) {
    case 'better':
      return '#10b981' // green
    case 'worse':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'better':
      return <TrendingUp className="h-4 w-4" />
    case 'worse':
      return <TrendingDown className="h-4 w-4" />
    default:
      return <Minus className="h-4 w-4" />
  }
}

export function PerformanceComparisonCharts({ comparison }) {
  if (!comparison || !comparison.comparison) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráficos de Comparação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados para gráfico de barras comparativo
  const comparisonData = Object.entries(comparison.comparison).map(([key, metric]) => {
    const labelMap = {
      tickets_assigned: 'Tickets Atribuídos',
      tickets_closed: 'Tickets Fechados',
      resolution_rate: 'Taxa de Resolução (%)',
      response_rate: 'Taxa de Resposta (%)',
      average_response_time: 'Tempo Médio Resposta (h)',
      average_resolution_time: 'Tempo Médio Resolução (h)',
      first_response_time: 'Tempo Primeira Resposta (h)'
    }

    return {
      metric: labelMap[key] || key,
      meuValor: metric.my_value || 0,
      mediaOutros: metric.average_value || 0,
      diferenca: metric.difference_percent || 0,
      status: metric.status || 'similar',
      color: getStatusColor(metric.status)
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Gráficos de Comparação
        </CardTitle>
        <CardDescription>
          Comparação visual da sua performance com a média dos outros usuários
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 min-h-[500px]">
        {/* Gráfico de Barras Comparativo */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Comparação: Meu Valor vs Média dos Outros</h3>
          <div style={{ width: '100%', height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart 
                data={comparisonData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="metric" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'meuValor') return [`${value}`, 'Meu Valor']
                    if (name === 'mediaOutros') return [`${value}`, 'Média dos Outros']
                    return value
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="meuValor" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]} 
                  name="Meu Valor"
                />
                <Bar 
                  dataKey="mediaOutros" 
                  fill="#6b7280" 
                  radius={[8, 8, 0, 0]} 
                  name="Média dos Outros"
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cards de Métricas Individuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {comparisonData.map((item, index) => (
            <Card key={index} className="hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{item.metric}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${
                      item.status === 'better' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      item.status === 'worse' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status === 'better' ? 'Melhor' : item.status === 'worse' ? 'Pior' : 'Similar'}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Meu valor:</span>
                    <span className="font-semibold text-blue-600">{item.meuValor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Média:</span>
                    <span className="font-semibold text-gray-600">{item.mediaOutros}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Diferença:</span>
                    <span 
                      className={`font-semibold ${
                        item.status === 'better' ? 'text-green-600' :
                        item.status === 'worse' ? 'text-red-600' :
                        'text-gray-600'
                      }`}
                    >
                      {item.diferenca > 0 ? '+' : ''}{item.diferenca.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

