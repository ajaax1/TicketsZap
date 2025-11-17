# 🔴 Entendendo o Erro 500 (Internal Server Error)

## O que é um Erro 500?

**Erro 500** significa **"Erro Interno do Servidor"** (Internal Server Error). É um código de status HTTP que indica que:

- ✅ A requisição chegou ao servidor corretamente
- ✅ O servidor recebeu e processou a requisição
- ❌ **MAS** algo deu errado no servidor ao processar a requisição

## 📊 Comparação com Outros Erros HTTP

| Código | Significado | Onde está o problema |
|--------|-------------|---------------------|
| **200** | Sucesso | ✅ Tudo funcionou |
| **400** | Requisição inválida | ❌ Frontend (dados enviados incorretos) |
| **401** | Não autenticado | ❌ Frontend (token inválido/expirado) |
| **403** | Acesso negado | ❌ Frontend (sem permissão) |
| **404** | Não encontrado | ❌ Frontend (rota/URL incorreta) |
| **422** | Validação falhou | ❌ Frontend (dados inválidos) |
| **500** | Erro interno | ❌ **Backend (problema no servidor)** |
| **503** | Serviço indisponível | ❌ Backend (servidor sobrecarregado) |

## 🔍 O que Causa um Erro 500?

O erro 500 geralmente acontece por:

1. **Erro no código do backend** (Laravel/PHP)
   - Exceção não tratada
   - Erro de sintaxe
   - Problema com banco de dados

2. **Problemas com o banco de dados**
   - Tabela não existe
   - Coluna não existe
   - Constraint violada
   - Conexão perdida

3. **Problemas de configuração**
   - Variável de ambiente faltando
   - Permissões de arquivo incorretas
   - Serviço externo indisponível

4. **Problemas de memória/recursos**
   - Servidor sem memória
   - Timeout de execução

## 🔎 Como Investigar um Erro 500?

### 1. Verificar o Console do Navegador

O código já está configurado para mostrar detalhes no console. Procure por:

```
🚨 Erro na Requisição API
Status: 500
URL: /api/tickets/...
Método: POST
Resposta do servidor: {...}
```

### 2. Verificar a Aba Network (Rede)

1. Abra o **DevTools** (F12)
2. Vá na aba **Network** (Rede)
3. Encontre a requisição que falhou (status 500 em vermelho)
4. Clique nela e veja:
   - **Headers**: URL, método, headers enviados
   - **Payload**: Dados enviados
   - **Response**: Resposta do servidor (pode ter detalhes do erro)

### 3. Verificar os Logs do Laravel

O erro real geralmente está nos logs do Laravel:

```bash
# No terminal do servidor Laravel
tail -f storage/logs/laravel.log
```

Ou verifique o arquivo:
```
storage/logs/laravel.log
```

### 4. Verificar o Response da API

O Laravel geralmente retorna detalhes do erro no response:

```json
{
  "message": "SQLSTATE[42S02]: Base table or view not found: 1146 Table 'database.ticket_messages' doesn't exist",
  "file": "/path/to/file.php",
  "line": 123
}
```

## 🛠️ Exemplos Comuns de Erro 500

### Exemplo 1: Tabela não existe
```json
{
  "message": "Base table or view not found: 1146 Table 'database.ticket_messages' doesn't exist"
}
```
**Solução**: Executar migrations: `php artisan migrate`

### Exemplo 2: Coluna não existe
```json
{
  "message": "SQLSTATE[42S22]: Column not found: 1054 Unknown column 'cliente_id' in 'field list'"
}
```
**Solução**: Executar migrations ou adicionar a coluna

### Exemplo 3: Erro de código PHP
```json
{
  "message": "Call to undefined method App\\Models\\Ticket::messagesInternal()",
  "file": "/app/Http/Controllers/TicketController.php",
  "line": 45
}
```
**Solução**: Corrigir o código no backend

## 📝 O que Fazer Quando Ver um Erro 500?

### Para Desenvolvedores:

1. **Verifique o console do navegador** - Veja os detalhes do erro
2. **Verifique a aba Network** - Veja a resposta completa do servidor
3. **Verifique os logs do Laravel** - Veja o erro completo no backend
4. **Verifique se as migrations foram executadas** - `php artisan migrate`
5. **Verifique se o servidor está rodando** - `php artisan serve`

### Para Usuários:

1. **Tente novamente** - Pode ser um erro temporário
2. **Verifique sua conexão** - Certifique-se de que está online
3. **Limpe o cache do navegador** - Ctrl+Shift+Delete
4. **Faça logout e login novamente**
5. **Entre em contato com o suporte** se o problema persistir

## 🔧 Como o Frontend Trata o Erro 500?

O código já está configurado para:

1. ✅ **Logar detalhes no console** (em desenvolvimento)
2. ✅ **Mostrar mensagem amigável** ao usuário
3. ✅ **Preservar informações** para debug

### Exemplo de uso:

```javascript
try {
  await api.post('/tickets', data);
} catch (error) {
  // O interceptor já adicionou error.userMessage
  toast.error(error.userMessage || 'Erro ao criar chamado');
  
  // Detalhes completos no console (desenvolvimento)
  console.error('Erro completo:', error);
}
```

## 📍 Onde Verificar Agora?

1. **Console do navegador** (F12 → Console)
   - Procure por "🚨 Erro na Requisição API"
   - Veja a URL e método da requisição

2. **Aba Network** (F12 → Network)
   - Encontre a requisição com status 500
   - Veja a resposta do servidor

3. **Logs do Laravel**
   - `storage/logs/laravel.log`
   - Ou no terminal: `tail -f storage/logs/laravel.log`

## 💡 Dica

O erro 500 **NÃO é um problema do frontend**. É um problema no **backend (servidor Laravel)**. 

O frontend apenas **recebe e exibe** o erro. Para resolver, você precisa:
- Verificar os logs do Laravel
- Corrigir o código do backend
- Executar migrations se necessário
- Verificar configurações do servidor

---

**Última atualização**: 2025-11-17

