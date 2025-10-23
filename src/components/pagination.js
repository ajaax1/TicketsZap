"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination({ paginationData, onPageChange, loading = false }) {
  const handlePageClick = useCallback((pageNumber) => {
    console.log('Pagination handlePageClick called with:', pageNumber, 'current:', paginationData?.current_page)
    if (pageNumber !== paginationData?.current_page && onPageChange && !loading) {
      console.log('Calling onPageChange with:', pageNumber)
      onPageChange(pageNumber)
    } else {
      console.log('Skipping page change - same page or loading or no handler')
    }
  }, [paginationData?.current_page, onPageChange, loading])

  const handlePrevious = useCallback(() => {
    console.log('Pagination handlePrevious called, current:', paginationData?.current_page)
    if (paginationData?.current_page > 1 && onPageChange && !loading) {
      console.log('Calling onPageChange with:', paginationData.current_page - 1)
      onPageChange(paginationData.current_page - 1)
    } else {
      console.log('Skipping previous - first page or loading or no handler')
    }
  }, [paginationData?.current_page, onPageChange, loading])

  const handleNext = useCallback(() => {
    console.log('Pagination handleNext called, current:', paginationData?.current_page, 'last:', paginationData?.last_page)
    if (paginationData?.current_page < paginationData?.last_page && onPageChange && !loading) {
      console.log('Calling onPageChange with:', paginationData.current_page + 1)
      onPageChange(paginationData.current_page + 1)
    } else {
      console.log('Skipping next - last page or loading or no handler')
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
                  console.log('Page button clicked:', link.label, 'parsed as:', pageNumber)
                  if (isValidPage) {
                    handlePageClick(pageNumber)
                  } else {
                    console.error('Invalid page number:', link.label)
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
