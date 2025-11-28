"use client"

/**
 * MODELO BASE - Gráfico de Pizza Simples
 * 
 * Use este componente como base para criar novos gráficos.
 * 
 * Estrutura:
 * - shadcn Card = container visual
 * - ResponsiveContainer = wrapper responsivo
 * - PieChart = gráfico do Recharts
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "#22c55e", // green-500
  "#eab308", // yellow-500
  "#ef4444", // red-500
  "#8b5cf6", // purple-500
  "#f97316", // orange-500
]

export function SimplePieChart({ 
  data = [], 
  title = "Gráfico de Pizza",
  dataKey = "value",
  nameKey = "name",
  colors = DEFAULT_COLORS,
  height = 300,
  showLegend = true
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
            <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

