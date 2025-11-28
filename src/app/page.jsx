"use client"

import { useEffect, useState, Suspense, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TicketsHeader } from "@/components/tickets-header"
import { TicketsFilters } from "@/components/tickets-filters"
import { TicketsList } from "@/components/tickets-list"
import { TicketsStats } from "@/components/tickets-stats"
import { getTickets } from "@/services/tickets"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { MessageSquare, ChevronDown } from "lucide-react"
import useAuth from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"

function TicketsPageContent() {
  useAuth() // Verifica autenticação
  const { isCliente } = usePermissions()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationData, setPaginationData] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const isUpdatingURL = useRef(false)
  const hasInitialized = useRef(false)
  const prevFiltersRef = useRef({})
  const prevPageRef = useRef(1)
  const [ticketsWithNewMessages, setTicketsWithNewMessages] = useState(new Map()) // Map<ticketId, quantidade>

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
      
      // Adiciona timestamp para cache busting
      const cacheBuster = Date.now()
      const data = await getTickets(page, { ...appliedFilters, _t: cacheBuster })
      
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

  // Carrega filtros da URL quando a URL muda
  useEffect(() => {
    if (isUpdatingURL.current) {
      isUpdatingURL.current = false
      return
    }
    
    const urlFilters = getFiltersFromURL()
    const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1
    
    // Atualiza página se mudou (mas não se estamos atualizando programaticamente)
    if (urlPage !== currentPage && !isUpdatingURL.current) {
      // Atualiza o ref ANTES de atualizar o estado para evitar que o useEffect detecte como "nada mudou"
      prevPageRef.current = currentPage
      setCurrentPage(urlPage)
    }
    
    // Atualiza filtros se mudaram
    const filtersChanged = JSON.stringify(urlFilters) !== JSON.stringify(filters)
    if (filtersChanged && !isUpdatingURL.current) {
      prevFiltersRef.current = filters
      setFilters(urlFilters)
    }
  }, [searchParams, currentPage, filters])

  // Busca dados quando filtros ou página mudam
  useEffect(() => {
    // Compara se realmente mudou ANTES de atualizar os refs
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)
    const pageChanged = prevPageRef.current !== currentPage
    
    // Na primeira renderização, sempre busca dados
    const isFirstLoad = !hasInitialized.current
    
    // Só faz fetch se realmente mudou ou for primeira carga
    if ((isFirstLoad || filtersChanged || pageChanged) && currentPage > 0) {
      // Atualiza refs APENAS DEPOIS de confirmar que vai fazer o fetch
      prevFiltersRef.current = filters
      prevPageRef.current = currentPage
      hasInitialized.current = true
      
      fetchPage(currentPage, filters)
    }
  }, [currentPage, filters, fetchPage])

  const handlePageChange = useCallback((page) => {
    // Usa paginationData.current_page como fonte da verdade para comparação
    const actualCurrentPage = paginationData?.current_page || currentPage
    
    // Validação básica
    if (!page || page < 1) {
      return
    }
    
    // Evita mudança para a mesma página (usa paginationData como fonte da verdade)
    // Mas permite se o estado estiver dessincronizado
    if (page === actualCurrentPage && page === currentPage) {
      return
    }
    
    // IMPORTANTE: Atualiza o ref ANTES de atualizar o estado
    // Isso garante que quando o useEffect rodar, ele detecte a mudança
    prevPageRef.current = currentPage
    
    // Marca que estamos atualizando URL (para evitar loop no useEffect que lê da URL)
    isUpdatingURL.current = true
    
    // Atualiza o estado PRIMEIRO para disparar o fetch imediatamente
    setCurrentPage(page)
    
    // Atualiza URL de forma assíncrona (não bloqueia o fetch)
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
    
    // Atualiza URL de forma não-bloqueante
    router.replace(newURL, { scroll: false })
    
    // Reset flag após um pequeno delay para garantir que o useEffect que lê da URL não interfira
    setTimeout(() => {
      isUpdatingURL.current = false
    }, 50)
  }, [filters, router, currentPage, paginationData?.current_page])

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateURLWithFilters(newFilters)
  }

  const handleTicketDelete = (deletedTicketId) => {
    setTickets(tickets.filter(ticket => ticket.id !== deletedTicketId))
    // Remove o ticket do mapa de tickets com mensagens novas
    setTicketsWithNewMessages(prev => {
      const newMap = new Map(prev)
      newMap.delete(deletedTicketId)
      return newMap
    })
  }

  // Escuta eventos de novas mensagens em qualquer ticket
  useEffect(() => {
    const handleNewMessage = (event) => {
      const eventTicketId = event.detail?.ticketId
      const newMessagesCount = event.detail?.newMessagesCount || 1
      const isInternal = event.detail?.isInternal || false
      
      // Se for cliente e a mensagem for interna, não conta
      if (isCliente && isInternal) {
        return
      }
      
      if (eventTicketId) {
        setTicketsWithNewMessages(prev => {
          const newMap = new Map(prev)
          const currentCount = newMap.get(eventTicketId) || 0
          newMap.set(eventTicketId, currentCount + newMessagesCount)
          return newMap
        })
      }
    }

    window.addEventListener('new-ticket-message', handleNewMessage)
    return () => {
      window.removeEventListener('new-ticket-message', handleNewMessage)
    }
  }, [isCliente])

  // Função para limpar notificações quando o usuário visualiza um ticket
  const handleViewTicket = (ticketId) => {
    setTicketsWithNewMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(ticketId)
      return newSet
    })
  }

  // Escuta eventos de quando um ticket é visualizado (para limpar a notificação)
  useEffect(() => {
    const handleTicketViewed = (event) => {
      const eventTicketId = event.detail?.ticketId
      if (eventTicketId) {
        setTicketsWithNewMessages(prev => {
          const newMap = new Map(prev)
          newMap.delete(eventTicketId)
          return newMap
        })
      }
    }

    window.addEventListener('ticket-viewed', handleTicketViewed)
    return () => {
      window.removeEventListener('ticket-viewed', handleTicketViewed)
    }
  }, [])

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

      {/* Notificação fixa de mensagens novas */}
      {(() => {
        const totalNewMessages = Array.from(ticketsWithNewMessages.values()).reduce((sum, count) => sum + count, 0)
        return totalNewMessages > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
            <Button
              onClick={() => {
                // Rola até o topo da lista de tickets
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
              size="lg"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              <span className="font-semibold">
                {totalNewMessages === 1 
                  ? "1 mensagem nova" 
                  : `${totalNewMessages} mensagens novas`}
              </span>
              <ChevronDown className="ml-2 h-5 w-5 rotate-180" />
            </Button>
          </div>
        )
      })()}
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
