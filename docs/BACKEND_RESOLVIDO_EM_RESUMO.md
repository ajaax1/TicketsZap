# 📋 Campo `resolvido_em` - Resumo Rápido

## 🎯 O que é?

Campo **opcional** que define manualmente a data/hora de resolução de um ticket.

---

## 📤 Formato Enviado pelo Frontend

```json
{
  "resolvido_em": "2025-11-20T14:30:00"  // ISO 8601 sem timezone
}
```

- **Tipo**: `string` (datetime)
- **Formato**: `"YYYY-MM-DDTHH:mm:ss"` ou `"YYYY-MM-DDTHH:mm"`
- **Opcional**: Pode ser `null` ou não enviado

---

## ✅ Validações

1. ✅ Data válida (formato ISO 8601)
2. ✅ **Não pode ser anterior a `created_at`**
3. ✅ Campo opcional (pode ser `null`)

---

## 🧮 Cálculo de Tempo

**Prioridade:**
1. Se `resolvido_em` preenchido → `resolvido_em - created_at` (maior prioridade)
2. Se `tempo_resolucao` preenchido → usa valor em minutos
3. Se nenhum preenchido → `updated_at - created_at` (automático)

---

## 📥 Resposta da API

```json
{
  "id": 123,
  "resolvido_em": "2025-11-20T14:30:00.000000Z",  // ou null
  "created_at": "2025-11-20T10:00:00.000000Z"
}
```

---

## 🔄 Exemplos

### Criar com resolvido_em:
```json
POST /api/tickets
{
  "title": "Ticket",
  "status": "resolvido",
  "resolvido_em": "2025-11-20T15:30:00"
}
```

### Atualizar para definir resolvido_em:
```json
PUT /api/tickets/123
{
  "status": "resolvido",
  "resolvido_em": "2025-11-20T18:45:00"
}
```

### Remover resolvido_em:
```json
PUT /api/tickets/123
{
  "resolvido_em": null
}
```

---

## ⚠️ Importante

- Frontend envia: `"2025-11-20T14:30:00"` (sem timezone)
- Validar: `resolvido_em >= created_at`
- Opcional: não é obrigatório enviar

---

**Ver documentação completa**: `BACKEND_RESOLVIDO_EM.md`

