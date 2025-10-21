"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination({ paginationData, onPageChange }) {
  if (!paginationData) return null

  const { current_page, last_page, links, from, to, total } = paginationData

  const pageLinks = links.filter((link) => link.label !== "&laquo; Previous" && link.label !== "Next &raquo;")

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== current_page && onPageChange) {
      onPageChange(pageNumber)
    }
  }

  const handlePrevious = () => {
    if (current_page > 1 && onPageChange) {
      onPageChange(current_page - 1)
    }
  }

  const handleNext = () => {
    if (current_page < last_page && onPageChange) {
      onPageChange(current_page + 1)
    }
  }

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
          disabled={current_page === 1}
          className="gap-1 bg-transparent cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {pageLinks.map((link, index) => (
            <Button
              key={index}
              variant={link.active ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageClick(Number.parseInt(link.label))}
              disabled={link.active}
              className="min-w-[40px] cursor-pointer disabled:cursor-not-allowed"
            >
              {link.label}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={current_page === last_page}
          className="gap-1 bg-transparent cursor-pointer disabled:cursor-not-allowed"
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
