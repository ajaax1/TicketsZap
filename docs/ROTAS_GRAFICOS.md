# 📊 Rotas dos Gráficos

## 🎯 Desempenho por Agente

### Rota
```
GET /api/admin/statistics/tickets?period={period}
```

### Parâmetros
- `period`: `day`, `week`, `month`, `year`, `all` (padrão: `month`)

### Dados Retornados
O endpoint retorna um objeto com várias propriedades, incluindo:

```json
{
  "agent_productivity": [
    {
      "user_id": 2,
      "user_name": "João Silva",
      "user_email": "joao@example.com",
      "user_role": "support",
      "tickets_assigned": 35,
      "tickets_closed": 30,
      "tickets_not_resolved": 5,
      "resolution_rate": 85.71,
      "average_response_time_minutes": 30.5,
      "average_response_time_hours": 0.51,
      "average_resolution_time_minutes": 120.5,
      "average_resolution_time_hours": 2.01
    },
    // ... mais agentes
  ]
}
```

### Uso no Frontend

```javascript
import { getTicketsStats } from '@/services/statistics'

// Buscar dados
const ticketsData = await getTicketsStats('month')

// Passar para o componente
<AgentPerformanceChart data={ticketsData.agent_productivity} />
```

### Campos Usados pelo Gráfico

1. **Tickets Atendidos por Agente**
   - Campo: `tickets_assigned` ou `tickets_received`
   - Exibido na aba "Tickets"

2. **Tempo Médio de Resposta**
   - Campo: `average_response_time_hours`
   - Exibido na aba "Tempo de Resposta"

3. **Taxa de Resolução**
   - Campo: `resolution_rate`
   - Exibido na aba "Taxa de Resolução"

4. **Tempo Médio de Resolução**
   - Campo: `average_resolution_time_hours`
   - Exibido na aba "Tempo de Resolução"

### Nota Importante
⚠️ **Se o gráfico está mostrando apenas 5 usuários**, verifique:
1. Se o backend está limitando os resultados (pode ter um `LIMIT 5` na query)
2. Se há algum filtro sendo aplicado antes de passar os dados para o componente

---

## 🎯 Prioridade dos Tickets

### Rota
```
GET /api/admin/statistics/tickets?period={period}
```

### Dados Retornados
```json
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
  }
}
```

### Uso no Frontend
```javascript
import { getTicketsStats } from '@/services/statistics'

const ticketsData = await getTicketsStats('month')

<PriorityChart data={ticketsData.by_priority} />
```

---

## 📝 Resumo das Rotas

| Gráfico | Rota | Campo de Dados |
|---------|------|----------------|
| **Desempenho por Agente** | `GET /api/admin/statistics/tickets` | `agent_productivity` |
| **Prioridade dos Tickets** | `GET /api/admin/statistics/tickets` | `by_priority` |
| **Top Performers** | `GET /api/admin/statistics/users` | `top_performers` |

---

## 🔍 Verificar Limites

Se os gráficos estão mostrando menos dados do que esperado:

1. **Verifique o console do navegador** - Os logs mostram os dados retornados:
   ```
   ✅ [API] Tickets retornado: { agent_productivity: [...] }
   ```

2. **Verifique o backend** - Pode haver um `LIMIT` na query SQL

3. **Verifique o componente** - Não deve haver `.slice()` limitando os dados

