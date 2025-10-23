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

  const fetchPage = useCallback(async (page, appliedFilters = filters) => {
    try {
      setLoading(true)
      const data = await getUsers(page, appliedFilters)
      setUsers(Array.isArray(data.data) ? data.data : [])
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
  }, [filters])

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
    
    // Só atualiza se realmente mudou
    if (urlPage !== currentPage) {
      console.log('Page changed from URL:', urlPage, 'updating state')
      setFilters(urlFilters)
      setCurrentPage(urlPage)
    } else {
      console.log('Page unchanged, skipping state update')
    }
  }, [searchParams, currentPage])

  // Busca dados quando filtros ou página mudam
  useEffect(() => {
    if (Object.keys(filters).length > 0 || currentPage > 0) {
      fetchPage(currentPage, filters)
    }
  }, [currentPage, filters, fetchPage])

  const handlePageChange = useCallback((page) => {
    console.log('UsersPage handlePageChange called with page:', page, 'currentPage:', currentPage)
    
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
    
    // Marca que estamos atualizando a URL para evitar loop
    isUpdatingURL.current = true
    
    // Atualiza URL primeiro para garantir sincronização
    const params = new URLSearchParams()
    
    // Adiciona nova página
    if (page > 1) params.set('page', page.toString())
    
    // Adiciona filtros existentes
    if (filters.role && filters.role !== 'todos') params.set('role', filters.role)
    if (filters.search && filters.search.trim()) params.set('search', filters.search.trim())

    const newURL = params.toString() ? `?${params.toString()}` : '/users'
    console.log('UsersPage updating URL to:', newURL)
    
    try {
      // Atualiza URL primeiro
      router.replace(newURL, { scroll: false })
      console.log('UsersPage URL updated successfully')
      
      // Depois atualiza o estado
      setCurrentPage(page)
      console.log('UsersPage state updated to:', page)
    } catch (error) {
      console.error('UsersPage error updating URL:', error)
      isUpdatingURL.current = false
    }
  }, [filters, router, currentPage])

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateURLWithFilters(newFilters)
  }

  const handleUserDelete = (deletedUserId) => {
    setUsers(users.filter(user => user.id !== deletedUserId))
  }

  return (
    <div className="min-h-screen bg-background">
      <TicketsHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <UsersStats />
        </div>
        <UsersFilters onApply={handleApplyFilters} initialFilters={filters} />

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
