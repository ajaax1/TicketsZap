"use client"

import { useEffect, useState } from "react"
import { TicketsHeader } from "@/components/tickets-header"
import { TicketsFilters } from "@/components/tickets-filters"
import { TicketsList } from "@/components/tickets-list"
import { TicketsStats } from "@/components/tickets-stats"
import { getTickets } from "@/services/tickets"
import { Spinner } from "@/components/ui/spinner"

export default function TicketsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationData, setPaginationData] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})

  async function fetchPage(page, appliedFilters = filters) {
    try {
      setLoading(true)
      const data = await getTickets(page, appliedFilters)
      setTickets(Array.isArray(data.data) ? data.data : [])
      setPaginationData(data)
      setError(null)
    } catch (err) {
      console.error("Erro ao buscar tickets:", err)
      setError("Erro ao carregar tickets")
      setTickets([])
      setPaginationData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(currentPage, filters)
  }, [currentPage, filters])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleTicketDelete = (deletedTicketId) => {
    setTickets(tickets.filter(ticket => ticket.id !== deletedTicketId))
  }

  return (
    <div className="min-h-screen bg-background">
      <TicketsHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <TicketsStats />
        </div>
        <TicketsFilters onApply={handleApplyFilters} />

        {loading ? (
          <div className="mt-6 flex justify-center py-8">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : error ? (
          <div className="mt-6 text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <TicketsList tickets={tickets} paginationData={paginationData} onPageChange={handlePageChange} onTicketDelete={handleTicketDelete} />
        )}
      </main>
    </div>
  )
}
