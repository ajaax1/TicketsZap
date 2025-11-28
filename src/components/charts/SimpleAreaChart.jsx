"use client"

/**
 * MODELO BASE - Gráfico de Área Simples
 * 
 * Use este componente como base para criar novos gráficos.
 * 
 * Estrutura:
 * - shadcn Card = container visual
 * - ResponsiveContainer = wrapper responsivo
 * - AreaChart = gráfico do Recharts
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export function SimpleAreaChart({ 
  data = [], 
  title = "Gráfico de Área",
  dataKey = "value",
  nameKey = "name",
  color = "hsl(var(--primary))",
  height = 300,
  fillOpacity = 0.6
}) {
  // Sempre garantir que data é um array
  const chartData = Array.isArray(data) ? data : []

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  // Gerar ID único para o gradiente
  const gradientId = `color-${dataKey}-${Math.random().toString(36).substr(2, 9)}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey={nameKey} 
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
              dataKey={dataKey} 
              stroke={color} 
              fill={`url(#${gradientId})`}
              fillOpacity={fillOpacity}
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

