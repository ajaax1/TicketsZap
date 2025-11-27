# 📊 Dados Disponíveis para Gráficos

## ✅ Dados Disponíveis no Endpoint `/admin/statistics/tickets`

### 1. 👨‍💻 Desempenho por Agente

**Disponível em:** `agent_productivity` e `tickets_by_agent_detailed`

#### Estrutura dos dados:

```javascript
// agent_productivity
[
  {
    "user_id": 2,
    "user_name": "João Silva",
    "user_email": "joao@example.com",
    "user_role": "support",
    "tickets_assigned": 35,              // ✅ Tickets atribuídos
    "tickets_closed": 30,                // ✅ Tickets fechados
    "tickets_not_resolved": 5,           // ✅ Tickets não resolvidos
    "resolution_rate": 85.71,            // ✅ Taxa de resolução (%)
    "average_response_time_minutes": 30.5,  // ✅ Tempo médio de resposta (minutos)
    "average_response_time_hours": 0.51,    // ✅ Tempo médio de resposta (horas)
    "average_resolution_time_minutes": 120.5, // ✅ Tempo médio de resolução (minutos)
    "average_resolution_time_hours": 2.01     // ✅ Tempo médio de resolução (horas)
  }
]

// tickets_by_agent_detailed
[
  {
    "user_id": 2,
    "user_name": "João Silva",
    "user_email": "joao@example.com",
    "user_role": "support",
    "tickets_received": 35,              // ✅ Tickets recebidos
    "tickets_responded": 32,             // ✅ Tickets respondidos
    "tickets_closed": 30,                // ✅ Tickets fechados
    "tickets_not_resolved": 5,           // ✅ Tickets não resolvidos
    "response_rate": 91.43,              // ✅ Taxa de resposta (%)
    "resolution_rate": 85.71             // ✅ Taxa de resolução (%)
  }
]
```

#### ✅ Dados disponíveis para gráficos:

- ✅ **Tickets atendidos por agente** → `tickets_assigned` ou `tickets_received`
- ✅ **Tempo médio de resposta por agente** → `average_response_time_hours` ou `average_response_time_minutes`
- ⚠️ **SLA violado por agente** → Não disponível diretamente (precisa calcular comparando com meta)
- ✅ **Taxa de resolução por agente** → `resolution_rate`

#### Exemplo de uso:

```javascript
import { getTicketsStats } from '@/services/statistics'

const data = await getTicketsStats('month')

// Gráfico de barras: Tickets atendidos por agente
const chartData = data.agent_productivity.map(agent => ({
  name: agent.user_name,
  tickets: agent.tickets_assigned
}))

// Gráfico de barras: Tempo médio de resposta
const responseTimeData = data.agent_productivity.map(agent => ({
  name: agent.user_name,
  hours: agent.average_response_time_hours
}))

// Gráfico de barras: Taxa de resolução
const resolutionRateData = data.agent_productivity.map(agent => ({
  name: agent.user_name,
  rate: agent.resolution_rate
}))
```

---

### 2. 🎯 Prioridade dos Tickets

**Disponível em:** `by_priority`

#### Estrutura dos dados:

```javascript
{
  "by_priority": {
    "baixa": {
      "total": 50,
      "percentage": 35.46
    },
    "media": {
      "total": 40,
      "percentage": 28.37
    },
    "alta": {
      "total": 30,
      "percentage": 21.28
    }
    // Nota: "critica" pode não estar disponível se não houver tickets com essa prioridade
  }
}
```

#### ✅ Dados disponíveis para gráficos:

- ✅ **Baixa** → `by_priority.baixa.total` e `by_priority.baixa.percentage`
- ✅ **Média** → `by_priority.media.total` e `by_priority.media.percentage`
- ✅ **Alta** → `by_priority.alta.total` e `by_priority.alta.percentage`
- ⚠️ **Crítica** → Não disponível (sistema atual só tem baixa, média, alta)

#### Exemplo de uso:

```javascript
import { getTicketsStats } from '@/services/statistics'

const data = await getTicketsStats('month')

// Gráfico de pizza: Prioridade dos Tickets
const priorityData = Object.entries(data.by_priority).map(([key, value]) => ({
  name: key === 'baixa' ? 'Baixa' : key === 'media' ? 'Média' : 'Alta',
  value: value.total,
  percentage: value.percentage
}))

// Gráfico de barras: Prioridade dos Tickets
const priorityBarData = [
  { name: 'Baixa', total: data.by_priority.baixa?.total || 0 },
  { name: 'Média', total: data.by_priority.media?.total || 0 },
  { name: 'Alta', total: data.by_priority.alta?.total || 0 }
]
```

---

### 3. 🏢 Tickets por Departamento

**Status:** ❌ **NÃO DISPONÍVEL**

O endpoint atual **não retorna** dados de departamentos. O sistema não possui campo de departamento nos tickets.

#### Opções para implementar:

1. **Adicionar campo `departamento` no backend** (tabela `tickets`)
2. **Usar campo `user.role` como proxy** (mas não é ideal, pois role não é departamento)
3. **Criar relacionamento** entre tickets e departamentos

#### Dados alternativos disponíveis:

- ✅ **Tickets por usuário** → `by_user` (mas não é departamento)
- ✅ **Tickets por cliente** → `by_cliente` (mas não é departamento)

---

## 📋 Resumo

| Gráfico | Dados Disponíveis | Status |
|---------|------------------|--------|
| **Tickets atendidos por agente** | ✅ `agent_productivity.tickets_assigned` | ✅ Disponível |
| **Tempo médio de resposta por agente** | ✅ `agent_productivity.average_response_time_hours` | ✅ Disponível |
| **SLA violado por agente** | ⚠️ Precisa calcular comparando com meta | ⚠️ Parcial |
| **Taxa de resolução por agente** | ✅ `agent_productivity.resolution_rate` | ✅ Disponível |
| **Prioridade dos Tickets (Baixa/Média/Alta)** | ✅ `by_priority` | ✅ Disponível |
| **Prioridade Crítica** | ❌ Não existe no sistema | ❌ Não disponível |
| **Tickets por Departamento** | ❌ Campo não existe | ❌ Não disponível |

---

## 🚀 Como Usar

### Exemplo completo:

```javascript
import { getTicketsStats } from '@/services/statistics'

// Buscar dados
const stats = await getTicketsStats('month')

// 1. Desempenho por Agente - Tickets Atendidos
const agentTicketsData = stats.agent_productivity.map(agent => ({
  name: agent.user_name,
  tickets: agent.tickets_assigned
}))

// 2. Desempenho por Agente - Tempo de Resposta
const agentResponseTimeData = stats.agent_productivity.map(agent => ({
  name: agent.user_name,
  hours: agent.average_response_time_hours
}))

// 3. Desempenho por Agente - Taxa de Resolução
const agentResolutionRateData = stats.agent_productivity.map(agent => ({
  name: agent.user_name,
  rate: agent.resolution_rate
}))

// 4. Prioridade dos Tickets
const priorityData = Object.entries(stats.by_priority || {}).map(([key, value]) => ({
  name: key === 'baixa' ? 'Baixa' : key === 'media' ? 'Média' : 'Alta',
  total: value.total,
  percentage: value.percentage
}))
```

---

## 📝 Notas Importantes

1. **SLA Violado**: Para calcular, você precisa:
   - Definir uma meta de tempo de resposta (ex: 2 horas)
   - Comparar `average_response_time_hours` com a meta
   - Contar quantos agentes violaram o SLA

2. **Prioridade Crítica**: O sistema atual só tem 3 níveis (baixa, média, alta). Se precisar de "crítica", será necessário adicionar no backend.

3. **Departamentos**: Não existe no sistema atual. Seria necessário adicionar esse campo no backend.

