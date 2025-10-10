import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function TicketCard({ ticket }) {
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

  return (
    <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">#{ticket.id}</span>
                <Badge variant="outline" className={statusColors[ticket.status]}>
                  {statusLabels[ticket.status] || ticket.status}
                </Badge>
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
                <span>Atualizado {formatRelativeTime(ticket.updated_at)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>Criado {formatRelativeTime(ticket.created_at)}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
