"use client"

import { Component } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro ao renderizar gráfico:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Erro ao carregar gráfico
            </CardTitle>
            <CardDescription>Ocorreu um erro ao renderizar este gráfico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">Não foi possível exibir o gráfico.</p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {this.state.error.toString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

export default ChartErrorBoundary

