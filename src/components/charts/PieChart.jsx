"use client"

/**
 * Gráfico de Pizza usando Recharts
 * 
 * Estrutura:
 * - shadcn Card = container visual
 * - ResponsiveContainer = wrapper responsivo do Recharts
 * - PieChart = gráfico do Recharts
 */

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

const COLORS = [
  "hsl(var(--primary))",
  "#22c55e", // green-500
  "#eab308", // yellow-500
  "#ef4444", // red-500
  "#8b5cf6", // purple-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
  "#ec4899", // pink-500
]

export function PieChart({ 
  data = [], 
  title = "Gráfico de Pizza",
  description,
  valueKey = "value",
  labelKey = "label",
  showLegend = true,
  showPercentages = true
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
    value: item[valueKey] || item.value || 0
  })).filter(item => item.value > 0)

  // Se todos os valores são zero, mostrar mensagem
  const total = formattedData.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent style={{ minHeight: '450px' }}>
        <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showPercentages ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="hsl(var(--background))" 
                  strokeWidth={2} 
                />
              ))}
            </Pie>
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
              formatter={(value, name) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                name
              ]}
            />
            {showLegend && (
              <Legend 
                verticalAlign="bottom" 
                height={50}
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  const item = formattedData.find(d => d.name === value)
                  const percentage = item ? ((item.value / total) * 100).toFixed(1) : 0
                  return (
                    <span style={{ color: 'hsl(var(--foreground))', fontSize: '14px' }}>
                      {value} <span style={{ color: 'hsl(var(--muted-foreground))' }}>({percentage}%)</span>
                    </span>
                  )
                }}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
