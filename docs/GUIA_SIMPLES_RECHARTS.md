# 🎯 Guia Simples: Recharts + shadcn

## ✅ COMO FUNCIONA: shadcn + Recharts

**shadcn é só UI** (cards, buttons, grids).  
**Recharts é que faz o gráfico de verdade.**

Você coloca um gráfico Recharts dentro de um componente shadcn (como `<Card>`).

### Estrutura típica:

```jsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Aqui vai o gráfico do Recharts */}
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dados}>
        ...
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

**Pronto. Esse é o conceito que você precisa entender.**

---

## 📌 MODELO BASE — Gráfico de Linhas (LineChart)

```jsx
"use client"

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

const data = [
  { name: "Jan", value: 40 },
  { name: "Fev", value: 55 },
  { name: "Mar", value: 80 },
  { name: "Abr", value: 65 },
]

export default function GraficoLinha() {
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Vendas Mensais</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## 🔥 MODELO BASE — Gráfico de Barras (BarChart)

```jsx
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"

const data = [
  { name: "Seg", vendas: 12 },
  { name: "Ter", vendas: 20 },
  { name: "Qua", vendas: 18 },
  { name: "Qui", vendas: 25 },
  { name: "Sex", vendas: 30 },
]

export default function GraficoBarra() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por dia</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="vendas" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## 🧠 O QUE VOCÊ PRECISA ENTENDER (explicação didática)

### 1. **Recharts é sempre colocado dentro do `<ResponsiveContainer>`**

```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    {/* componentes do gráfico */}
  </LineChart>
</ResponsiveContainer>
```

### 2. **O gráfico sempre recebe um `data={array}`**

```jsx
const data = [
  { name: "Jan", value: 40 },
  { name: "Fev", value: 55 }
]

<LineChart data={data}>
```

### 3. **Cada atributo vira um `dataKey="campo"`**

Se seu objeto tem `{ name: "Jan", value: 40 }`:
- `XAxis dataKey="name"` → mostra "Jan", "Fev" no eixo X
- `Line dataKey="value"` → usa o valor 40, 55 para desenhar a linha

### 4. **shadcn serve só como container visual (Cards, Grid, etc.)**

```jsx
<Card>           {/* shadcn - só visual */}
  <CardHeader>   {/* shadcn - só visual */}
    <CardTitle>  {/* shadcn - só visual */}
  </CardHeader>
  <CardContent>  {/* shadcn - só visual */}
    {/* AQUI vai o Recharts - isso que faz o gráfico */}
  </CardContent>
</Card>
```

### 5. **Todo componente de gráfico deve ter `"use client"`**

```jsx
"use client"  // ← SEMPRE no topo

import { ... } from "recharts"
```

**Por quê?** Recharts não funciona no servidor (SSR). Precisa rodar no cliente.

---

## 📊 MODELOS BASE COMPLETOS

### 🍕 Gráfico de Pizza (PieChart)

```jsx
"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

const data = [
  { name: "Baixa", value: 50 },
  { name: "Média", value: 30 },
  { name: "Alta", value: 20 }
]

const COLORS = ["#22c55e", "#eab308", "#ef4444"]

export default function GraficoPizza() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Prioridade</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### 📈 Gráfico de Área (AreaChart)

```jsx
"use client"

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

const data = [
  { name: "Jan", value: 100 },
  { name: "Fev", value: 120 },
  { name: "Mar", value: 150 }
]

export default function GraficoArea() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## ❌ ERROS COMUNS E COMO EVITAR

### 1. **Esquecer `"use client"`**

❌ **ERRADO:**
```jsx
import { LineChart } from "recharts"  // Vai quebrar no SSR
```

✅ **CORRETO:**
```jsx
"use client"  // ← SEMPRE no topo

import { LineChart } from "recharts"
```

---

### 2. **Não usar ResponsiveContainer**

❌ **ERRADO:**
```jsx
<CardContent>
  <LineChart data={data}>  {/* Não vai ser responsivo */}
    ...
  </LineChart>
</CardContent>
```

✅ **CORRETO:**
```jsx
<CardContent>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      ...
    </LineChart>
  </ResponsiveContainer>
</CardContent>
```

---

### 3. **dataKey errado**

❌ **ERRADO:**
```jsx
const data = [{ name: "Jan", value: 40 }]

<Line dataKey="valor" />  {/* Não existe "valor" no objeto */}
```

✅ **CORRETO:**
```jsx
const data = [{ name: "Jan", value: 40 }]

<Line dataKey="value" />  {/* Usa o campo que existe */}
```

---

### 4. **Dados vazios ou undefined**

❌ **ERRADO:**
```jsx
<LineChart data={undefined}>  {/* Vai quebrar */}
```

✅ **CORRETO:**
```jsx
const data = stats?.dados || []  // Sempre garanta um array

<LineChart data={data}>
```

---

### 5. **Altura não definida**

❌ **ERRADO:**
```jsx
<ResponsiveContainer width="100%">  {/* Sem height */}
  <LineChart data={data}>
```

✅ **CORRETO:**
```jsx
<ResponsiveContainer width="100%" height={300}>  {/* Com height */}
  <LineChart data={data}>
```

---

## 🎨 PERSONALIZAÇÃO COM CORES DO TEMA

Use cores do tema shadcn para manter consistência:

```jsx
// Cores do tema (HSL)
stroke="hsl(var(--primary))"      // Cor primária
fill="hsl(var(--primary))"        // Preenchimento primário
stroke="hsl(var(--secondary))"    // Cor secundária

// Ou use cores hexadecimais
stroke="#2563eb"  // blue-600
fill="#16a34a"    // green-600
```

---

## 📝 CHECKLIST RÁPIDO

Antes de criar um gráfico, verifique:

- [ ] Tem `"use client"` no topo?
- [ ] Está dentro de `<ResponsiveContainer>`?
- [ ] O `data` é um array válido?
- [ ] Os `dataKey` correspondem aos campos do objeto?
- [ ] A altura está definida no `ResponsiveContainer`?
- [ ] Está dentro de um componente shadcn (Card, etc.)?

---

## 🚀 EXEMPLO COMPLETO COM DADOS REAIS

```jsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { getTicketsStats } from "@/services/statistics"

export default function TicketsPorAgente() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await getTicketsStats('month')
        // Transformar dados do backend para o formato do gráfico
        const chartData = (stats.agent_productivity || []).map(agent => ({
          name: agent.user_name,
          tickets: agent.tickets_assigned || 0
        }))
        setData(chartData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets por Agente</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tickets" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## 📚 RESUMO FINAL

1. **shadcn = UI** (Card, CardHeader, CardContent)
2. **Recharts = Gráfico** (LineChart, BarChart, PieChart)
3. **Sempre use `"use client"`**
4. **Sempre use `<ResponsiveContainer>`**
5. **Sempre defina `height` no ResponsiveContainer**
6. **Sempre valide o `data` (use `|| []`)**

**Pronto! Agora você pode criar qualquer gráfico.** 🎉

