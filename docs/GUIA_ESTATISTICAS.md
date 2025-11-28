# 📊 Guia Completo de Estatísticas - Frontend

Este guia explica como usar todas as rotas de estatísticas disponíveis no sistema e como visualizá-las com gráficos usando Recharts.

---

## 🔐 Autenticação

Todas as rotas requerem autenticação via **Bearer Token** (Sanctum). O token é gerenciado automaticamente pelos serviços em `src/services/statistics.js`.

---

## 📍 Rotas Disponíveis

### 1. **Estatísticas Pessoais** (Qualquer usuário autenticado)
- `GET /api/statistics/my-stats` - **Suas próprias estatísticas**
- `GET /api/statistics/my-activity` - **🆕 Histórico completo de atividades**

### 2. **Estatísticas Administrativas** (Apenas Admin)
- `GET /api/admin/statistics/my-stats` - **Dados pessoais do admin**
- `GET /api/admin/statistics/compare-performance` - **🆕 Comparar sua performance com média dos outros**
- `GET /api/admin/statistics/dashboard` - Dashboard geral do sistema
- `GET /api/admin/statistics/tickets` - Estatísticas detalhadas de tickets
- `GET /api/admin/statistics/users` - Estatísticas de usuários
- `GET /api/admin/statistics/messages` - Estatísticas de mensagens

---

## 🆕 Novas Rotas Implementadas

### ✨ Rota de Comparação de Performance

**`GET /api/admin/statistics/compare-performance`**

Compare sua performance como administrador com a média de todos os outros usuários do sistema.

**Métricas comparadas:**
- ✅ Tickets atribuídos
- ✅ Tickets fechados
- ✅ Taxa de resolução
- ✅ Taxa de resposta
- ✅ Tempo médio de resposta
- ✅ Tempo médio de resolução
- ✅ Tempo de primeira resposta

**Status de comparação:**
- 🟢 `"better"` - Você está significativamente melhor (>10%)
- 🔴 `"worse"` - Você está significativamente pior (>10%)
- 🟡 `"similar"` - Você está similar à média (±10%)

---

## 📅 Parâmetros de Período

Todas as rotas suportam o parâmetro `period` via query string:

- `day` - Hoje
- `week` - Esta semana
- `month` - Este mês (padrão)
- `year` - Este ano
- `all` - Todos os dados

---

## 🎯 Serviços Disponíveis

O projeto já possui serviços prontos em `src/services/statistics.js`:

```javascript
import { 
  getDashboardStats,    // Dashboard admin
  getTicketsStats,      // Estatísticas de tickets
  getUsersStats,        // Estatísticas de usuários
  getMessagesStats,     // Estatísticas de mensagens
  getMyStats,           // 🆕 Estatísticas pessoais
  getMyActivity,        // 🆕 Histórico de atividades
  getAdminMyStats,      // 🆕 Estatísticas pessoais do admin
  comparePerformance    // 🆕 Comparação de performance
} from '@/services/statistics'
```

---

## 1️⃣ Estatísticas Pessoais (Qualquer Usuário)

### Endpoint
```
GET /api/statistics/my-stats?period=month
```

### Uso com Componente de Gráfico Pronto

```javascript
"use client"

import { useState, useEffect } from "react"
import { getMyStats } from '@/services/statistics'
import { MyStatsChart } from '@/components/charts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MyStatisticsPage = () => {
  const [stats, setStats] = useState(null)
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getMyStats(period)
        setStats(data)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [period])

  if (loading) return <div>Carregando...</div>
  if (!stats) return <div>Nenhum dado disponível</div>

  return (
    <div className="space-y-6">
      {/* Seletor de Período */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Componente de Gráfico Completo */}
      <MyStatsChart data={stats} />
    </div>
  )
}
```

### O que o MyStatsChart mostra:

- **Aba Visão Geral**: Cards com métricas principais + Gráfico de pizza de tickets por origem
- **Aba Prioridade**: Gráfico de pizza com distribuição por prioridade
- **Aba Status**: Gráfico de barras com distribuição por status
- **Aba Timeline**: Gráfico de linha com evolução diária dos tickets

---

## 2️⃣ Estatísticas Pessoais do Admin

### Endpoint
```
GET /api/admin/statistics/my-stats?period=month
```

### Uso

```javascript
// Adicione ao src/services/statistics.js
export async function getAdminMyStats(period = 'month') {
  const response = await api.get(`/admin/statistics/my-stats`, {
    params: { period }
  });
  return response.data;
}

// Uso no componente
import { getAdminMyStats } from '@/services/statistics'

const AdminMyStatsPage = () => {
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    const loadStats = async () => {
      const data = await getAdminMyStats('month')
      setStats(data)
    }
    loadStats()
  }, [])

  // Mesma estrutura de dados que getMyStats
  // ...
}
```

---

## 3️⃣ Comparar Performance com Média dos Outros (Admin)

### Endpoint
```
GET /api/admin/statistics/compare-performance?period=month
```

### Uso com Componente de Gráfico Pronto

```javascript
"use client"

import { useState, useEffect } from "react"
import { comparePerformance } from '@/services/statistics'
import { PerformanceComparisonChart } from '@/components/charts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PerformanceComparisonPage = () => {
  const [comparison, setComparison] = useState(null)
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadComparison = async () => {
      try {
        setLoading(true)
        const data = await comparePerformance(period)
        setComparison(data)
      } catch (error) {
        console.error('Erro ao carregar comparação:', error)
      } finally {
        setLoading(false)
      }
    }
    loadComparison()
  }, [period])

  if (loading) return <div>Carregando...</div>
  if (!comparison) return <div>Nenhum dado disponível</div>

  return (
    <div className="space-y-6">
      {/* Seletor de Período */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Componente de Gráfico Completo */}
      <PerformanceComparisonChart data={comparison} />
    </div>
  )
}
```

### O que o PerformanceComparisonChart mostra:

- **Aba Visão Geral**: Cards coloridos com todas as métricas comparadas, mostrando:
  - Meu valor vs Média dos outros
  - Diferença percentual
  - Status visual (Melhor/Pior/Similar) com cores e ícones
  
- **Aba Gráfico**: 
  - Comparação visual lado a lado (barras horizontais)
  - Gráfico de barras com minhas métricas
  - Indicadores de status para cada métrica

### Estrutura da Resposta

```json
{
  "period": "month",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "my_performance": {
    "productivity": {
      "tickets_assigned": 25,
      "tickets_closed": 20,
      "resolution_rate": 80.0,
      "response_rate": 90.0
    }
  },
  "average_others": {
    "productivity": {
      "tickets_assigned": 18.5,
      "tickets_closed": 15.2,
      "resolution_rate": 75.5
    },
    "total_users": 10
  },
  "comparison": {
    "tickets_assigned": {
      "my_value": 25,
      "average_value": 18.5,
      "difference_percent": 35.14,
      "status": "better"
    },
    "resolution_rate": {
      "my_value": 80.0,
      "average_value": 75.5,
      "difference_percent": 5.96,
      "status": "similar"
    }
  }
}
```

---

## 4️⃣ Estatísticas de Tickets (Admin) - Mais Usado

### Endpoint
```
GET /api/admin/statistics/tickets?period=month
```

### Uso com Gráficos Recharts

```javascript
"use client"

import { useState, useEffect } from "react"
import { getTicketsStats } from '@/services/statistics'
import { AgentPerformanceChart, PriorityChart, BarChart } from '@/components/charts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TicketsStatsPage() {
  const [ticketsData, setTicketsData] = useState(null)
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getTicketsStats(period)
        setTicketsData(data)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [period])

  if (loading) return <div>Carregando...</div>
  if (!ticketsData) return <div>Nenhum dado disponível</div>

  return (
    <div className="space-y-6">
      {/* Seletor de Período */}
      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Hoje</SelectItem>
          <SelectItem value="week">Esta Semana</SelectItem>
          <SelectItem value="month">Este Mês</SelectItem>
          <SelectItem value="year">Este Ano</SelectItem>
          <SelectItem value="all">Todos</SelectItem>
        </SelectContent>
      </Select>

      {/* Gráfico de Desempenho por Agente */}
      {ticketsData.agent_productivity && 
       Array.isArray(ticketsData.agent_productivity) && 
       ticketsData.agent_productivity.length > 0 && (
        <AgentPerformanceChart data={ticketsData.agent_productivity} />
      )}

      {/* Gráfico de Prioridade */}
      {ticketsData.by_priority && 
       typeof ticketsData.by_priority === 'object' &&
       Object.keys(ticketsData.by_priority).length > 0 && (
        <PriorityChart data={ticketsData.by_priority} />
      )}

      {/* Gráfico customizado: Tickets por Dia */}
      {ticketsData.by_day && ticketsData.by_day.length > 0 && (
        <BarChart
          data={ticketsData.by_day.map(day => ({
            label: new Date(day.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'short' 
            }),
            value: day.total
          }))}
          title="Tickets por Dia"
          description="Distribuição diária de tickets criados"
          dataKey="value"
          labelKey="label"
          color="#3b82f6"
          height={300}
        />
      )}
    </div>
  )
}
```

### Principais Dados Disponíveis

- ✅ `agent_productivity` - Array com produtividade dos agentes (use `AgentPerformanceChart`)
- ✅ `by_priority` - Objeto com distribuição por prioridade (use `PriorityChart`)
- ✅ `by_day` - Array com tickets por dia
- ✅ `by_user` - Top 10 usuários por tickets
- ✅ `by_cliente` - Top 10 clientes por tickets
- ✅ `resolution_time` - Tempos de resolução
- ✅ `response_time` - Tempos de resposta
- ✅ `overview` - Visão geral (total, abertos, resolvidos, etc.)

---

## 5️⃣ Dashboard Geral (Admin)

### Endpoint
```
GET /api/admin/statistics/dashboard?period=month
```

### Uso com Serviço

```javascript
import { getDashboardStats } from '@/services/statistics'

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboardStats(period)
        setDashboardData(data)
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
      }
    }
    loadDashboard()
  }, [period])

  if (!dashboardData) return <div>Carregando...</div>

  return (
    <div>
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.tickets?.total || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.users?.total || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.messages?.total || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Resolução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.performance?.resolution_rate?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## 6️⃣ Estatísticas de Usuários (Admin)

### Endpoint
```
GET /api/admin/statistics/users?period=month
```

### Uso com Gráficos

```javascript
import { getUsersStats } from '@/services/statistics'
import { BarChart, PieChart } from '@/components/charts'

const UsersStatsPage = () => {
  const [usersData, setUsersData] = useState(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getUsersStats('month')
        setUsersData(data)
      } catch (error) {
        console.error('Erro:', error)
      }
    }
    loadStats()
  }, [])

  if (!usersData) return <div>Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Gráfico de Distribuição por Role */}
      {usersData.by_role && (
        <PieChart
          data={Object.entries(usersData.by_role).map(([role, count]) => ({
            label: role === 'admin' ? 'Admin' : 
                   role === 'support' ? 'Suporte' :
                   role === 'assistant' ? 'Assistente' : 'Cliente',
            value: count
          }))}
          title="Distribuição de Usuários por Role"
          description="Quantidade de usuários por tipo"
        />
      )}

      {/* Gráfico de Top Performers */}
      {usersData.top_performers && usersData.top_performers.length > 0 && (
        <BarChart
          data={usersData.top_performers.map(performer => ({
            label: performer.user_name,
            value: performer.resolved_tickets
          }))}
          title="Top Performers"
          description="Usuários com mais tickets resolvidos"
          dataKey="value"
          labelKey="label"
          color="#22c55e"
          height={400}
        />
      )}
    </div>
  )
}
```

---

## 7️⃣ Estatísticas de Mensagens (Admin)

### Endpoint
```
GET /api/admin/statistics/messages?period=month
```

### Uso com Gráficos

```javascript
import { getMessagesStats } from '@/services/statistics'
import { BarChart, LineChart } from '@/components/charts'

const MessagesStatsPage = () => {
  const [messagesData, setMessagesData] = useState(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getMessagesStats('month')
        setMessagesData(data)
      } catch (error) {
        console.error('Erro:', error)
      }
    }
    loadStats()
  }, [])

  if (!messagesData) return <div>Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Gráfico de Mensagens por Dia */}
      {messagesData.by_day && messagesData.by_day.length > 0 && (
        <LineChart
          data={messagesData.by_day.map(day => ({
            label: new Date(day.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'short' 
            }),
            value: day.total
          }))}
          title="Mensagens por Dia"
          description="Evolução diária de mensagens"
          dataKey="value"
          labelKey="label"
          color="#8b5cf6"
          height={300}
        />
      )}

      {/* Gráfico Interno vs Externo */}
      {messagesData.internal_vs_external && (
        <BarChart
          data={[
            { label: 'Internas', value: messagesData.internal_vs_external.internal || 0 },
            { label: 'Externas', value: messagesData.internal_vs_external.external || 0 }
          ]}
          title="Mensagens Internas vs Externas"
          description="Comparação de mensagens internas e externas"
          dataKey="value"
          labelKey="label"
          color="#f97316"
        />
      )}
    </div>
  )
}
```

---

## 🎨 Componentes de Gráficos Disponíveis

### Componentes Prontos (Recomendados)

```javascript
import { 
  BarChart,                    // Gráfico de barras simples
  PieChart,                    // Gráfico de pizza
  LineChart,                   // Gráfico de linhas
  AreaChart,                   // Gráfico de área
  AgentPerformanceChart,       // Gráfico especializado de agentes (com abas)
  PriorityChart,               // Gráfico especializado de prioridade (pizza + barras)
  MyStatsChart,                // 🆕 Gráfico de estatísticas pessoais (com abas)
  PerformanceComparisonChart   // 🆕 Gráfico de comparação de performance (com abas)
} from '@/components/charts'
```

### Novos Componentes

#### MyStatsChart
Componente completo para exibir estatísticas pessoais com múltiplas abas:
- Visão Geral (cards + gráfico de origem)
- Prioridade (gráfico de pizza)
- Status (gráfico de barras)
- Timeline (gráfico de linha)

#### PerformanceComparisonChart
Componente completo para comparar performance do admin com média dos outros:
- Visão Geral (cards coloridos com status)
- Gráfico (comparação visual lado a lado)

---

## 🎣 Hook Personalizado para Estatísticas

```javascript
// hooks/useStatistics.js
"use client"

import { useState, useEffect } from 'react'
import { 
  getTicketsStats, 
  getDashboardStats, 
  getUsersStats,
  getMessagesStats,
  getMyStats,
  getAdminMyStats,
  comparePerformance
} from '@/services/statistics'

export const useStatistics = (type = 'tickets', period = 'month') => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let result
        switch (type) {
          case 'tickets':
            result = await getTicketsStats(period)
            break
          case 'dashboard':
            result = await getDashboardStats(period)
            break
          case 'users':
            result = await getUsersStats(period)
            break
          case 'messages':
            result = await getMessagesStats(period)
            break
          case 'my-stats':
            result = await getMyStats(period)
            break
          case 'admin-my-stats':
            result = await getAdminMyStats(period)
            break
          case 'compare-performance':
            result = await comparePerformance(period)
            break
          default:
            throw new Error(`Tipo de estatística desconhecido: ${type}`)
        }
        
        setData(result)
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar estatísticas')
        console.error('Erro ao carregar estatísticas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [type, period])

  const refetch = () => {
    fetchStats()
  }

  return { data, loading, error, refetch }
}

// Uso
const MyComponent = () => {
  const { data, loading, error } = useStatistics('tickets', 'month')
  
  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>
  if (!data) return null

  return (
    <div>
      <h1>Total: {data.overview?.total || 0}</h1>
    </div>
  )
}
```

---

## ⚠️ Tratamento de Erros

```javascript
import { toast } from 'sonner'

const loadStats = async () => {
  try {
    const data = await getTicketsStats('month')
    return data
  } catch (error) {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Sessão expirada. Faça login novamente.')
    } else if (error.response?.status === 403) {
      // Sem permissão (não é admin)
      toast.error('Acesso negado. Apenas administradores podem acessar.')
    } else {
      toast.error('Erro ao carregar estatísticas. Tente novamente.')
      console.error('Erro:', error)
    }
    throw error
  }
}
```

---

## 📝 Notas Importantes

1. **Autenticação**: Os serviços já gerenciam o token automaticamente
2. **Períodos**: Use `day`, `week`, `month`, `year` ou `all`
3. **Permissões**: Rotas `/admin/statistics/*` requerem role `admin`
4. **Formato de Datas**: As datas retornadas estão no formato ISO 8601
5. **Percentuais**: Todos os percentuais são números (ex: 85.71 = 85.71%)
6. **Tempos**: Todos os tempos estão em minutos e horas
7. **Gráficos**: Use sempre `"use client"` nos componentes que usam gráficos
8. **Validação**: Sempre valide se os dados existem antes de passar para os gráficos

---

## 🚀 Boas Práticas

### 1. Sempre Valide os Dados

```javascript
{stats.agent_productivity && 
 Array.isArray(stats.agent_productivity) && 
 stats.agent_productivity.length > 0 && (
  <AgentPerformanceChart data={stats.agent_productivity} />
)}
```

### 2. Trate Estados de Loading e Erro

```javascript
if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
if (!data) return <EmptyState />
```

### 3. Use Estados Controlados para Períodos

```javascript
const [period, setPeriod] = useState('month')

useEffect(() => {
  loadStats(period)
}, [period])
```

### 4. Transforme Dados Antes de Passar para Gráficos

```javascript
const chartData = stats.by_day.map(day => ({
  label: formatDate(day.date),
  value: day.total
}))
```

---

## 📋 Resumo das Rotas por Tipo de Usuário

### 👤 Qualquer Usuário Autenticado

| Rota | Descrição | Uso |
|------|-----------|-----|
| `GET /api/statistics/my-stats` | Estatísticas pessoais | Ver seus próprios tickets e performance |

### 🔒 Apenas Admin

| Rota | Descrição | Uso |
|------|-----------|-----|
| `GET /api/admin/statistics/my-stats` | Estatísticas pessoais do admin | Ver seus próprios dados |
| `GET /api/admin/statistics/compare-performance` | **🆕 Comparar performance** | Comparar sua performance com média dos outros |
| `GET /api/admin/statistics/dashboard` | Dashboard geral | Visão geral do sistema |
| `GET /api/admin/statistics/tickets` | Estatísticas de tickets | Análise detalhada de todos os tickets |
| `GET /api/admin/statistics/users` | Estatísticas de usuários | Performance e atividade dos usuários |
| `GET /api/admin/statistics/messages` | Estatísticas de mensagens | Análise de mensagens do sistema |

---

## 📚 Referências

- [Guia Simples do Recharts](./GUIA_SIMPLES_RECHARTS.md) - Como usar Recharts
- [Modelos Base de Componentes](./MODELOS_BASE.md) - Componentes simples
- [Dados Disponíveis para Gráficos](./DADOS_GRAFICOS_DISPONIVEIS.md) - Estrutura dos dados
- [Diagnóstico de Gráficos](./DIAGNOSTICO_GRAFICOS.md) - Troubleshooting
- [Rotas dos Gráficos](./ROTAS_GRAFICOS.md) - Rotas específicas dos gráficos

---

## 🎯 Checklist Rápido

Antes de criar um gráfico:

- [ ] Importei o componente de gráfico correto?
- [ ] Adicionei `"use client"` no topo do arquivo?
- [ ] Validei se os dados existem antes de passar para o gráfico?
- [ ] Transformei os dados para o formato correto?
- [ ] Usei `dataKey` e `labelKey` corretos?
- [ ] Defini altura adequada para o gráfico?
- [ ] Tratei estados de loading e erro?

