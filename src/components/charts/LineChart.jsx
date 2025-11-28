"use client"

/**
 * Gráfico de Linhas usando Recharts
 * 
 * Estrutura:
 * - shadcn Card = container visual
 * - ResponsiveContainer = wrapper responsivo do Recharts
 * - LineChart = gráfico do Recharts
 */

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

export function LineChart({ 
  data = [], 
  title = "Gráfico de Linhas",
  description,
  dataKey = "value",
  labelKey = "label",
  color = "hsl(var(--primary))",
  height = 300,
  showLegend = false,
  strokeWidth = 3,
  dot = true
}) {
  // Sempre garantir que data é um array válido
  const chartData = Array.isArray(data) ? data : []

  // Se não tem dados, mostrar mensagem
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transformar dados para o formato esperado pelo gráfico
  const formattedData = chartData.map((item, index) => ({
    name: item[labelKey] || item.name || `Item ${index + 1}`,
    value: item[dataKey] || item.value || 0
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '8px 12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={strokeWidth}
              dot={dot ? { r: 4 } : false}
              activeDot={{ r: 6 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
