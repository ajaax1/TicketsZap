"use client"

/**
 * Componente de teste simples para verificar se o Recharts está funcionando
 */

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

export function TestSimpleChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Gráfico</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: '300px' }}>
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
      </CardContent>
    </Card>
  )
}

