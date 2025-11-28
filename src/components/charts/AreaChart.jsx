"use client"

/**
 * Gráfico de Área usando Recharts
 * 
 * Estrutura:
 * - shadcn Card = container visual
 * - ResponsiveContainer = wrapper responsivo do Recharts
 * - AreaChart = gráfico do Recharts
 */

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

export function AreaChart({ 
  data = [], 
  title = "Gráfico de Área",
  description,
  dataKey = "value",
  labelKey = "label",
  color = "hsl(var(--primary))",
  height = 300,
  showLegend = false,
  strokeWidth = 2,
  fillOpacity = 0.6
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

  // Gerar ID único para o gradiente (evita conflitos quando há múltiplos gráficos)
  const gradientId = `area-gradient-${dataKey}-${Math.random().toString(36).substr(2, 9)}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={strokeWidth}
              fillOpacity={fillOpacity}
              fill={`url(#${gradientId})`}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
