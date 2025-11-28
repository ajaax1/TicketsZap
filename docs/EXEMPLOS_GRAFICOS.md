# 📊 Exemplos Práticos de Gráficos com Recharts

Este documento mostra exemplos práticos de como criar gráficos usando os componentes Recharts disponíveis no projeto, baseados nos dados do endpoint `/admin/statistics/tickets`.

## 📋 Índice

1. [Gráfico de Desempenho por Agente](#gráfico-de-desempenho-por-agente)
2. [Gráfico de Prioridade dos Tickets](#gráfico-de-prioridade-dos-tickets)
3. [Gráfico de Tempo Médio de Resposta](#gráfico-de-tempo-médio-de-resposta)
4. [Gráfico de Taxa de Resolução](#gráfico-de-taxa-de-resolução)
5. [Gráfico de Evolução Temporal](#gráfico-de-evolução-temporal)

---

## 1. Gráfico de Desempenho por Agente

### Usando o componente especializado:

```jsx
import { AgentPerformanceChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'

export function AgentPerformanceSection() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getTicketsStats('month')
        setStats(data.agent_productivity || [])
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) return <div>Carregando...</div>

  return (
    <AgentPerformanceChart data={stats} />
  )
}
```

### Criando um gráfico customizado:

```jsx
import { BarChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'

export function CustomAgentChart() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function loadStats() {
      const data = await getTicketsStats('month')
      setStats(data.agent_productivity || [])
    }
    loadStats()
  }, [])

  if (!stats) return <div>Carregando...</div>

  // Preparar dados para o gráfico
  const chartData = stats.map(agent => ({
    label: agent.user_name,
    value: agent.tickets_assigned || agent.tickets_received || 0
  }))

  return (
    <BarChart
      data={chartData}
      title="Tickets Atendidos por Agente"
      description="Quantidade de tickets atribuídos a cada agente"
      dataKey="value"
      labelKey="label"
      color="hsl(var(--primary))"
      height={400}
    />
  )
}
```

---

## 2. Gráfico de Prioridade dos Tickets

### Usando o componente especializado:

```jsx
import { PriorityChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'

export function PrioritySection() {
  const [priorityData, setPriorityData] = useState({})

  useEffect(() => {
    async function loadStats() {
      const data = await getTicketsStats('month')
      setPriorityData(data.by_priority || {})
    }
    loadStats()
  }, [])

  return <PriorityChart data={priorityData} />
}
```

### Criando um gráfico de pizza customizado:

```jsx
import { PieChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'

export function CustomPriorityPieChart() {
  const [priorityData, setPriorityData] = useState([])

  useEffect(() => {
    async function loadStats() {
      const data = await getTicketsStats('month')
      
      // Transformar dados do formato do backend para o formato do gráfico
      const formatted = Object.entries(data.by_priority || {}).map(([key, value]) => {
        const labels = {
          baixa: 'Baixa',
          media: 'Média',
          alta: 'Alta'
        }
        
        return {
          label: labels[key] || key,
          value: value.total || 0
        }
      })
      
      setPriorityData(formatted)
    }
    loadStats()
  }, [])

  return (
    <PieChart
      data={priorityData}
      title="Distribuição por Prioridade"
      description="Percentual de tickets por nível de prioridade"
      valueKey="value"
      labelKey="label"
      showLegend={true}
      showPercentages={true}
    />
  )
}
```

---

## 3. Gráfico de Tempo Médio de Resposta

```jsx
import { BarChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'

export function ResponseTimeChart() {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    async function loadStats() {
      const data = await getTicketsStats('month')
      
      const formatted = (data.agent_productivity || []).map(agent => ({
        label: agent.user_name,
        value: agent.average_response_time_hours || 0
      }))
      
      setChartData(formatted)
    }
    loadStats()
  }, [])

  return (
    <BarChart
      data={chartData}
      title="Tempo Médio de Resposta por Agente"
      description="Tempo médio até primeira resposta (em horas)"
      dataKey="value"
      labelKey="label"
      color="#22c55e"
      height={400}
    />
  )
}
```

---

## 4. Gráfico de Taxa de Resolução

```jsx
import { BarChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'

export function ResolutionRateChart() {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    async function loadStats() {
      const data = await getTicketsStats('month')
      
      const formatted = (data.agent_productivity || []).map(agent => ({
        label: agent.user_name,
        value: agent.resolution_rate || 0
      }))
      
      setChartData(formatted)
    }
    loadStats()
  }, [])

  return (
    <BarChart
      data={chartData}
      title="Taxa de Resolução por Agente"
      description="Percentual de tickets resolvidos"
      dataKey="value"
      labelKey="label"
      color="#8b5cf6"
      height={400}
    />
  )
}
```

---

## 5. Gráfico de Evolução Temporal

### Usando LineChart:

```jsx
import { LineChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'

export function TemporalEvolutionChart() {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    async function loadStats() {
      // Assumindo que você tem dados temporais (por semana, mês, etc.)
      // Adapte conforme a estrutura dos seus dados
      const data = await getTicketsStats('month')
      
      // Exemplo: se você tiver dados por semana
      const formatted = [
        { label: 'Semana 1', value: 10 },
        { label: 'Semana 2', value: 15 },
        { label: 'Semana 3', value: 12 },
        { label: 'Semana 4', value: 20 }
      ]
      
      setChartData(formatted)
    }
    loadStats()
  }, [])

  return (
    <LineChart
      data={chartData}
      title="Evolução de Tickets"
      description="Tickets criados ao longo do tempo"
      dataKey="value"
      labelKey="label"
      color="#3b82f6"
      height={400}
      strokeWidth={3}
    />
  )
}
```

### Usando AreaChart:

```jsx
import { AreaChart } from '@/components/charts'

export function TemporalAreaChart() {
  const chartData = [
    { label: 'Jan', value: 100 },
    { label: 'Fev', value: 120 },
    { label: 'Mar', value: 150 },
    { label: 'Abr', value: 130 }
  ]

  return (
    <AreaChart
      data={chartData}
      title="Evolução com Área"
      description="Tendência de tickets com preenchimento"
      dataKey="value"
      labelKey="label"
      color="#8b5cf6"
      height={400}
      fillOpacity={0.6}
    />
  )
}
```

---

## 6. Múltiplos Gráficos em uma Página

```jsx
import { BarChart, PieChart, LineChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function DashboardCharts() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getTicketsStats('month')
        setStats(data)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) return <div>Carregando...</div>
  if (!stats) return <div>Nenhum dado disponível</div>

  // Preparar dados
  const agentData = (stats.agent_productivity || []).map(agent => ({
    label: agent.user_name,
    value: agent.tickets_assigned || 0
  }))

  const priorityData = Object.entries(stats.by_priority || {}).map(([key, value]) => ({
    label: key === 'baixa' ? 'Baixa' : key === 'media' ? 'Média' : 'Alta',
    value: value.total || 0
  }))

  return (
    <div className="space-y-6">
      <Tabs defaultValue="agents" className="w-full">
        <TabsList>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="priority">Prioridade</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <BarChart
            data={agentData}
            title="Tickets por Agente"
            description="Distribuição de tickets entre agentes"
            dataKey="value"
            labelKey="label"
          />
        </TabsContent>

        <TabsContent value="priority">
          <PieChart
            data={priorityData}
            title="Distribuição por Prioridade"
            description="Tickets por nível de prioridade"
            valueKey="value"
            labelKey="label"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## 7. Gráfico Customizado com Recharts Direto

Para casos mais complexos, você pode usar o Recharts diretamente:

```jsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"
import { getTicketsStats } from '@/services/statistics'

export function CustomMultiBarChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    async function loadStats() {
      const stats = await getTicketsStats('month')
      
      const formatted = (stats.agent_productivity || []).map(agent => ({
        name: agent.user_name,
        tickets: agent.tickets_assigned || 0,
        resolvidos: agent.tickets_closed || 0,
        naoResolvidos: agent.tickets_not_resolved || 0
      }))
      
      setData(formatted)
    }
    loadStats()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho Detalhado por Agente</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
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
              <Legend />
              <Bar dataKey="tickets" fill="hsl(var(--primary))" name="Tickets Atribuídos" />
              <Bar dataKey="resolvidos" fill="#22c55e" name="Resolvidos" />
              <Bar dataKey="naoResolvidos" fill="#ef4444" name="Não Resolvidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 💡 Dicas

1. **Sempre trate dados vazios**: Os componentes já fazem isso, mas é bom validar antes de passar os dados
2. **Use cores do tema**: Prefira `hsl(var(--primary))` em vez de cores fixas para manter consistência
3. **Altura adequada**: Use altura de pelo menos 300px para gráficos legíveis
4. **Responsividade**: Todos os componentes usam `ResponsiveContainer`, então são automaticamente responsivos
5. **Loading states**: Sempre mostre um estado de carregamento enquanto busca os dados

---

## 🔗 Referências

- [Guia Completo do Recharts](./GUIA_RECHARTS.md)
- [Dados Disponíveis para Gráficos](./DADOS_GRAFICOS_DISPONIVEIS.md)
- [Documentação do Recharts](https://recharts.org/)

