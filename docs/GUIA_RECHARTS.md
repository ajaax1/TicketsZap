# 📊 Guia de Uso do Recharts

Este projeto usa **Recharts** diretamente para criar gráficos. O shadcn/ui também usa Recharts por baixo dos panos, então estamos usando diretamente para ter mais controle e flexibilidade.

## 📦 Instalação

O Recharts já está instalado no projeto:

```json
"recharts": "^3.5.0"
```

## 🎯 Componentes Disponíveis

### 1. BarChart (Gráfico de Barras)

```jsx
import { BarChart } from '@/components/charts'

<BarChart
  data={[
    { label: 'Janeiro', value: 100 },
    { label: 'Fevereiro', value: 200 },
    { label: 'Março', value: 150 }
  ]}
  title="Vendas Mensais"
  description="Vendas por mês"
  dataKey="value"
  labelKey="label"
  color="#3b82f6"
  height={300}
/>
```

**Props:**
- `data` (array): Array de objetos com os dados
- `title` (string): Título do gráfico
- `description` (string, opcional): Descrição do gráfico
- `dataKey` (string, padrão: "value"): Chave do valor no objeto de dados
- `labelKey` (string, padrão: "label"): Chave do rótulo no objeto de dados
- `color` (string, padrão: "#3b82f6"): Cor das barras
- `height` (number, padrão: 300): Altura do gráfico em pixels

### 2. PieChart (Gráfico de Pizza)

```jsx
import { PieChart } from '@/components/charts'

<PieChart
  data={[
    { label: 'Baixa', value: 50 },
    { label: 'Média', value: 30 },
    { label: 'Alta', value: 20 }
  ]}
  title="Distribuição por Prioridade"
  description="Tickets por prioridade"
  valueKey="value"
  labelKey="label"
  showLegend={true}
  showPercentages={true}
/>
```

**Props:**
- `data` (array): Array de objetos com os dados
- `title` (string): Título do gráfico
- `description` (string, opcional): Descrição do gráfico
- `valueKey` (string, padrão: "value"): Chave do valor no objeto de dados
- `labelKey` (string, padrão: "label"): Chave do rótulo no objeto de dados
- `showLegend` (boolean, padrão: true): Mostrar legenda
- `showPercentages` (boolean, padrão: true): Mostrar percentuais nas fatias

### 3. LineChart (Gráfico de Linha)

```jsx
import { LineChart } from '@/components/charts'

<LineChart
  data={[
    { label: 'Jan', value: 100 },
    { label: 'Fev', value: 120 },
    { label: 'Mar', value: 150 }
  ]}
  title="Evolução Mensal"
  description="Tendência ao longo do tempo"
  dataKey="value"
  labelKey="label"
  color="#22c55e"
  height={300}
  strokeWidth={2}
/>
```

**Props:**
- `data` (array): Array de objetos com os dados
- `title` (string): Título do gráfico
- `description` (string, opcional): Descrição do gráfico
- `dataKey` (string, padrão: "value"): Chave do valor no objeto de dados
- `labelKey` (string, padrão: "label"): Chave do rótulo no objeto de dados
- `color` (string, padrão: "#3b82f6"): Cor da linha
- `height` (number, padrão: 300): Altura do gráfico em pixels
- `strokeWidth` (number, padrão: 2): Espessura da linha
- `dot` (boolean, padrão: true): Mostrar pontos na linha
- `showLegend` (boolean, padrão: false): Mostrar legenda

### 4. AreaChart (Gráfico de Área)

```jsx
import { AreaChart } from '@/components/charts'

<AreaChart
  data={[
    { label: 'Jan', value: 100 },
    { label: 'Fev', value: 120 },
    { label: 'Mar', value: 150 }
  ]}
  title="Evolução com Área"
  description="Tendência com preenchimento"
  dataKey="value"
  labelKey="label"
  color="#8b5cf6"
  height={300}
/>
```

**Props:**
- `data` (array): Array de objetos com os dados
- `title` (string): Título do gráfico
- `description` (string, opcional): Descrição do gráfico
- `dataKey` (string, padrão: "value"): Chave do valor no objeto de dados
- `labelKey` (string, padrão: "label"): Chave do rótulo no objeto de dados
- `color` (string, padrão: "#3b82f6"): Cor da área
- `height` (number, padrão: 300): Altura do gráfico em pixels
- `strokeWidth` (number, padrão: 2): Espessura da linha
- `fillOpacity` (number, padrão: 0.6): Opacidade do preenchimento
- `showLegend` (boolean, padrão: false): Mostrar legenda

### 5. AgentPerformanceChart (Gráfico de Desempenho por Agente)

Componente especializado para mostrar métricas de agentes com múltiplas abas.

```jsx
import { AgentPerformanceChart } from '@/components/charts'

<AgentPerformanceChart
  data={[
    {
      user_id: 1,
      user_name: "João Silva",
      tickets_assigned: 35,
      average_response_time_hours: 0.51,
      resolution_rate: 85.71,
      average_resolution_time_hours: 2.01
    }
  ]}
/>
```

### 6. PriorityChart (Gráfico de Prioridade)

Componente especializado para mostrar distribuição de tickets por prioridade.

```jsx
import { PriorityChart } from '@/components/charts'

<PriorityChart
  data={{
    baixa: { total: 50, percentage: 35.46 },
    media: { total: 40, percentage: 28.37 },
    alta: { total: 30, percentage: 21.28 }
  }}
/>
```

## 🎨 Personalização de Cores

Os componentes usam cores do tema do Tailwind/Shadcn por padrão. Você pode usar:

- Cores HSL do tema: `hsl(var(--primary))`, `hsl(var(--secondary))`, etc.
- Cores hexadecimais: `#3b82f6`, `#22c55e`, etc.
- Cores Tailwind: use as cores padrão do Tailwind

### Exemplo com cores do tema:

```jsx
<BarChart
  data={data}
  color="hsl(var(--primary))"
  title="Gráfico com Tema"
/>
```

## 📊 Exemplos Práticos

### Exemplo 1: Gráfico de Tickets por Mês

```jsx
import { BarChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'

const stats = await getTicketsStats('month')

const monthlyData = stats.by_month?.map(month => ({
  label: month.name,
  value: month.total
})) || []

<BarChart
  data={monthlyData}
  title="Tickets por Mês"
  description="Distribuição mensal de tickets"
  dataKey="value"
  labelKey="label"
/>
```

### Exemplo 2: Gráfico de Prioridade (Pizza)

```jsx
import { PieChart } from '@/components/charts'
import { getTicketsStats } from '@/services/statistics'

const stats = await getTicketsStats('month')

const priorityData = Object.entries(stats.by_priority || {}).map(([key, value]) => ({
  label: key === 'baixa' ? 'Baixa' : key === 'media' ? 'Média' : 'Alta',
  value: value.total
}))

<PieChart
  data={priorityData}
  title="Distribuição por Prioridade"
  description="Percentual de tickets por prioridade"
  valueKey="value"
  labelKey="label"
/>
```

### Exemplo 3: Gráfico de Linha - Evolução Temporal

```jsx
import { LineChart } from '@/components/charts'

const evolutionData = [
  { label: 'Semana 1', value: 10 },
  { label: 'Semana 2', value: 15 },
  { label: 'Semana 3', value: 12 },
  { label: 'Semana 4', value: 20 }
]

<LineChart
  data={evolutionData}
  title="Evolução Semanal"
  description="Tickets criados por semana"
  dataKey="value"
  labelKey="label"
  color="#22c55e"
/>
```

## 🔧 Uso Direto do Recharts

Se precisar de mais controle, você pode usar o Recharts diretamente:

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { name: 'Jan', value: 100 },
  { name: 'Fev', value: 200 }
]

<Card>
  <CardHeader>
    <CardTitle>Meu Gráfico</CardTitle>
  </CardHeader>
  <CardContent>
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
```

## 📚 Documentação do Recharts

Para mais informações sobre o Recharts, consulte:
- [Documentação Oficial do Recharts](https://recharts.org/)
- [Exemplos do Recharts](https://recharts.org/en-US/examples)

## 🎯 Boas Práticas

1. **Sempre use ResponsiveContainer**: Garante que os gráficos sejam responsivos
2. **Use cores do tema**: Prefira `hsl(var(--primary))` em vez de cores fixas
3. **Trate dados vazios**: Os componentes já tratam isso, mas sempre valide seus dados
4. **Use o ChartErrorBoundary**: Para capturar erros de renderização
5. **SSR**: Use `"use client"` e verifique `mounted` para evitar problemas de hidratação

## 🐛 Troubleshooting

### Gráfico não aparece
- Verifique se o componente está dentro de um container com altura definida
- Certifique-se de que os dados estão no formato correto
- Verifique o console do navegador para erros

### Problemas de SSR (Server-Side Rendering)
- Todos os componentes já têm proteção contra SSR
- Se ainda tiver problemas, verifique se está usando `"use client"`

### Cores não aparecem corretamente
- Use cores HSL do tema: `hsl(var(--primary))`
- Ou use cores hexadecimais: `#3b82f6`

