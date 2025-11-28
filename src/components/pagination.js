"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination({ paginationData, onPageChange, loading = false }) {
  const handlePageClick = useCallback((pageNumber) => {
    if (pageNumber !== paginationData?.current_page && onPageChange && !loading) {
      onPageChange(pageNumber)
    }
  }, [paginationData?.current_page, onPageChange, loading])

  const handlePrevious = useCallback(() => {
    if (paginationData?.current_page > 1 && onPageChange && !loading) {
      onPageChange(paginationData.current_page - 1)
    }
  }, [paginationData?.current_page, onPageChange, loading])

  const handleNext = useCallback(() => {
    if (paginationData?.current_page < paginationData?.last_page && onPageChange && !loading) {
      onPageChange(paginationData.current_page + 1)
    }
  }, [paginationData?.current_page, paginationData?.last_page, onPageChange, loading])

  if (!paginationData) return null

  const { current_page, last_page, links, from, to, total } = paginationData
  const pageLinks = links.filter((link) => link.label !== "&laquo; Previous" && link.label !== "Next &raquo;")

  return (
    <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
      <div className="text-sm text-muted-foreground">
        Mostrando <span className="font-medium">{from}</span> até <span className="font-medium">{to}</span> de{" "}
        <span className="font-medium">{total}</span> resultados
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={current_page === 1 || loading}
          className="gap-1 bg-transparent cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {pageLinks.map((link, index) => {
            const pageNumber = Number.parseInt(link.label)
            const isValidPage = !isNaN(pageNumber) && pageNumber > 0
            
            return (
              <Button
                key={index}
                variant={link.active ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isValidPage) {
                    handlePageClick(pageNumber)
                  }
                }}
                disabled={link.active || loading || !isValidPage}
                className="min-w-[40px] cursor-pointer disabled:cursor-not-allowed"
              >
                {link.label}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={current_page === last_page || loading}
          className="gap-1 bg-transparent cursor-pointer disabled:cursor-not-allowed"
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
