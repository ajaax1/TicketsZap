"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TicketsHeader } from "@/components/tickets-header"
import { UsersFilters } from "@/components/users-filters"
import { UsersList } from "@/components/users-list"
import { UsersStats } from "@/components/users-stats"
import { getUsers } from "@/services/users"
import { Spinner } from "@/components/ui/spinner"

function UsersPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationData, setPaginationData] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})

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

  async function fetchPage(page, appliedFilters = filters) {
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
    updateURLWithFilters(filters)
  }

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
          <div className="mt-6 flex justify-center py-8">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : error ? (
          <div className="mt-6 text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <UsersList users={users} paginationData={paginationData} onPageChange={handlePageChange} onUserDelete={handleUserDelete} />
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
          <div className="mt-6 flex justify-center py-8">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        </main>
      </div>
    }>
      <UsersPageContent />
    </Suspense>
  )
}
