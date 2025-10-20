import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { deleteTicket } from "@/services/tickets"
import { toast } from "sonner"

export function TicketCard({ ticket, onDelete }) {
  const statusColors = {
    aberto: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    pendente: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    resolvido: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    finalizado: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
  }

  const statusLabels = {
    aberto: "Aberto",
    pendente: "Pendente", 
    resolvido: "Resolvido",
    finalizado: "Finalizado",
  }

  const priorityColors = {
    baixa: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    media: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    alta: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  }

  const priorityLabels = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
  }

  function getInitials(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function formatRelativeTime(dateString) {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return "Data inválida"
    }
  }

  function formatDateTime(dateString) {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch {
      return "--/--/---- --:--"
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm("Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.")) {
      return
    }
    
    try {
      await deleteTicket(ticket.id)
      toast.success("Chamado excluído com sucesso!")
      if (onDelete) {
        onDelete(ticket.id)
      }
    } catch (e) {
      const apiMessage = e?.response?.data?.message || e?.message || "Erro ao excluir chamado"
      toast.error(apiMessage)
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.error("Erro ao excluir chamado:", e?.response?.data || e)
      }
    }
  }

  return (
    <a href={`/tickets/${ticket.id}`} className="block group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">#{ticket.id}</span>
                <Badge variant="outline" className={statusColors[ticket.status]}>
                  {statusLabels[ticket.status] || ticket.status}
                </Badge>
                {ticket.priority && (
                  <Badge variant="outline" className={priorityColors[ticket.priority]}>
                    {priorityLabels[ticket.priority] || ticket.priority}
                  </Badge>
                )}
                <Badge variant="secondary">{ticket.nome_cliente}</Badge>
              </div>
              <h3 className="mt-2 text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
                {ticket.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{ticket.descricao}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {ticket.user?.name ? getInitials(ticket.user.name) : "??"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {ticket.user?.name || "Usuário não encontrado"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Atualizado em {formatDateTime(ticket.updated_at)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>Criado em {formatDateTime(ticket.created_at)}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </a>
  )
}
