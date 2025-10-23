"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Bell, Settings, LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout, getCurrentUser } from "@/services/auth"

export function TicketsHeader() {
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    // Busca dados do usuário do localStorage
    const userData = getCurrentUser()
    setUser(userData)
  }, [])

  // Função para determinar se um link está ativo
  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  function getInitials(name) {
    if (!name) return "U"
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
                <span className="text-lg font-bold text-background">S</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">Suporte</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className={`text-sm font-medium transition-colors ${
                  isActive("/") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Chamados
              </Link>
              <Link 
                href="/users" 
                className={`text-sm font-medium transition-colors ${
                  isActive("/users") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Usuários
              </Link>
              <Link 
                href="#" 
                className={`text-sm font-medium transition-colors ${
                  isActive("/reports") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Relatórios
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="relative bg-transparent cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                3
              </span>
            </Button>
            <Button variant="outline" size="icon" className="cursor-pointer">
              <Settings className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || user?.profile_photo_url} />
                    <AvatarFallback>
                      {user ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "Usuário"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "usuario@empresa.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
