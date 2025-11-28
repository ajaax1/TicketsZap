"use client"

import { useEffect, useState, Suspense, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TicketsHeader } from "@/components/tickets-header"
import { UsersFilters } from "@/components/users-filters"
import { UsersList } from "@/components/users-list"
import { UsersStats } from "@/components/users-stats"
import { getUsers } from "@/services/users"
import { LoadingSpinner } from "@/components/loading-spinner"
import useAuth from "@/hooks/useAuth"

function UsersPageContent() {
  useAuth() // Verifica autenticação
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationData, setPaginationData] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const isUpdatingURL = useRef(false)
  const hasInitialized = useRef(false)
  const prevFiltersRef = useRef({})
  const prevPageRef = useRef(1)

  // Função para ler filtros da URL
  const getFiltersFromURL = () => {
    const urlFilters = {}
    if (searchParams.get('role')) urlFilters.role = searchParams.get('role')
    if (searchParams.get('search')) urlFilters.search = searchParams.get('search')
    return urlFilters
  }

  // Função para atualizar URL com filtros
  const updateURLWithFilters = (newFilters) => {
    const params = new URLSearchParams()
    
    // Adiciona página atual
    if (currentPage > 1) params.set('page', currentPage.toString())
    
    // Adiciona filtros que não são valores padrão
    if (newFilters.role && newFilters.role !== 'todos') params.set('role', newFilters.role)
    if (newFilters.search && newFilters.search.trim()) params.set('search', newFilters.search.trim())

    const newURL = params.toString() ? `?${params.toString()}` : '/users'
    router.replace(newURL, { scroll: false })
  }

  const fetchPage = useCallback(async (page, appliedFilters = {}) => {
    try {
      setLoading(true)
      
      // Adiciona timestamp para cache busting
      const cacheBuster = Date.now()
      const data = await getUsers(page, { ...appliedFilters, _t: cacheBuster })
      
      const usersArray = Array.isArray(data.data) ? data.data : []
      
      setUsers(usersArray)
      setPaginationData(data)
      setError(null)
    } catch (err) {
      console.error("Erro ao buscar usuários:", err)
      setError("Erro ao carregar usuários")
      setUsers([])
      setPaginationData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carrega filtros da URL quando a URL muda (não quando currentPage muda)
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
    if (filters.role && filters.role !== 'todos') params.set('role', filters.role)
    if (filters.search && filters.search.trim()) params.set('search', filters.search.trim())

    const newURL = params.toString() ? `?${params.toString()}` : '/users'
    
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

  const handleUserDelete = (deletedUserId) => {
    setUsers(users.filter(user => user.id !== deletedUserId))
  }

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <TicketsHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="mb-6" suppressHydrationWarning>
          <UsersStats />
        </div>
        <div suppressHydrationWarning>
          <UsersFilters onApply={handleApplyFilters} initialFilters={filters} />
        </div>

        {loading ? (
          <LoadingSpinner text="Carregando usuários..." />
        ) : error ? (
          <div className="mt-6 text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <UsersList users={users} paginationData={paginationData} onPageChange={handlePageChange} onUserDelete={handleUserDelete} loading={loading} />
        )}
      </main>
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <TicketsHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LoadingSpinner text="Carregando..." />
        </main>
      </div>
    }>
      <UsersPageContent />
    </Suspense>
  )
}
