# 📚 Documentação das Rotas de Estatísticas

Documentação completa das rotas de estatísticas: o que retornam e como usar.

---

## 🔐 Autenticação

Todas as rotas requerem autenticação via **Bearer Token** no header:

```
Authorization: Bearer {seu_token}
```

---

## 📅 Parâmetros de Período

Todas as rotas suportam o parâmetro `period` via query string:

- `day` - Hoje
- `week` - Esta semana  
- `month` - Este mês (padrão)
- `year` - Este ano
- `all` - Todos os dados

**Exemplo:** `GET /api/statistics/my-stats?period=week`

---

## 👤 ROTAS PESSOAIS (Qualquer Usuário Autenticado)

### 1. Estatísticas e Métricas

**Rota:** `GET /api/statistics/my-stats?period=month`

**Descrição:** Retorna estatísticas completas dos tickets atribuídos ao usuário logado.

**Serviço:** `getMyStats(period)` em `src/services/statistics.js`

**Componente:** `<MyStatsChart data={stats} />` em `src/components/charts/MyStatsChart.jsx`

#### Estrutura da Resposta:

Ver documentação completa em `docs/GUIA_ESTATISTICAS.md`

---

### 2. Histórico de Atividades

**Rota:** `GET /api/statistics/my-activity?period=month&limit=50`

**Descrição:** Retorna histórico completo de todas as atividades do usuário logado.

**Parâmetros:**

- `period` (opcional): `day`, `week`, `month`, `year`, `all` (padrão: `month`)
- `limit` (opcional): Número máximo de atividades na timeline (padrão: 50)

**Serviço:** `getMyActivity(period, limit)` em `src/services/statistics.js`

**Componente:** `<MyActivity period="month" />` em `src/components/my-activity.jsx`

**Import:** `import { MyActivity } from '@/components/my-activity'`

#### Uso:

```javascript
"use client"

import { MyActivity } from '@/components/charts'

const MyActivityPage = () => {
  return (
    <div className="space-y-6">
      <MyActivity period="month" />
    </div>
  )
}
```

#### Estrutura da Resposta:

```json
{
  "period": "month",
  "start_date": "2025-11-01 00:00:00",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "support"
  },
  "summary": {
    "tickets_created": 15,
    "tickets_updated": 12,
    "messages_sent": 45,
    "attachments_uploaded": 8
  },
  "timeline": [
    {
      "type": "ticket_created",
      "id": 123,
      "title": "Problema no sistema",
      "description": "Ticket criado: Problema no sistema",
      "status": "aberto",
      "priority": "alta",
      "created_at": "2025-11-15T10:30:00.000000Z"
    },
    {
      "type": "message_sent",
      "id": 456,
      "ticket_id": 123,
      "ticket_title": "Problema no sistema",
      "description": "Mensagem enviada",
      "message_preview": "Olá, vou analisar o problema...",
      "is_internal": false,
      "created_at": "2025-11-15T10:35:00.000000Z"
    }
  ],
  "tickets_created": [...],
  "tickets_updated": [...],
  "messages_sent": [...],
  "attachments_uploaded": [...]
}
```

#### O que o componente MyActivity mostra:

- **Cards de Resumo**: Tickets criados, atualizados, mensagens enviadas, anexos enviados
- **Aba Timeline**: Lista cronológica de todas as atividades (tickets, mensagens, anexos)
- **Aba Tickets**: Lista separada de tickets criados e atualizados
- **Aba Mensagens**: Lista de todas as mensagens enviadas
- **Aba Anexos**: Lista de todos os anexos enviados

---

## 🔒 ROTAS ADMINISTRATIVAS (Apenas Admin)

### 3. Estatísticas Pessoais do Admin

**Rota:** `GET /api/admin/statistics/my-stats?period=month`

**Descrição:** Retorna as mesmas estatísticas da rota `/api/statistics/my-stats`, mas dentro do grupo de rotas administrativas.

**Serviço:** `getAdminMyStats(period)` em `src/services/statistics.js`

**Estrutura da Resposta:** Idêntica à rota `/api/statistics/my-stats`

---

### 4. Comparar Performance

**Rota:** `GET /api/admin/statistics/compare-performance?period=month`

**Descrição:** Compara a performance do administrador logado com a média de todos os outros usuários do sistema.

**Serviço:** `comparePerformance(period)` em `src/services/statistics.js`

**Componente:** `<PerformanceComparisonChart comparison={data} />` em `src/components/charts/PerformanceComparisonChart.jsx`

#### Estrutura da Resposta:

Ver documentação completa em `docs/GUIA_ESTATISTICAS.md`

#### Métricas Comparadas:

1. **`tickets_assigned`** - Tickets atribuídos (maior = melhor)
2. **`tickets_closed`** - Tickets fechados (maior = melhor)
3. **`resolution_rate`** - Taxa de resolução % (maior = melhor)
4. **`response_rate`** - Taxa de resposta % (maior = melhor)
5. **`average_response_time`** - Tempo médio de resposta em horas (menor = melhor)
6. **`average_resolution_time`** - Tempo médio de resolução em horas (menor = melhor)
7. **`first_response_time`** - Tempo de primeira resposta em horas (menor = melhor)

**Status de comparação:**

- 🟢 `"better"` - Você está significativamente melhor (>10%)
- 🔴 `"worse"` - Você está significativamente pior (>10%)
- 🟡 `"similar"` - Você está similar à média (±10%)

**Nota Importante:** Para métricas de tempo (response_time, resolution_time), valores negativos em `difference_percent` são melhores, pois significam menor tempo.

---

## 📋 Resumo das Rotas Implementadas

| Rota | Usuário | Serviço | Componente | Status |
|------|---------|---------|------------|--------|
| `/api/statistics/my-stats` | Qualquer | `getMyStats()` | `<MyStatsChart />` | ✅ Implementado |
| `/api/statistics/my-activity` | Qualquer | `getMyActivity()` | `<MyActivity />` | ✅ Implementado |
| `/api/admin/statistics/my-stats` | Admin | `getAdminMyStats()` | `<MyStatsChart />` | ✅ Implementado |
| `/api/admin/statistics/compare-performance` | Admin | `comparePerformance()` | `<PerformanceComparisonChart />` | ✅ Implementado |

---

## 🎯 Como Usar

### Exemplo Completo - Página de Estatísticas Pessoais:

```javascript
"use client"

import { useState, useEffect } from "react"
import { getMyStats, getMyActivity } from '@/services/statistics'
import { MyStatsChart } from '@/components/charts'
import { MyActivity } from '@/components/my-activity'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MyStatisticsPage = () => {
  const [stats, setStats] = useState(null)
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [statsData] = await Promise.all([
          getMyStats(period)
        ])
        setStats(statsData)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [period])

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="stats">
        <TabsList>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="activity">Atividades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          {stats && <MyStatsChart data={stats} />}
        </TabsContent>
        
        <TabsContent value="activity">
          <MyActivity period={period} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## ⚠️ Observações Importantes

1. **Autenticação:** Sempre inclua o token no header `Authorization: Bearer {token}` (gerenciado automaticamente pelos serviços)

2. **Períodos:** Use `day`, `week`, `month`, `year` ou `all` no parâmetro `period`

3. **Permissões:** 
   - Rotas `/api/statistics/*` - Qualquer usuário autenticado
   - Rotas `/api/admin/statistics/*` - Apenas admin

4. **Formato de Datas:** Todas as datas retornadas estão no formato ISO 8601

5. **Percentuais:** Todos os percentuais são números (ex: 85.71 = 85.71%)

6. **Tempos:** 
   - Estão disponíveis em minutos e horas
   - Use `average_hours` para exibição mais legível

---

**Última atualização:** Novembro 2025

