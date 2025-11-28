"use client"

/**
 * Componente de Diagnóstico para Gráficos
 * 
 * Use este componente para testar se o Recharts está funcionando
 * e identificar problemas comuns.
 */

import { useEffect, useState } from "react"
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

const testData = [
  { name: "Jan", value: 40 },
  { name: "Fev", value: 55 },
  { name: "Mar", value: 80 },
  { name: "Abr", value: 65 },
]

export function ChartDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    rechartsInstalled: false,
    containerHeight: 0,
    dataValid: false,
    errors: []
  })

  useEffect(() => {
    const checks = {
      rechartsInstalled: typeof window !== 'undefined' && typeof BarChart !== 'undefined',
      containerHeight: 0,
      dataValid: Array.isArray(testData) && testData.length > 0,
      errors: []
    }

    // Verificar altura do container após renderização
    setTimeout(() => {
      const container = document.querySelector('[data-diagnostic-container]')
      if (container) {
        checks.containerHeight = container.offsetHeight
        if (checks.containerHeight === 0) {
          checks.errors.push('Container tem altura 0')
        }
      }
    }, 100)

    // Verificar se há erros no console
    const originalError = console.error
    const errors = []
    console.error = (...args) => {
      errors.push(args.join(' '))
      originalError(...args)
    }

    setTimeout(() => {
      console.error = originalError
      checks.errors = errors
      setDiagnostics(checks)
    }, 500)

  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Diagnóstico de Gráficos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={diagnostics.rechartsInstalled ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.rechartsInstalled ? '✅' : '❌'}
              </span>
              <span>Recharts instalado: {diagnostics.rechartsInstalled ? 'Sim' : 'Não'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={diagnostics.dataValid ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.dataValid ? '✅' : '❌'}
              </span>
              <span>Dados válidos: {diagnostics.dataValid ? 'Sim' : 'Não'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={diagnostics.containerHeight > 0 ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.containerHeight > 0 ? '✅' : '❌'}
              </span>
              <span>Altura do container: {diagnostics.containerHeight}px</span>
            </div>
            {diagnostics.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="font-semibold text-red-800 dark:text-red-300">Erros encontrados:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {diagnostics.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-400">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <div data-diagnostic-container style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={testData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Se você vê barras azuis acima, o Recharts está funcionando corretamente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

