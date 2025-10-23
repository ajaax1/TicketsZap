"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { createUser } from "@/services/users"
import { toast } from "sonner"
import { TicketsHeader } from "@/components/tickets-header"
import useAuth from "@/hooks/useAuth"

export default function NovoUsuario() {
  useAuth() // Verifica autenticação
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: ""
  })
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }
    
    if (!formData.email.trim()) {
      toast.error("Email é obrigatório")
      return
    }
    
    if (!formData.password.trim()) {
      toast.error("Senha é obrigatória")
      return
    }
    
    if (formData.password !== formData.password_confirmation) {
      toast.error("As senhas não coincidem")
      return
    }
    
    if (!formData.role) {
      toast.error("Função é obrigatória")
      return
    }

    setSubmitting(true)
    
    try {
      await createUser(formData)
      toast.success("Usuário criado com sucesso!")
      window.location.href = "/users"
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      toast.error(error?.response?.data?.message || "Erro ao criar usuário")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TicketsHeader />
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="mb-6">
          <Link href="/users">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Usuários
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Usuário</CardTitle>
            <CardDescription>Preencha os dados abaixo para criar um novo usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Digite o nome completo"
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Digite o email"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Digite a senha"
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirmar Senha *</Label>
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="Confirme a senha"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Função *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="support">Suporte</SelectItem>
                    <SelectItem value="assistant">Assistente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent cursor-pointer" asChild>
                  <Link href="/users">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed">
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
