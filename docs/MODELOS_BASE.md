# 📋 Modelos Base de Componentes

Estes são componentes simples e diretos que você pode usar como base para criar seus próprios gráficos.

## 🎯 Conceito Principal

**shadcn = UI (Card, CardHeader, CardContent)**  
**Recharts = Gráfico (BarChart, LineChart, PieChart)**

```jsx
<Card>                    {/* shadcn - só visual */}
  <CardHeader>            {/* shadcn - só visual */}
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>           {/* shadcn - só visual */}
    <ResponsiveContainer> {/* Recharts - wrapper */}
      <BarChart>          {/* Recharts - gráfico */}
        ...
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

---

## 📦 Componentes Disponíveis

### 1. SimpleBarChart

```jsx
import { SimpleBarChart } from '@/components/charts'

<SimpleBarChart
  data={[
    { name: "Jan", value: 40 },
    { name: "Fev", value: 55 }
  ]}
  title="Vendas Mensais"
  dataKey="value"
  nameKey="name"
  color="hsl(var(--primary))"
  height={300}
/>
```

### 2. SimpleLineChart

```jsx
import { SimpleLineChart } from '@/components/charts'

<SimpleLineChart
  data={[
    { name: "Jan", value: 40 },
    { name: "Fev", value: 55 }
  ]}
  title="Evolução Mensal"
  dataKey="value"
  nameKey="name"
  color="#2563eb"
  height={300}
  strokeWidth={3}
/>
```

### 3. SimplePieChart

```jsx
import { SimplePieChart } from '@/components/charts'

<SimplePieChart
  data={[
    { name: "Baixa", value: 50 },
    { name: "Média", value: 30 },
    { name: "Alta", value: 20 }
  ]}
  title="Distribuição por Prioridade"
  dataKey="value"
  nameKey="name"
  height={300}
  showLegend={true}
/>
```

### 4. SimpleAreaChart

```jsx
import { SimpleAreaChart } from '@/components/charts'

<SimpleAreaChart
  data={[
    { name: "Jan", value: 100 },
    { name: "Fev", value: 120 }
  ]}
  title="Evolução com Área"
  dataKey="value"
  nameKey="name"
  color="#8b5cf6"
  height={300}
/>
```

---

## 🚀 Como Usar com Dados Reais

### Exemplo: Tickets por Agente

```jsx
"use client"

import { useState, useEffect } from "react"
import { SimpleBarChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'

export function TicketsPorAgente() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await getTicketsStats('month')
        
        // Transformar dados do backend para o formato do gráfico
        const chartData = (stats.agent_productivity || []).map(agent => ({
          name: agent.user_name,
          value: agent.tickets_assigned || 0
        }))
        
        setData(chartData)
      } catch (error) {
        console.error('Erro:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <SimpleBarChart
      data={data}
      title="Tickets por Agente"
      dataKey="value"
      nameKey="name"
    />
  )
}
```

---

## 📝 Checklist ao Criar um Gráfico

- [ ] Tem `"use client"` no topo?
- [ ] Está dentro de `<ResponsiveContainer>`?
- [ ] O `data` é um array válido (use `|| []`)?
- [ ] Os `dataKey` correspondem aos campos do objeto?
- [ ] A altura está definida no `ResponsiveContainer`?
- [ ] Está dentro de um componente shadcn (Card)?

---

## 🎨 Personalização

### Cores do Tema

```jsx
// Use cores do tema shadcn
color="hsl(var(--primary))"
color="hsl(var(--secondary))"

// Ou cores hexadecimais
color="#2563eb"  // blue-600
color="#16a34a"  // green-600
```

### Altura

```jsx
height={300}  // Padrão
height={400}  // Mais alto
height={200}  // Mais baixo
```

---

## 📚 Veja Também

- [Guia Simples do Recharts](./GUIA_SIMPLES_RECHARTS.md) - Explicação didática completa
- [Exemplos Práticos](./EXEMPLOS_GRAFICOS.md) - Exemplos com dados reais
- [Dados Disponíveis](./DADOS_GRAFICOS_DISPONIVEIS.md) - Estrutura dos dados do backend

