"use client"

/**
 * Gráfico de Barras usando Recharts
 * 
 * Estrutura:
 * - shadcn Card = container visual
 * - ResponsiveContainer = wrapper responsivo do Recharts
 * - BarChart = gráfico do Recharts
 */

import { useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export function BarChart({ 
  data = [], 
  title = "Gráfico de Barras",
  description,
  dataKey = "value",
  labelKey = "label",
  color = "hsl(var(--primary))",
  height = 300
}) {
  const containerRef = useRef(null)
  
  // DEBUG: Log completo dos dados
  useEffect(() => {
    console.log(`🔍 [BarChart:${title}] DEBUG INICIADO`)
    console.log(`📊 [BarChart:${title}] Props recebidas:`, {
      data,
      title,
      dataKey,
      labelKey,
      color,
      height,
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataLength: data?.length || 0
    })
  }, [data, title, dataKey, labelKey, color, height])

  // Sempre garantir que data é um array válido
  const chartData = Array.isArray(data) ? data : []

  // Se não tem dados, mostrar mensagem
  if (chartData.length === 0) {
    console.warn(`⚠️ [BarChart:${title}] Sem dados válidos`)
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

  // DEBUG: Log dos dados formatados
  useEffect(() => {
    console.log(`📈 [BarChart:${title}] Dados formatados:`, {
      formattedData,
      firstItem: formattedData[0],
      allItems: formattedData
    })
  }, [formattedData, title])

  // DEBUG: Verificar altura do container após renderização
  useEffect(() => {
    const checkContainer = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight
        const width = containerRef.current.offsetWidth
        console.log(`📐 [BarChart:${title}] Container size:`, { width, height })
        
        if (height === 0) {
          console.error(`❌ [BarChart:${title}] PROBLEMA: Container tem altura 0!`)
        }
      }
    }
    
    checkContainer()
    setTimeout(checkContainer, 100)
    setTimeout(checkContainer, 500)
  }, [title])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          style={{ width: '100%', height: `${height}px`, border: '1px solid red' }}
          data-debug-chart={title}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
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
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '4px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar 
                dataKey="value" 
                fill={color}
                radius={[8, 8, 0, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
