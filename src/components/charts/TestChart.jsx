"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function TestChart() {
  const [mounted, setMounted] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setMounted(true)
    console.log("✅ TestChart montado")
  }, [])

  const testData = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 30 }
  ]

  if (!mounted) {
    return <div>Carregando teste...</div>
  }

  return (
    <div 
      style={{ width: '100%', height: '400px', border: '2px solid red' }}
      ref={(el) => {
        if (el) {
          const width = el.offsetWidth
          const height = el.offsetHeight
          if (width !== containerSize.width || height !== containerSize.height) {
            setContainerSize({ width, height })
            console.log("📐 TestChart container size:", { width, height })
          }
        }
      }}
    >
      <div style={{ padding: '10px', background: '#f0f0f0' }}>
        <p>Teste de Gráfico</p>
        <p>Container: {containerSize.width}x{containerSize.height}</p>
        <p>Dados: {JSON.stringify(testData)}</p>
      </div>
      {/* TESTE 1: Com ResponsiveContainer */}
      <div style={{ width: '100%', height: '300px', position: 'relative', background: '#f9f9f9', marginBottom: '20px' }}>
        <p style={{ padding: '5px', fontSize: '12px', background: '#e3f2fd' }}>TESTE 1: Com ResponsiveContainer</p>
        <ResponsiveContainer width="100%" height="calc(100% - 30px)">
          <BarChart data={testData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="name" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TESTE 2: Sem ResponsiveContainer (dimensões fixas) */}
      <div style={{ width: '100%', height: '300px', position: 'relative', background: '#fff3cd', border: '2px solid orange' }}>
        <p style={{ padding: '5px', fontSize: '12px', background: '#fff3cd' }}>TESTE 2: Sem ResponsiveContainer (dimensões fixas)</p>
        <BarChart width={containerSize.width || 500} height={250} data={testData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="name" stroke="#000" />
          <YAxis stroke="#000" />
          <Tooltip />
          <Bar dataKey="value" fill="#ff9800" />
        </BarChart>
      </div>
      <div style={{ padding: '10px', fontSize: '12px', background: '#fff3cd', border: '1px solid #ffc107', marginTop: '10px' }}>
        <p><strong>✅ Se você vê este texto, o componente está renderizando</strong></p>
        <p><strong>📊 Se você vê barras azuis acima, o Recharts está funcionando</strong></p>
        <p><strong>❌ Se você só vê um quadrado vazio/cinza acima, há problema com o Recharts</strong></p>
        <p>Container size: {containerSize.width}x{containerSize.height}</p>
        <p>Se o gráfico não aparecer, pode ser problema de CSS ou o Recharts não está renderizando o SVG</p>
      </div>
    </div>
  )
}

