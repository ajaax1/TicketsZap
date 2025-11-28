# 🔍 Diagnóstico: Por que o Gráfico Não Aparece?

## ✅ Checklist de Problemas Comuns

### 1. ❌ ResponsiveContainer sem container pai com altura definida

**Problema:** O `ResponsiveContainer` precisa de um container pai com altura definida para funcionar.

**❌ ERRADO:**
```jsx
<CardContent>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>  {/* Não vai aparecer */}
  </ResponsiveContainer>
</CardContent>
```

**✅ CORRETO:**
```jsx
<CardContent>
  <div style={{ width: '100%', height: '300px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>  {/* Vai aparecer */}
    </ResponsiveContainer>
  </div>
</CardContent>
```

**Como verificar:**
- Abra o DevTools (F12)
- Inspecione o elemento do gráfico
- Veja se o `ResponsiveContainer` tem altura 0 ou não definida

---

### 2. ❌ Dados vazios ou formato incorreto

**Problema:** Se os dados estão vazios ou no formato errado, o gráfico não renderiza.

**❌ ERRADO:**
```jsx
const data = []  // Array vazio
const data = null  // null
const data = undefined  // undefined
const data = {}  // Objeto vazio (quando espera array)
```

**✅ CORRETO:**
```jsx
const data = [
  { name: "Jan", value: 40 },
  { name: "Fev", value: 55 }
]
```

**Como verificar:**
- Adicione `console.log('Dados:', data)` antes de passar para o gráfico
- Verifique se é um array
- Verifique se tem pelo menos um item
- Verifique se os campos `dataKey` e `labelKey` existem nos objetos

**Exemplo de debug:**
```jsx
export function MeuGrafico({ data = [] }) {
  console.log('📊 Dados recebidos:', {
    data,
    isArray: Array.isArray(data),
    length: data?.length || 0,
    firstItem: data?.[0],
    hasDataKey: data?.[0]?.value !== undefined
  })
  
  // ... resto do código
}
```

---

### 3. ❌ dataKey ou labelKey incorretos

**Problema:** Se o `dataKey` ou `labelKey` não correspondem aos campos do objeto, o gráfico não mostra nada.

**❌ ERRADO:**
```jsx
const data = [
  { name: "Jan", value: 40 }
]

<BarChart 
  data={data}
  dataKey="valor"  // ❌ Não existe "valor", deveria ser "value"
  labelKey="nome"  // ❌ Não existe "nome", deveria ser "name"
/>
```

**✅ CORRETO:**
```jsx
const data = [
  { name: "Jan", value: 40 }
]

<BarChart 
  data={data}
  dataKey="value"  // ✅ Campo existe
  labelKey="name"  // ✅ Campo existe
/>
```

**Como verificar:**
- Inspecione o primeiro item do array: `console.log(data[0])`
- Veja quais campos existem
- Certifique-se que `dataKey` e `labelKey` correspondem

---

### 4. ❌ Falta "use client" no topo

**Problema:** Recharts não funciona no servidor (SSR). Precisa de `"use client"`.

**❌ ERRADO:**
```jsx
import { BarChart } from "recharts"  // Vai quebrar no SSR

export function MeuGrafico() {
  // ...
}
```

**✅ CORRETO:**
```jsx
"use client"  // ← SEMPRE no topo

import { BarChart } from "recharts"

export function MeuGrafico() {
  // ...
}
```

**Como verificar:**
- Veja se tem `"use client"` na primeira linha do arquivo
- Se não tiver, adicione

---

### 5. ❌ Altura muito pequena ou zero

**Problema:** Se a altura for muito pequena (menor que 50px), o gráfico pode não aparecer.

**❌ ERRADO:**
```jsx
<div style={{ height: '10px' }}>  {/* Muito pequeno */}
<div style={{ height: '0px' }}>   {/* Zero */}
```

**✅ CORRETO:**
```jsx
<div style={{ height: '300px' }}>  {/* Altura adequada */}
<div style={{ height: '400px' }}>  {/* Melhor ainda */}
```

**Como verificar:**
- Inspecione o elemento no DevTools
- Veja a altura calculada do container
- Deve ser pelo menos 200px para gráficos pequenos, 300-400px para gráficos normais

---

### 6. ❌ CSS escondendo o gráfico

**Problema:** CSS pode estar escondendo o gráfico (display: none, visibility: hidden, opacity: 0).

**Como verificar:**
- Abra o DevTools
- Inspecione o elemento do gráfico
- Veja no painel de estilos se há:
  - `display: none`
  - `visibility: hidden`
  - `opacity: 0`
  - `height: 0`
  - `overflow: hidden` (pode cortar o gráfico)

---

### 7. ❌ Erro no console do navegador

**Problema:** Pode haver erros JavaScript que impedem a renderização.

**Como verificar:**
- Abra o DevTools (F12)
- Vá na aba "Console"
- Procure por erros em vermelho
- Erros comuns:
  - `Cannot read property 'map' of undefined`
  - `dataKey is required`
  - `ResponsiveContainer must have a valid width and height`

**Exemplo de erro comum:**
```
Error: dataKey is required
```
**Solução:** Certifique-se de passar `dataKey` como prop

---

### 8. ❌ Recharts não instalado ou versão incompatível

**Problema:** O pacote `recharts` pode não estar instalado ou ter versão incompatível.

**Como verificar:**
```bash
# Verifique se está instalado
npm list recharts

# Ou no package.json
cat package.json | grep recharts
```

**Solução:**
```bash
npm install recharts
# ou
yarn add recharts
```

---

### 9. ❌ Valores zero ou negativos

**Problema:** Se todos os valores forem zero, alguns gráficos podem não aparecer.

**❌ PROBLEMA:**
```jsx
const data = [
  { name: "Jan", value: 0 },
  { name: "Fev", value: 0 }
]
```

**✅ CORRETO:**
```jsx
const data = [
  { name: "Jan", value: 40 },
  { name: "Fev", value: 55 }
]
```

**Como verificar:**
- Verifique se pelo menos um valor é maior que zero
- Adicione validação no componente

---

### 10. ❌ Múltiplos gráficos com mesmo ID de gradiente

**Problema:** Se você tem múltiplos `AreaChart` na mesma página, podem usar o mesmo ID de gradiente.

**❌ PROBLEMA:**
```jsx
// Gráfico 1
<AreaChart data={data1} />  // Usa id="colorValue"

// Gráfico 2
<AreaChart data={data2} />  // Também usa id="colorValue" - CONFLITO!
```

**✅ CORRETO:**
```jsx
// Cada gráfico deve ter ID único
const gradientId = `area-gradient-${Math.random().toString(36).substr(2, 9)}`
```

**Como verificar:**
- Veja se há múltiplos `<defs><linearGradient id="...">` com mesmo ID
- Cada gradiente deve ter ID único

---

## 🔧 Script de Diagnóstico Completo

Adicione este código temporariamente no seu componente para diagnosticar:

```jsx
"use client"

import { useEffect } from "react"
import { BarChart } from "@/components/charts"

export function MeuGrafico({ data = [] }) {
  useEffect(() => {
    console.log('🔍 DIAGNÓSTICO DO GRÁFICO:')
    console.log('1. Dados:', {
      data,
      isArray: Array.isArray(data),
      length: data?.length || 0,
      isEmpty: !data || data.length === 0
    })
    
    if (data && data.length > 0) {
      console.log('2. Primeiro item:', data[0])
      console.log('3. Campos disponíveis:', Object.keys(data[0]))
      console.log('4. Valores:', data.map(item => ({
        name: item.name || item.label,
        value: item.value
      })))
    }
    
    console.log('5. Recharts instalado:', typeof window !== 'undefined' && window.Recharts)
  }, [data])

  // Verificar altura do container
  useEffect(() => {
    const checkHeight = () => {
      const container = document.querySelector('[data-chart-container]')
      if (container) {
        const height = container.offsetHeight
        console.log('6. Altura do container:', height, 'px')
        if (height === 0) {
          console.error('❌ PROBLEMA: Container tem altura 0!')
        }
      }
    }
    
    checkHeight()
    setTimeout(checkHeight, 100) // Verifica novamente após renderização
  }, [])

  return (
    <div data-chart-container>
      <BarChart 
        data={data}
        title="Teste"
        dataKey="value"
        labelKey="name"
      />
    </div>
  )
}
```

---

## 📋 Checklist Rápido

Antes de reportar que o gráfico não aparece, verifique:

- [ ] Tem `"use client"` no topo do arquivo?
- [ ] O `ResponsiveContainer` está dentro de um `div` com altura definida?
- [ ] Os dados são um array válido (não null, não undefined)?
- [ ] O array tem pelo menos um item?
- [ ] Os campos `dataKey` e `labelKey` existem nos objetos?
- [ ] Pelo menos um valor é maior que zero?
- [ ] A altura do container é pelo menos 200px?
- [ ] Não há erros no console do navegador?
- [ ] O `recharts` está instalado?
- [ ] Não há CSS escondendo o elemento?

---

## 🎯 Exemplo de Componente Funcionando

```jsx
"use client"

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

const data = [
  { name: "Jan", value: 40 },
  { name: "Fev", value: 55 },
  { name: "Mar", value: 80 }
]

export function GraficoTeste() {
  // ✅ 1. Tem "use client"
  // ✅ 2. Dados são array válido
  // ✅ 3. Campos existem (name, value)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste</CardTitle>
      </CardHeader>
      <CardContent>
        {/* ✅ 4. Container com altura definida */}
        <div style={{ width: '100%', height: '300px' }}>
          {/* ✅ 5. ResponsiveContainer com width e height */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />  {/* ✅ 6. dataKey correto */}
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />  {/* ✅ 7. dataKey correto */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🚨 Se Nada Funcionar

1. **Teste com dados estáticos primeiro:**
```jsx
const testData = [
  { name: "A", value: 10 },
  { name: "B", value: 20 }
]
```

2. **Use o componente de teste:**
```jsx
import { TestSimpleChart } from '@/components/charts/TestSimpleChart'
<TestSimpleChart />
```

3. **Verifique se o Recharts está renderizando:**
   - Abra o DevTools
   - Procure por elementos `<svg>` dentro do container
   - Se não houver SVG, o Recharts não está renderizando

4. **Verifique a versão do React:**
   - Recharts requer React 16.8+
   - Verifique: `npm list react`

5. **Limpe o cache e reinstale:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📞 Próximos Passos

Se após verificar tudo isso o gráfico ainda não aparecer:

1. Abra o DevTools (F12)
2. Vá na aba "Console" e copie TODOS os erros
3. Vá na aba "Elements" e inspecione o container do gráfico
4. Tire um screenshot do elemento inspecionado
5. Compartilhe essas informações para diagnóstico mais detalhado

