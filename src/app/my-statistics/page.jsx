"use client"

/**
 * Página completa de Estatísticas Pessoais
 * Mostra gráficos e dados das rotas de estatísticas
 */

import { useState, useEffect } from "react"
import { getMyStats, getMyActivity } from "@/services/statistics"
import { MyStatsChart, MyStatsEnhancedCharts } from "@/components/charts"
import { MyActivity } from "@/components/my-activity"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Ticket, Activity, BarChart3 } from "lucide-react"
import useAuth from "@/hooks/useAuth"

export default function MyStatisticsPage() {
  useAuth() // Verifica autenticação
  
  const [period, setPeriod] = useState('month')
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [statsData, activityData] = await Promise.all([
          getMyStats(period),
          getMyActivity(period, 100)
        ])
        
        setStats(statsData)
        setActivity(activityData)
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err)
        setError("Erro ao carregar dados. Verifique sua conexão e tente novamente.")
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [period])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingSpinner text="Carregando suas estatísticas..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Erro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Minhas Estatísticas</h1>
            <p className="text-muted-foreground mt-1">
              Visualize seu desempenho e atividades no sistema
            </p>
          </div>
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

        {/* Tabs principais */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Atividades
            </TabsTrigger>
          </TabsList>

          {/* Aba de Estatísticas */}
          <TabsContent value="stats" className="space-y-6">
            {stats && (
              <>
                <MyStatsChart data={stats} />
                <MyStatsEnhancedCharts data={stats} />
              </>
            )}
          </TabsContent>

          {/* Aba de Atividades */}
          <TabsContent value="activity" className="space-y-6">
            {activity && <MyActivity period={period} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

