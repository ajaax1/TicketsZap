"use client"

import { useState } from "react"
import { TicketsHeader } from "@/components/tickets-header"
import { TicketsFilters } from "@/components/tickets-filters"
import { TicketsList } from "@/components/tickets-list"

export default function TicketsPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const mockPaginationData = {
    current_page: currentPage,
    last_page: 3,
    first_page_url: "http://127.0.0.1:8000/api/tickets?page=1",
    from: (currentPage - 1) * 6 + 1,
    to: Math.min(currentPage * 6, 18),
    total: 18,
    per_page: 6,
    prev_page_url: currentPage > 1 ? `http://127.0.0.1:8000/api/tickets?page=${currentPage - 1}` : null,
    next_page_url: currentPage < 3 ? `http://127.0.0.1:8000/api/tickets?page=${currentPage + 1}` : null,
    links: [
      { url: null, label: "&laquo; Previous", active: false },
      { url: "http://127.0.0.1:8000/api/tickets?page=1", label: "1", active: currentPage === 1 },
      { url: "http://127.0.0.1:8000/api/tickets?page=2", label: "2", active: currentPage === 2 },
      { url: "http://127.0.0.1:8000/api/tickets?page=3", label: "3", active: currentPage === 3 },
      { url: null, label: "Next &raquo;", active: false },
    ],
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    console.log("[v0] Mudando para página:", page)
  }

  return (
    <div className="min-h-screen bg-background">
      <TicketsHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <TicketsFilters />
        <TicketsList paginationData={mockPaginationData} onPageChange={handlePageChange} />
      </main>
    </div>
  )
}
