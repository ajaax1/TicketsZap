import { TicketCard } from "@/components/tickets-card"
import { Pagination } from "@/components/pagination"

export function TicketsList({ tickets = [], paginationData, onPageChange }) {
  return (
    <div>
      <div className="mt-6 space-y-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>

      {paginationData && <Pagination paginationData={paginationData} onPageChange={onPageChange} />}
    </div>
  )
}
