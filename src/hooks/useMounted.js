"use client"

import { useState, useEffect } from "react"

/**
 * Hook para garantir que o componente só renderize conteúdo específico do cliente
 * após a hidratação completa. Útil para evitar problemas de hidratação causados
 * por extensões do navegador que modificam o DOM.
 * 
 * @returns {boolean} true quando o componente está montado no cliente
 * 
 * @example
 * ```jsx
 * function MyComponent() {
 *   const mounted = useMounted()
 *   
 *   if (!mounted) {
 *     return null // ou um placeholder
 *   }
 *   
 *   return <div>Conteúdo que depende do cliente</div>
 * }
 * ```
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

