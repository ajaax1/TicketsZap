"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2, MessageSquare, ChevronDown, Clock, Calendar as CalendarIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  validateResolvidoEm,
  formatarTempoCurto,
  converterDatetimeLocalParaAPI,
  converterAPIParaDatetimeLocal,
  formatarDataHora
} from "@/utils/timeHelpers"
import { getUsersAlphabetical, getClientesAlphabetical } from "@/services/users"
import { getTicketById, updateTicket, deleteTicket } from "@/services/tickets"
import { toast } from "sonner"
import { TicketsHeader } from "@/components/tickets-header"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { TicketAttachments } from "@/components/ticket-attachments"
import { TicketMessages } from "@/components/ticket-messages"
import useAuth from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"

export default function EditarChamado() {
  useAuth() // Verifica autenticação
  const { canAssignCliente, canEditTickets, canDeleteTickets, isCliente } = usePermissions()
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
    prazo_resolucao: "",
    origem: "",
  })
  const [showTempoResolucao, setShowTempoResolucao] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [ticketData, setTicketData] = useState(null)

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [users, setUsers] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const messagesSectionRef = useRef(null)

  const denormalizePriorityFromApi = (value) => {
    if (!value) return ""
    const v = String(value).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    if (v.includes("alta")) return "alta"
    if (v.includes("media")) return "media"
    if (v.includes("baixa")) return "baixa"
    return v
  }

  // Dispara evento quando o ticket é visualizado (para limpar notificação na lista)
  useEffect(() => {
    if (ticketId && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ticket-viewed', {
        detail: { ticketId }
      }))
    }
  }, [ticketId])

  // Escuta eventos de novas mensagens
  useEffect(() => {
    const handleNewMessage = (event) => {
      const eventTicketId = event.detail?.ticketId
      const isInternal = event.detail?.isInternal || false
      
      // Se o evento for para este ticket ou para todos
      if (!eventTicketId || String(eventTicketId) === String(ticketId)) {
        // Se for cliente e a mensagem for interna, não mostra notificação
        if (isCliente && isInternal) {
          return
        }
        
        // Caso contrário, sempre mostra notificação
        setHasNewMessage(true)
      }
    }

    window.addEventListener('new-ticket-message', handleNewMessage)
    return () => {
      window.removeEventListener('new-ticket-message', handleNewMessage)
    }
  }, [ticketId, isCliente])

  // Função para rolar até as mensagens
  const scrollToMessages = () => {
    if (messagesSectionRef.current) {
      messagesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Dispara evento para o componente TicketMessages fazer scroll até a última mensagem
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('scroll-to-messages', {
          detail: { ticketId }
        }))
        setHasNewMessage(false)
      }, 300)
    }
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
          setTicketData(ticketData)
          const hasPrazoResolucao = !!ticketData.prazo_resolucao
          
          setFormData({
            title: ticketData.title || "",
            nome_cliente: ticketData.nome_cliente || "",
            whatsapp_numero: ticketData.whatsapp_numero || "",
            descricao: ticketData.descricao || "",
            status: ticketData.status || "",
            priority: denormalizePriorityFromApi(ticketData.priority || ""),
            user_id: ticketData.user_id ? String(ticketData.user_id) : "",
            cliente_id: ticketData.cliente_id ? String(ticketData.cliente_id) : "",
            prazo_resolucao: ticketData.prazo_resolucao ? converterAPIParaDatetimeLocal(ticketData.prazo_resolucao) : "",
            origem: ticketData.origem || "",
          })
          
          // Inicializa data e hora do calendário se houver prazo_resolucao
          if (ticketData.prazo_resolucao) {
            // Extrai data e hora diretamente da string para evitar problemas de timezone
            // Backend retorna: "2025-11-20T14:30:00.000000Z" ou "2025-11-20T14:30:00"
            const dateStr = ticketData.prazo_resolucao
            const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
            
            if (dateMatch) {
              const [, year, month, day, hours, minutes] = dateMatch
              // Cria a data usando UTC para evitar conversão de timezone
              const date = new Date(Date.UTC(
                parseInt(year),
                parseInt(month) - 1, // mês é 0-indexed
                parseInt(day),
                parseInt(hours),
                parseInt(minutes)
              ))
              setSelectedDate(date)
              setSelectedTime(`${hours}:${minutes}`)
            } else {
              // Fallback: usa new Date() se o formato não for reconhecido
              const date = new Date(ticketData.prazo_resolucao)
              setSelectedDate(date)
              const hours = String(date.getHours()).padStart(2, '0')
              const minutes = String(date.getMinutes()).padStart(2, '0')
              setSelectedTime(`${hours}:${minutes}`)
            }
          } else {
            setSelectedDate(null)
            setSelectedTime("")
          }
          
          setShowTempoResolucao(hasPrazoResolucao)
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
    
    // Valida tempo de resolução se estiver preenchido
    if (showTempoResolucao) {
      if (!selectedDate) {
        newErrors.prazo_resolucao = "Data é obrigatória"
      } else if (!selectedTime) {
        newErrors.prazo_resolucao = "Horário é obrigatório"
      } else {
        // Combina data e hora no formato datetime-local
        // Usa getFullYear, getMonth, getDate para evitar problemas de timezone
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        const datetimeLocal = `${dateStr}T${selectedTime}`
        const validation = validateResolvidoEm(datetimeLocal, ticketData?.created_at)
        if (!validation.valid) {
          newErrors.prazo_resolucao = validation.error
        }
      }
    }
    
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
      
      // Origem é opcional
      if (formData.origem && formData.origem !== "none") {
        payload.origem = formData.origem
      } else if (formData.origem === "" || formData.origem === "none") {
        payload.origem = null
      }
      
      // Tempo de resolução é opcional - apenas data e horário
      if (showTempoResolucao && selectedDate && selectedTime) {
        // Combina data e hora no formato datetime-local
        // Usa getFullYear, getMonth, getDate para evitar problemas de timezone
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        const datetimeLocal = `${dateStr}T${selectedTime}`
        // Converte datetime-local para formato da API (adiciona :00)
        payload.prazo_resolucao = converterDatetimeLocalParaAPI(datetimeLocal)
      } else {
        // Se o checkbox não está marcado ou campo está vazio, envia null
        payload.prazo_resolucao = null
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
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <TicketsHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="mb-6" suppressHydrationWarning>
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
                  {/* Exibir prazo de resolução se disponível */}
                  {ticketData?.prazo_resolucao && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Prazo de Resolução
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={formatarDataHora(ticketData.prazo_resolucao)} 
                          disabled 
                          readOnly 
                          className="flex-1"
                        />
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                          Prazo Definido
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Se não tiver prazo_resolucao e estiver resolvido, mostrar cálculo automático */}
                  {!ticketData?.prazo_resolucao && 
                   ticketData?.status === 'resolvido' && 
                   ticketData?.created_at && 
                   ticketData?.updated_at && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Tempo de Resolução
                      </Label>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const criado = new Date(ticketData.created_at)
                          const atualizado = new Date(ticketData.updated_at)
                          const minutos = Math.floor((atualizado - criado) / (1000 * 60))
                          return (
                            <>
                              <Input 
                                value={formatarTempoCurto(minutos)} 
                                disabled 
                                readOnly 
                                className="flex-1"
                              />
                              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                                Calculado Automaticamente
                              </span>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )}
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
                            <SelectItem key={cliente.id} value={String(cliente.id)}>
                              {cliente.name} {cliente.email && `(${cliente.email})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">Opcional - Vincula o chamado a um usuário cliente</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origem">Origem do Chamado</Label>
                  <Select 
                    value={formData.origem || "none"} 
                    onValueChange={(value) => setFormData({ ...formData, origem: value === "none" ? "" : value })}
                  >
                    <SelectTrigger id="origem">
                      <SelectValue placeholder="Selecione a origem (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não especificado</SelectItem>
                      <SelectItem value="formulario_web">Formulário Web</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="tel_manual">Telefone/Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Opcional - Como o chamado foi criado</p>
                </div>

                {/* Campo de Tempo de Resolução (Opcional) */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show_tempo_resolucao"
                      checked={showTempoResolucao}
                      onCheckedChange={(checked) => {
                        setShowTempoResolucao(checked)
                        if (!checked) {
                          setSelectedDate(null)
                          setSelectedTime("")
                        }
                      }}
                    />
                    <Label htmlFor="show_tempo_resolucao" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Definir prazo para resolver o chamado
                    </Label>
                  </div>
                  
                  {showTempoResolucao && (
                    <div className="ml-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="prazo_resolucao_date">Prazo de Resolução</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${errors.prazo_resolucao ? "border-destructive" : ""}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="prazo_resolucao_time">Horário do Prazo</Label>
                        <Input
                          id="prazo_resolucao_time"
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className={errors.prazo_resolucao ? "border-destructive" : ""}
                        />
                      </div>
                      
                      {errors.prazo_resolucao && (
                        <p className="text-sm text-destructive">{errors.prazo_resolucao}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Data e horário limite para resolver este chamado
                      </p>
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

        <div className="mt-6" suppressHydrationWarning>
          <TicketAttachments ticketId={ticketId} />
        </div>

        <div className="mt-6" ref={messagesSectionRef} suppressHydrationWarning>
          <TicketMessages ticketId={ticketId} />
        </div>
      </div>

      {/* Notificação fixa de nova mensagem */}
      {hasNewMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
          <Button
            onClick={scrollToMessages}
            className="shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Nova mensagem
            <ChevronDown className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}

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


