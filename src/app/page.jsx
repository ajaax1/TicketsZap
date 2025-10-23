"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TicketsHeader } from "@/components/tickets-header"
import { TicketsFilters } from "@/components/tickets-filters"
import { TicketsList } from "@/components/tickets-list"
import { TicketsStats } from "@/components/tickets-stats"
import { getTickets } from "@/services/tickets"
import { LoadingSpinner } from "@/components/loading-spinner"
import useAuth from "@/hooks/useAuth"

function TicketsPageContent() {
  useAuth() // Verifica autenticação
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationData, setPaginationData] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})

  // Função para ler filtros da URL
  const getFiltersFromURL = () => {
    const urlFilters = {}
    if (searchParams.get('status')) urlFilters.status = searchParams.get('status')
    if (searchParams.get('owner')) urlFilters.owner = searchParams.get('owner')
    if (searchParams.get('priority')) urlFilters.priority = searchParams.get('priority')
    if (searchParams.get('search')) urlFilters.search = searchParams.get('search')
    if (searchParams.get('from')) urlFilters.from = searchParams.get('from')
    if (searchParams.get('to')) urlFilters.to = searchParams.get('to')
    return urlFilters
  }

  // Função para atualizar URL com filtros
  const updateURLWithFilters = (newFilters) => {
    const params = new URLSearchParams()
    
    // Adiciona página atual
    if (currentPage > 1) params.set('page', currentPage.toString())
    
    // Adiciona filtros que não são valores padrão
    if (newFilters.status && newFilters.status !== 'todos') params.set('status', newFilters.status)
    if (newFilters.owner && newFilters.owner !== 'todos') params.set('owner', newFilters.owner)
    if (newFilters.priority && newFilters.priority !== 'todos') params.set('priority', newFilters.priority)
    if (newFilters.search && newFilters.search.trim()) params.set('search', newFilters.search.trim())
    if (newFilters.from) params.set('from', newFilters.from)
    if (newFilters.to) params.set('to', newFilters.to)

    const newURL = params.toString() ? `?${params.toString()}` : '/'
    router.replace(newURL, { scroll: false })
  }

  async function fetchPage(page, appliedFilters = filters) {
    try {
      setLoading(true)
      const data = await getTickets(page, appliedFilters)
      setTickets(Array.isArray(data.data) ? data.data : [])
      setPaginationData(data)
      setError(null)
    } catch (err) {
      console.error("Erro ao buscar chamados:", err)
      setError("Erro ao carregar chamados")
      setTickets([])
      setPaginationData(null)
    } finally {
      setLoading(false)
    }
  }

  // Carrega filtros da URL na inicialização
  useEffect(() => {
    const urlFilters = getFiltersFromURL()
    const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1
    
    setFilters(urlFilters)
    setCurrentPage(urlPage)
  }, [searchParams])

  // Busca dados quando filtros ou página mudam
  useEffect(() => {
    if (Object.keys(filters).length > 0 || currentPage > 0) {
      fetchPage(currentPage, filters)
    }
  }, [currentPage, filters])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Atualiza URL com a nova página
    const params = new URLSearchParams()
    
    // Adiciona nova página
    if (page > 1) params.set('page', page.toString())
    
    // Adiciona filtros existentes
    if (filters.status && filters.status !== 'todos') params.set('status', filters.status)
    if (filters.owner && filters.owner !== 'todos') params.set('owner', filters.owner)
    if (filters.priority && filters.priority !== 'todos') params.set('priority', filters.priority)
    if (filters.search && filters.search.trim()) params.set('search', filters.search.trim())
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)

    const newURL = params.toString() ? `?${params.toString()}` : '/'
    router.replace(newURL, { scroll: false })
  }

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateURLWithFilters(newFilters)
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
        <TicketsFilters onApply={handleApplyFilters} initialFilters={filters} />

        {loading ? (
          <LoadingSpinner text="Carregando chamados..." />
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

export default function TicketsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <TicketsHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LoadingSpinner text="Carregando..." />
        </main>
      </div>
    }>
      <TicketsPageContent />
    </Suspense>
  )
}
