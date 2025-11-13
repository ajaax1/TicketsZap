"use client"

import { useEffect, useState, Suspense, useCallback, useRef } from "react"
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
  const [isNavigating, setIsNavigating] = useState(false)
  const [filters, setFilters] = useState({})
  const isUpdatingURL = useRef(false)

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

  const fetchPage = useCallback(async (page, appliedFilters = {}) => {
    try {
      setLoading(true)
      console.log('Fetching page:', page, 'with filters:', appliedFilters)
      
      // Adiciona timestamp para cache busting
      const cacheBuster = Date.now()
      const data = await getTickets(page, { ...appliedFilters, _t: cacheBuster })
      
      console.log('Page data received:', data)
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
  }, [])

  // Carrega filtros da URL na inicialização
  useEffect(() => {
    if (isUpdatingURL.current) {
      console.log('Skipping URL update - we are updating programmatically')
      isUpdatingURL.current = false
      return
    }
    
    const urlFilters = getFiltersFromURL()
    const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1
    
    console.log('URL changed - loading filters:', urlFilters, 'page:', urlPage, 'currentPage:', currentPage)
    
    // Atualiza página se mudou
    if (urlPage !== currentPage) {
      console.log('Page changed from URL:', urlPage, 'updating state')
      setCurrentPage(urlPage)
    }
    
    // Sempre atualiza filtros da URL (pode ter mudado mesmo se página não mudou)
    setFilters(urlFilters)
  }, [searchParams, currentPage])

  // Busca dados quando filtros ou página mudam
  useEffect(() => {
    if (Object.keys(filters).length > 0 || currentPage > 0) {
      fetchPage(currentPage, filters)
    }
  }, [currentPage, filters, fetchPage])

  const handlePageChange = useCallback((page) => {
    console.log('TicketsPage handlePageChange called with page:', page, 'currentPage:', currentPage, 'isNavigating:', isNavigating)
    
    // Validação básica
    if (!page || page < 1) {
      console.error('Invalid page number:', page)
      return
    }
    
    // Evita mudança para a mesma página
    if (page === currentPage) {
      console.log('Same page, skipping update')
      return
    }
    
    // Evita múltiplas navegações simultâneas
    if (isNavigating) {
      console.log('Already navigating, skipping update')
      return
    }
    
    // Marca que estamos navegando
    setIsNavigating(true)
    isUpdatingURL.current = true
    
    // Atualiza URL primeiro para garantir sincronização
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
    console.log('TicketsPage updating URL to:', newURL)
    
    try {
      // Atualiza URL primeiro
      router.replace(newURL, { scroll: false })
      console.log('TicketsPage URL updated successfully')
      
      // Depois atualiza o estado
      setCurrentPage(page)
      console.log('TicketsPage state updated to:', page)
      
      // Reset navigation flag após um delay
     
    } catch (error) {
      console.error('TicketsPage error updating URL:', error)
      isUpdatingURL.current = false
      setIsNavigating(false)
    }
  }, [filters, router, currentPage, isNavigating])

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
          <TicketsList tickets={tickets} paginationData={paginationData} onPageChange={handlePageChange} onTicketDelete={handleTicketDelete} loading={loading} />
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
