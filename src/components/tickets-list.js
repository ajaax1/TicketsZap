import { TicketCard } from "@/components/tickets-card"
import { Pagination } from "@/components/pagination"

export function TicketsList({ tickets = [], paginationData, onPageChange, onTicketDelete, loading = false }) {
  return (
    <div>
      <div className="mt-6 space-y-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} onDelete={onTicketDelete} />
        ))}
      </div>

      {paginationData && <Pagination paginationData={paginationData} onPageChange={onPageChange} loading={loading} />}
    </div>
  )
}
