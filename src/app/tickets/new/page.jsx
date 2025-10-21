"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { getUsersAlphabetical } from "@/services/users"
import { createTicket } from "@/services/tickets"
import { toast } from "sonner"
import { TicketsHeader } from "@/components/tickets-header"

export default function NovoChamado() {
  const [formData, setFormData] = useState({
    title: "",
    nome_cliente: "",
    whatsapp_numero: "",
    descricao: "",
    status: "",
    priority: "",
    user_id: "",
  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [users, setUsers] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsersAlphabetical()
        setUsers(Array.isArray(data) ? data : [])
      } catch (e) {
        toast.error("Não foi possível carregar usuários")
      }
    }
    loadUsers()
  }, [])

  const formatWhatsApp = (value) => {
    const numbers = value.replace(/\D/g, "")
    const limited = numbers.slice(0, 20)
    if (limited.length <= 2) return limited
    if (limited.length <= 7) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
  }

  const handleWhatsAppChange = (e) => {
    const formatted = formatWhatsApp(e.target.value)
    setFormData({ ...formData, whatsapp_numero: formatted })
  }

  const normalizePriority = (value) => {
    if (!value) return ""
    const v = String(value).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    if (v.includes("alta")) return "alta"
    if (v.includes("media")) return "média"
    if (v.includes("baixa")) return "baixa"
    return v
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = "Título é obrigatório"
    if (!formData.nome_cliente.trim()) newErrors.nome_cliente = "Nome do cliente é obrigatório"
    if (!formData.descricao.trim()) newErrors.descricao = "Descrição é obrigatória"
    if (!formData.status) newErrors.status = "Status é obrigatório"
    if (!formData.priority) newErrors.priority = "Prioridade é obrigatória"
    if (!formData.user_id) newErrors.user_id = "Responsável é obrigatório"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    try {
      setSubmitting(true)
      const payload = {
        title: formData.title,
        nome_cliente: formData.nome_cliente,
        whatsapp_numero: formData.whatsapp_numero || null,
        descricao: formData.descricao,
        status: formData.status,
        priority: normalizePriority(formData.priority),
        user_id: Number(formData.user_id),
      }
      await createTicket(payload)
      toast.success("Chamado criado com sucesso!")
      setServerError("")
      setFormData({
        title: "",
        nome_cliente: "",
        whatsapp_numero: "",
        descricao: "",
        status: "",
        priority: "",
        user_id: "",
      })
      setErrors({})
    } catch (e) {
      const apiMessage = e?.response?.data?.message || e?.message || "Erro ao criar chamado"
      const apiErrors = e?.response?.data?.errors || null
      setServerError(apiMessage)
      if (apiErrors && typeof apiErrors === "object") {
        // Mapeia possíveis erros de validação do Laravel
        const mapped = {}
        Object.keys(apiErrors).forEach((key) => {
          const first = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : String(apiErrors[key])
          mapped[key] = first
        })
        setErrors((prev) => ({ ...prev, ...mapped }))
      }
      toast.error(apiMessage)
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.error("Erro ao criar chamado:", e?.response?.data || e)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TicketsHeader />
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Novo Chamado</CardTitle>
            <CardDescription>Preencha os dados abaixo para criar um novo chamado de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {serverError && (
                <div className="text-sm text-destructive">{serverError}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
                <Input id="title" placeholder="Digite o título do chamado" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={errors.title ? "border-destructive" : ""} />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome_cliente">Nome do Cliente <span className="text-destructive">*</span></Label>
                <Input id="nome_cliente" placeholder="Digite o nome do cliente" value={formData.nome_cliente} onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })} className={errors.nome_cliente ? "border-destructive" : ""} />
                {errors.nome_cliente && <p className="text-sm text-destructive">{errors.nome_cliente}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_numero">WhatsApp</Label>
                <Input id="whatsapp_numero" placeholder="(00) 00000-0000" value={formData.whatsapp_numero} onChange={handleWhatsAppChange} maxLength={20} />
                <p className="text-sm text-muted-foreground">Campo opcional - Máximo 20 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição <span className="text-destructive">*</span></Label>
                <Textarea id="descricao" placeholder="Descreva detalhadamente o problema ou solicitação" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className={errors.descricao ? "border-destructive" : ""} rows={5} />
                {errors.descricao && <p className="text-sm text-destructive">{errors.descricao}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger id="status" className={errors.status ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="resolvido">Resolvido</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade <span className="text-destructive">*</span></Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger id="priority" className={errors.priority ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável <span className="text-destructive">*</span></Label>
                  <Select value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
                    <SelectTrigger id="responsavel" className={errors.user_id ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.user_id && <p className="text-sm text-destructive">{errors.user_id}</p>}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link href="/">
                  <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent cursor-pointer">Cancelar</Button>
                </Link>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed">
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? "Salvando..." : "Criar Chamado"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


