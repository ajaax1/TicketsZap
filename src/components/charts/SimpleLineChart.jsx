"use client"

/**
 * MODELO BASE - Gráfico de Linhas Simples
 * 
 * Use este componente como base para criar novos gráficos.
 * 
 * Estrutura:
 * - shadcn Card = container visual
 * - ResponsiveContainer = wrapper responsivo
 * - LineChart = gráfico do Recharts
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export function SimpleLineChart({ 
  data = [], 
  title = "Gráfico de Linhas",
  dataKey = "value",
  nameKey = "name",
  color = "hsl(var(--primary))",
  height = 300,
  strokeWidth = 3
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={strokeWidth}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

