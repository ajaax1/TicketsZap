"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { getUsersAlphabetical } from "@/services/users"
import { getTicketById, updateTicket, deleteTicket } from "@/services/tickets"
import { toast } from "sonner"
import { TicketsHeader } from "@/components/tickets-header"

export default function EditarChamado() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params?.id

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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const denormalizePriorityFromApi = (value) => {
    if (!value) return ""
    const v = String(value).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    if (v.includes("alta")) return "alta"
    if (v.includes("media")) return "media"
    if (v.includes("baixa")) return "baixa"
    return v
  }

  useEffect(() => {
    async function loadUsersAndTicket() {
      try {
        const [usersData, ticketData] = await Promise.all([
          getUsersAlphabetical(),
          getTicketById(ticketId),
        ])
        setUsers(Array.isArray(usersData) ? usersData : [])

        if (ticketData) {
          setFormData({
            title: ticketData.title || "",
            nome_cliente: ticketData.nome_cliente || "",
            whatsapp_numero: ticketData.whatsapp_numero || "",
            descricao: ticketData.descricao || "",
            status: ticketData.status || "",
            priority: denormalizePriorityFromApi(ticketData.priority || ""),
            user_id: ticketData.user_id ? String(ticketData.user_id) : "",
          })
        }
        setServerError("")
      } catch (e) {
        toast.error("Não foi possível carregar o chamado")
        setServerError("Erro ao carregar dados do chamado")
      } finally {
        setLoading(false)
      }
    }
    if (ticketId) {
      loadUsersAndTicket()
    }
  }, [ticketId])

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
      await updateTicket(ticketId, payload)
      toast.success("Chamado atualizado com sucesso!")
      setServerError("")
      router.push("/")
    } catch (e) {
      const apiMessage = e?.response?.data?.message || e?.message || "Erro ao atualizar chamado"
      const apiErrors = e?.response?.data?.errors || null
      setServerError(apiMessage)
      if (apiErrors && typeof apiErrors === "object") {
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
        console.error("Erro ao atualizar chamado:", e?.response?.data || e)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.")) {
      return
    }
    
    try {
      setDeleting(true)
      await deleteTicket(ticketId)
      toast.success("Chamado excluído com sucesso!")
      router.push("/")
    } catch (e) {
      const apiMessage = e?.response?.data?.message || e?.message || "Erro ao excluir chamado"
      toast.error(apiMessage)
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.error("Erro ao excluir chamado:", e?.response?.data || e)
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TicketsHeader />
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Editar Chamado #{ticketId}</CardTitle>
            <CardDescription>Atualize os dados do ticket</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            ) : (
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

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete} 
                    disabled={deleting || submitting}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? "Excluindo..." : "Excluir Chamado"}
                  </Button>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Link href="/">
                      <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" />
                      {submitting ? "Salvando..." : "Atualizar Chamado"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


