"use client"

/**
 * Gráfico de Prioridade dos Tickets usando Recharts
 * 
 * Mostra distribuição de tickets por prioridade em dois formatos: pizza e barras
 */

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"
import { PieChart } from "./PieChart"
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts"

const PRIORITY_LABELS = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica"
}

const PRIORITY_COLORS = {
  baixa: "#22c55e", // green-500
  media: "#eab308", // yellow-500
  alta: "#ef4444", // red-500
  critica: "#a855f7" // purple-500
}

export function PriorityChart({ data = {} }) {
  const containerRef = useRef(null)
  const [activeTab, setActiveTab] = useState("pie")

  // Validar dados
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Prioridade dos Tickets
          </CardTitle>
          <CardDescription>Distribuição de tickets por nível de prioridade</CardDescription>
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
  // O backend pode retornar dois formatos:
  // 1. { baixa: { total: 44, percentage: 35.46 }, ... }
  // 2. { baixa: 44, alta: 41, media: 46 }
  const chartData = Object.entries(data).map(([key, value]) => {
    // Se value é um número direto, usar ele como total
    const total = typeof value === 'number' ? value : (value?.total || 0)
    // Se value é um objeto, calcular percentage se não existir
    const percentage = typeof value === 'number' 
      ? 0 // Será calculado depois se necessário
      : (value?.percentage || 0)
    
    return {
      label: PRIORITY_LABELS[key] || key,
      value: total,
      percentage: percentage,
      color: PRIORITY_COLORS[key] || "#6b7280"
    }
  }).filter(item => item.value > 0)

  // Calcular percentuais se não foram fornecidos
  const totalSum = chartData.reduce((sum, item) => sum + item.value, 0)
  const chartDataWithPercentages = chartData.map(item => ({
    ...item,
    percentage: item.percentage || (totalSum > 0 ? (item.value / totalSum) * 100 : 0)
  }))

  const barChartData = chartDataWithPercentages.map(item => ({
    name: item.label,
    total: item.value,
    color: item.color
  }))


  const barChartRef = useRef(null)

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Prioridade dos Tickets
        </CardTitle>
        <CardDescription>Distribuição de tickets por nível de prioridade</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 min-h-[500px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">Gráfico de Pizza</TabsTrigger>
            <TabsTrigger value="bar">Gráfico de Barras</TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="mt-4" style={{ minHeight: '500px' }}>
            <PieChart
              data={chartDataWithPercentages}
              title="Distribuição por Prioridade"
              description="Percentual de tickets por nível de prioridade"
              valueKey="value"
              labelKey="label"
              showLegend={true}
              showPercentages={true}
            />
          </TabsContent>

          <TabsContent value="bar" className="mt-4" style={{ minHeight: '500px' }}>
            <Card>
              <CardHeader>
                <CardTitle>Tickets por Prioridade</CardTitle>
                <CardDescription>Quantidade de tickets por nível de prioridade</CardDescription>
              </CardHeader>
              <CardContent className="pt-6" style={{ minHeight: '450px' }}>
                <div 
                  ref={barChartRef}
                  style={{ width: '100%', height: '400px', minHeight: '400px' }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart 
                      data={barChartData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
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
                      <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
