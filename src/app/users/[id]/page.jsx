"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { getUserById, updateUser, deleteUser } from "@/services/users"
import { toast } from "sonner"
import { TicketsHeader } from "@/components/tickets-header"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import useAuth from "@/hooks/useAuth"

export default function EditarUsuario() {
  useAuth() // Verifica autenticação
  const params = useParams()
  const router = useRouter()
  const userId = params?.id

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (userId) {
      loadUser()
    }
  }, [userId])

  const loadUser = async () => {
    try {
      setLoading(true)
      const user = await getUserById(userId)
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        password_confirmation: "",
        role: user.role || ""
      })
    } catch (error) {
      console.error("Erro ao carregar usuário:", error)
      toast.error("Erro ao carregar dados do usuário")
      router.push("/users")
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
    
    if (formData.password && formData.password !== formData.password_confirmation) {
      toast.error("As senhas não coincidem")
      return
    }
    
    if (!formData.role) {
      toast.error("Função é obrigatória")
      return
    }

    setSubmitting(true)
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }
      
      // Só inclui senha se foi preenchida
      if (formData.password.trim()) {
        updateData.password = formData.password
        updateData.password_confirmation = formData.password_confirmation
      }
      
      await updateUser(userId, updateData)
      toast.success("Usuário atualizado com sucesso!")
      router.push("/users")
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      toast.error(error?.response?.data?.message || "Erro ao atualizar usuário")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await deleteUser(userId)
      toast.success("Usuário excluído com sucesso!")
      router.push("/users")
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      toast.error(error?.response?.data?.message || "Erro ao excluir usuário")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TicketsHeader />
        <div className="mx-auto max-w-3xl p-4 md:p-8">
          <LoadingSpinner text="Carregando dados do usuário..." />
        </div>
      </div>
    )
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
            <CardTitle>Editar Usuário</CardTitle>
            <CardDescription>Atualize os dados do usuário</CardDescription>
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
                  <Label htmlFor="password">Nova Senha (opcional)</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Deixe em branco para manter a senha atual"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirmar Nova Senha</Label>
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="Confirme a nova senha"
                    disabled={submitting}
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
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteClick}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Usuário
                </Button>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed">
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Excluir Usuário"
          description={`Tem certeza que deseja excluir o usuário "${formData.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          isLoading={deleting}
        />
      </div>
    </div>
  )
}
