import { TicketCard } from "@/components/tickets-card"
import { Pagination } from "@/components/pagination"

const mockTickets = [
  {
    id: "TICK-1234",
    title: "Erro ao fazer login na plataforma",
    description: "Usuário reporta erro 500 ao tentar fazer login com credenciais válidas",
    status: "aberto",
    priority: "alta",
    category: "Técnico",
    assignee: {
      name: "Ana Silva",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AS",
    },
    createdAt: "2h atrás",
    updatedAt: "30min atrás",
  },
  {
    id: "TICK-1233",
    title: "Solicitação de nova funcionalidade",
    description: "Cliente solicita integração com sistema de pagamento PIX",
    status: "em-andamento",
    priority: "media",
    category: "Feature",
    assignee: {
      name: "Carlos Santos",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "CS",
    },
    createdAt: "5h atrás",
    updatedAt: "1h atrás",
  },
  {
    id: "TICK-1232",
    title: "Dúvida sobre cobrança",
    description: "Cliente questiona valor cobrado na última fatura",
    status: "aberto",
    priority: "baixa",
    category: "Financeiro",
    assignee: {
      name: "Maria Oliveira",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MO",
    },
    createdAt: "1d atrás",
    updatedAt: "8h atrás",
  },
  {
    id: "TICK-1231",
    title: "Página não carrega corretamente",
    description: "Dashboard apresenta erro de carregamento em navegadores Safari",
    status: "em-andamento",
    priority: "alta",
    category: "Bug",
    assignee: {
      name: "Pedro Costa",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "PC",
    },
    createdAt: "1d atrás",
    updatedAt: "3h atrás",
  },
  {
    id: "TICK-1230",
    title: "Resetar senha de usuário",
    description: "Usuário não recebe email de recuperação de senha",
    status: "resolvido",
    priority: "media",
    category: "Suporte",
    assignee: {
      name: "Ana Silva",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AS",
    },
    createdAt: "2d atrás",
    updatedAt: "1d atrás",
  },
  {
    id: "TICK-1229",
    title: "Lentidão no sistema",
    description: "Sistema apresenta lentidão significativa durante horário de pico",
    status: "aberto",
    priority: "alta",
    category: "Performance",
    assignee: {
      name: "Carlos Santos",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "CS",
    },
    createdAt: "3d atrás",
    updatedAt: "2d atrás",
  },
]

export function TicketsList({ tickets, paginationData, onPageChange }) {
  const displayTickets = tickets || mockTickets

  return (
    <div>
      <div className="mt-6 space-y-3">
        {displayTickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>

      {paginationData && <Pagination paginationData={paginationData} onPageChange={onPageChange} />}
    </div>
  )
}
