# 🔧 Correção de Problemas de Hidratação

## 🐛 Problema: `bis_skin_checked` e Erros de Hidratação

### O que é o erro?

Erros de hidratação ocorrem quando o HTML renderizado no servidor (SSR) não corresponde ao HTML renderizado no cliente. Isso pode acontecer por:

1. **Extensões do navegador** que modificam o DOM (ex: `bis_skin_checked` de extensões de tema)
2. **Código que acessa `window` ou `document` durante o SSR**
3. **Conteúdo dinâmico** que muda entre servidor e cliente

### Sintomas

- Avisos no console: "Hydration failed" ou "Text content did not match"
- Atributos estranhos no HTML como `bis_skin_checked`
- Componentes não funcionando corretamente
- Erros relacionados a extensões do navegador

## ✅ Soluções Implementadas

### 1. Hook `useMounted`

Criamos um hook personalizado para garantir que componentes só renderizem conteúdo específico do cliente após a hidratação:

```javascript
import { useMounted } from "@/hooks/useMounted";

function MyComponent() {
  const mounted = useMounted();
  
  if (!mounted) {
    return <div>Carregando...</div>; // ou null
  }
  
  return <div>Conteúdo do cliente</div>;
}
```

### 2. `suppressHydrationWarning` no Layout

O layout principal já tem `suppressHydrationWarning` aplicado:

```jsx
<html lang="pt-BR" suppressHydrationWarning>
  <body suppressHydrationWarning>
    {children}
  </body>
</html>
```

### 3. Componente NotificationBell Melhorado

O componente `NotificationBell` agora:

- ✅ Usa `useMounted()` para garantir hidratação
- ✅ Retorna um placeholder até estar montado
- ✅ Usa `suppressHydrationWarning` em elementos dinâmicos
- ✅ Evita renderizar conteúdo dependente do cliente antes da hidratação

## 🔍 Como Identificar Problemas de Hidratação

### 1. Verificar o Console

Procure por avisos como:
```
Warning: Text content did not match. Server: "..." Client: "..."
Warning: Hydration failed because the initial UI does not match...
```

### 2. Verificar o HTML

Inspecione o HTML e procure por atributos estranhos:
```html
<div bis_skin_checked="true">...</div>
```

### 3. Testar em Modo Anônimo

1. Abra uma janela anônima (Ctrl+Shift+N)
2. Teste a aplicação
3. Se funcionar, o problema é de extensão do navegador

## 🛠️ Como Corrigir Novos Componentes

### Padrão Recomendado

```jsx
"use client";

import { useMounted } from "@/hooks/useMounted";

export function MyComponent() {
  const mounted = useMounted();
  
  // Conteúdo que depende do cliente
  if (!mounted) {
    return null; // ou um placeholder
  }
  
  return (
    <div suppressHydrationWarning>
      {/* Conteúdo dinâmico */}
    </div>
  );
}
```

### Quando Usar `suppressHydrationWarning`

Use apenas quando:
- ✅ O conteúdo é intencionalmente diferente entre servidor e cliente
- ✅ Extensões do navegador podem modificar o DOM
- ✅ Você tem certeza de que a diferença não causa problemas

**Não use** para:
- ❌ Erros de lógica que podem ser corrigidos
- ❌ Conteúdo que deveria ser igual no servidor e cliente
- ❌ Problemas de dados que podem ser resolvidos

## 📋 Checklist de Componentes

Componentes que já foram corrigidos:

- ✅ `NotificationBell` - Usa `useMounted()` e `suppressHydrationWarning`
- ✅ `RootLayout` - Tem `suppressHydrationWarning` no html e body
- ✅ `usePermissions` - Usa `isHydrated` para garantir hidratação

Componentes que podem precisar de correção:

- ⚠️ Componentes que acessam `window` ou `document` diretamente
- ⚠️ Componentes que renderizam conteúdo baseado em localStorage
- ⚠️ Componentes que usam `Date.now()` ou valores dinâmicos

## 🧪 Testando a Correção

### 1. Teste em Modo Anônimo

```bash
# Chrome/Edge
Ctrl+Shift+N

# Firefox
Ctrl+Shift+P
```

### 2. Verifique o Console

Não deve haver avisos de hidratação após as correções.

### 3. Teste com Extensões Desabilitadas

1. Desabilite todas as extensões
2. Teste a aplicação
3. Reative uma por uma para identificar a problemática

## 💡 Dicas Adicionais

### Para Desenvolvedores

1. **Sempre use `useMounted()`** quando o componente depende do cliente
2. **Evite acessar `window` ou `document`** durante o SSR
3. **Use `suppressHydrationWarning`** com cuidado e apenas quando necessário
4. **Teste em modo anônimo** regularmente

### Para Usuários

1. **Desabilite extensões** que modificam o DOM (temas, ad blockers agressivos)
2. **Use modo anônimo** se tiver problemas
3. **Reporte erros** se persistirem mesmo sem extensões

## 📚 Referências

- [Next.js Hydration Error](https://nextjs.org/docs/messages/react-hydration-error)
- [React suppressHydrationWarning](https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-warnings)

---

**Última atualização**: 2025-11-17

