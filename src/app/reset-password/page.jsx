"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"
import { verifyResetToken, resetPassword } from "@/services/password"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/loading-spinner"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: ""
  })
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token && email) {
      verifyToken()
    } else {
      setError("Token ou email não encontrado na URL")
      setTokenValid(false)
    }
  }, [token, email])

  const verifyToken = async () => {
    try {
      setLoading(true)
      await verifyResetToken(token, email)
      setTokenValid(true)
      setError("")
    } catch (error) {
      console.error("Erro ao verificar token:", error)
      setError(error?.response?.data?.message || "Token inválido ou expirado")
      setTokenValid(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.password.trim()) {
      toast.error("Senha é obrigatória")
      return
    }
    
    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres")
      return
    }
    
    if (formData.password !== formData.password_confirmation) {
      toast.error("As senhas não coincidem")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      await resetPassword({
        token,
        email,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      })
      
      setSuccess(true)
      toast.success("Senha alterada com sucesso!")
      
      // Redireciona para login após 3 segundos
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      const errorMessage = error?.response?.data?.message || "Erro ao alterar senha"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Loading state - verificando token
  if (loading && tokenValid === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner text="Verificando token..." />
        </div>
      </div>
    )
  }

  // Token inválido
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  Token Inválido
                </h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button 
                  onClick={() => router.push("/forgot-password")}
                  className="w-full cursor-pointer"
                >
                  Solicitar Novo Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  Senha Alterada!
                </h1>
                <p className="text-muted-foreground mb-6">
                  Sua senha foi alterada com sucesso. Você será redirecionado para o login.
                </p>
                <LoadingSpinner text="Redirecionando..." size="small" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Formulário de reset
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Redefinir Senha
              </h1>
              <p className="text-muted-foreground mt-2">
                Digite sua nova senha para {email}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Digite sua nova senha"
                    disabled={loading}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Ocultar senha" : "Mostrar senha"}
                    </span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirmar Nova Senha *</Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showPasswordConfirmation ? "text" : "password"}
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="Confirme sua nova senha"
                    disabled={loading}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    disabled={loading}
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPasswordConfirmation ? "Ocultar senha" : "Mostrar senha"}
                    </span>
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Lembrou da senha?{" "}
                <Button
                  variant="link"
                  onClick={() => router.push("/login")}
                  className="p-0 h-auto cursor-pointer"
                >
                  Fazer Login
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner text="Carregando..." />
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
