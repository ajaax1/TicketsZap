"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePermissions } from "@/hooks/usePermissions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Mail, Shield, HeadphonesIcon, UserCheck, User } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { deleteUser } from "@/services/users"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

export function UsersTable({ users = [], onUserDelete }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const { canEditUsers, canDeleteUsers, isHydrated } = usePermissions()

  const roleColors = {
    admin: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    support: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    assistant: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    cliente: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  }

  const roleLabels = {
    admin: "Administrador",
    support: "Suporte", 
    assistant: "Assistente",
    cliente: "Cliente",
  }

  const roleIcons = {
    admin: <Shield className="h-4 w-4" />,
    support: <HeadphonesIcon className="h-4 w-4" />,
    assistant: <UserCheck className="h-4 w-4" />,
    cliente: <User className="h-4 w-4" />,
  }

  function getInitials(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function formatDateTime(dateString) {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch {
      return "--/--/---- --:--"
    }
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    
    try {
      setIsDeleting(true)
      await deleteUser(userToDelete.id)
      toast.success("Usuário excluído com sucesso!")
      if (onUserDelete) {
        onUserDelete(userToDelete.id)
      }
      setShowDeleteDialog(false)
      setUserToDelete(null)
    } catch (e) {
      const apiMessage = e?.response?.data?.message || e?.message || "Erro ao excluir usuário"
      toast.error(apiMessage)
      if (typeof window !== "undefined") {
        console.error("Erro ao excluir usuário:", e?.response?.data || e)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-muted-foreground">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhum usuário encontrado</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Não há usuários que correspondam aos filtros aplicados.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Criado em</TableHead>
              {isHydrated && (canEditUsers || canDeleteUsers) && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {user.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || user?.profile_photo_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={roleColors[user.role]}>
                    <span className="flex items-center gap-1">
                      {roleIcons[user.role]}
                      {roleLabels[user.role] || user.role}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(user.created_at)}
                </TableCell>
                {isHydrated && (canEditUsers || canDeleteUsers) && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEditUsers && (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              window.location.href = `/users/${user.id}`
                            }}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {canDeleteUsers && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(user)}
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Excluir Usuário"
        description="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </>
  )
}
