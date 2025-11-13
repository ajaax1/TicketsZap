"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { getUsersAlphabetical, getClientesAlphabetical } from "@/services/users"
import { getTicketById, updateTicket, deleteTicket } from "@/services/tickets"
import { toast } from "sonner"
import { TicketsHeader } from "@/components/tickets-header"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { TicketAttachments } from "@/components/ticket-attachments"
import useAuth from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"

export default function EditarChamado() {
  useAuth() // Verifica autenticação
  const { canAssignCliente, canEditTickets, canDeleteTickets } = usePermissions()
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
    cliente_id: "",
  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [users, setUsers] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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
        // Filtra apenas atendentes (não clientes) para user_id
        const atendentes = Array.isArray(usersData) 
          ? usersData.filter(u => u.role !== 'cliente')
          : []
        setUsers(atendentes)

        // Se admin/support, carrega clientes para cliente_id
        if (canAssignCliente) {
          try {
            const clientesData = await getClientesAlphabetical()
            setClientes(Array.isArray(clientesData) ? clientesData : [])
          } catch (e) {
            console.warn("Não foi possível carregar clientes:", e)
          }
        }

        if (ticketData) {
          setFormData({
            title: ticketData.title || "",
            nome_cliente: ticketData.nome_cliente || "",
            whatsapp_numero: ticketData.whatsapp_numero || "",
            descricao: ticketData.descricao || "",
            status: ticketData.status || "",
            priority: denormalizePriorityFromApi(ticketData.priority || ""),
            user_id: ticketData.user_id ? String(ticketData.user_id) : "",
            cliente_id: ticketData.cliente_id ? String(ticketData.cliente_id) : "",
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
  }, [ticketId, canAssignCliente])

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
      
      // Admin/Support podem alterar cliente_id
      if (canAssignCliente && formData.cliente_id) {
        payload.cliente_id = Number(formData.cliente_id)
      } else if (canAssignCliente && !formData.cliente_id) {
        // Se limpar o campo, envia null para remover o vínculo
        payload.cliente_id = null
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

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
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
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TicketsHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            <CardTitle className="text-2xl">Editar Chamado #{ticketId}</CardTitle>
            <CardDescription>
              {canEditTickets ? "Atualize os dados do chamado" : "Visualize os dados do chamado (somente leitura)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner text="Carregando dados do chamado..." size="small" />
            ) : !canEditTickets ? (
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Você não tem permissão para editar chamados. Esta página está em modo somente leitura.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={formData.title} disabled readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Cliente</Label>
                    <Input value={formData.nome_cliente} disabled readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input value={formData.whatsapp_numero || ""} disabled readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <div className="border rounded-md p-3 min-h-[100px] bg-muted/30" dangerouslySetInnerHTML={{ __html: formData.descricao || "" }} />
                  </div>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Input value={formData.status} disabled readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Input value={formData.priority} disabled readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Input value={users.find(u => String(u.id) === formData.user_id)?.name || ""} disabled readOnly />
                    </div>
                  </div>
                </div>
              </div>
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
                  <RichTextEditor id="descricao" placeholder="Descreva detalhadamente o problema ou solicitação" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} error={errors.descricao} rows={5} />
                  {errors.descricao && <p className="text-sm text-destructive">{errors.descricao}</p>}
                </div>

                <div className={`grid gap-6 ${canAssignCliente ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
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

                  {canAssignCliente && (
                    <div className="space-y-2">
                      <Label htmlFor="cliente_id">Cliente (Usuário)</Label>
                      <Select 
                        value={formData.cliente_id || "none"} 
                        onValueChange={(value) => setFormData({ ...formData, cliente_id: value === "none" ? "" : value })}
                      >
                        <SelectTrigger id="cliente_id">
                          <SelectValue placeholder="Selecione o cliente (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={String(cliente.id)}>{cliente.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">Opcional - Vincula o chamado a um usuário cliente</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  {canDeleteTickets && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={handleDeleteClick} 
                      disabled={deleting || submitting}
                      className="w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deleting ? "Excluindo..." : "Excluir Chamado"}
                    </Button>
                  )}
                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Link href="/">
                      <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent cursor-pointer">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed">
                      <Save className="mr-2 h-4 w-4" />
                      {submitting ? "Salvando..." : "Atualizar Chamado"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <TicketAttachments ticketId={ticketId} />
        </div>
      </div>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Excluir Chamado"
        description="Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={deleting}
      />
    </div>
  )
}


