"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Paperclip, Upload, X, Download, Eye, File } from "lucide-react"
import { 
  uploadAttachments, 
  getTicketAttachments, 
  deleteAttachment,
  downloadAttachment 
} from "@/services/attachments"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/usePermissions"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

export function TicketAttachments({ ticketId, initialAttachments = [] }) {
  const { canDeleteAttachments } = usePermissions()
  const [attachments, setAttachments] = useState(initialAttachments)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [attachmentToDelete, setAttachmentToDelete] = useState(null)

  // Se não houver ticketId, não renderiza o componente
  if (!ticketId) {
    return null
  }

  useEffect(() => {
    async function loadAttachments() {
      if (!ticketId) {
        setAttachments([])
        return
      }
      
      try {
        const data = await getTicketAttachments(ticketId)
        setAttachments(Array.isArray(data) ? data : [])
      } catch (error) {
        // Se for 404, significa que não há anexos ainda (ou rota não existe)
        // Tratamos como array vazio ao invés de erro
        if (error?.response?.status === 404) {
          console.log("Nenhum anexo encontrado para este ticket")
          setAttachments([])
        } else {
          console.error("Erro ao carregar anexos:", error)
          // Em caso de outros erros, mantém array vazio
          setAttachments([])
        }
      }
    }
    loadAttachments()
  }, [ticketId])

  const isImage = (mimeType) => {
    return mimeType?.startsWith('image/')
  }

  const isPDF = (mimeType) => {
    return mimeType === 'application/pdf'
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (!ticketId) {
      toast.error("ID do ticket não encontrado")
      return
    }

    // Validação: máximo 10 arquivos
    if (files.length > 10) {
      toast.error("Máximo de 10 arquivos por upload")
      return
    }

    // Validação: tamanho máximo 10MB por arquivo
    const maxSize = 10 * 1024 * 1024 // 10MB
    const invalidFiles = files.filter(f => f.size > maxSize)
    if (invalidFiles.length > 0) {
      toast.error(`Alguns arquivos excedem 10MB: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    try {
      setUploading(true)
      const result = await uploadAttachments(ticketId, files)
      if (result.anexos) {
        setAttachments(prev => [...prev, ...result.anexos])
        toast.success(`${result.anexos.length} arquivo(s) enviado(s) com sucesso!`)
      }
      // Limpa o input
      e.target.value = ''
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Erro ao enviar arquivos"
      toast.error(message)
      console.error("Erro ao fazer upload de anexos:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteClick = (attachment) => {
    setAttachmentToDelete(attachment)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!attachmentToDelete) return
    
    try {
      setDeletingId(attachmentToDelete.id)
      await deleteAttachment(attachmentToDelete.id)
      setAttachments(prev => prev.filter(a => a.id !== attachmentToDelete.id))
      toast.success("Anexo excluído com sucesso!")
      setShowDeleteDialog(false)
      setAttachmentToDelete(null)
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Erro ao excluir anexo"
      toast.error(message)
      console.error("Erro ao excluir anexo:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (attachment) => {
    try {
      const blob = await downloadAttachment(attachment.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.nome_arquivo
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast.error("Erro ao fazer download do arquivo")
    }
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Anexos</h3>
                <span className="text-sm text-muted-foreground">({attachments.length})</span>
              </div>
              <label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Enviando..." : "Enviar Arquivos"}
                  </span>
                </Button>
              </label>
            </div>

            {attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum anexo ainda. Clique em "Enviar Arquivos" para adicionar.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {isImage(attachment.tipo_mime) ? (
                      <div className="space-y-2">
                        <img
                          src={attachment.url}
                          alt={attachment.nome_arquivo}
                          className="w-full h-48 object-cover rounded"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate flex-1" title={attachment.nome_arquivo}>
                            {attachment.nome_arquivo}
                          </p>
                          {canDeleteAttachments && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(attachment)}
                              disabled={deletingId === attachment.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(attachment.url, '_blank')}
                            className="flex-1"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(attachment)}
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.tamanho)}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                          <File className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate flex-1" title={attachment.nome_arquivo}>
                            {attachment.nome_arquivo}
                          </p>
                          {canDeleteAttachments && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(attachment)}
                              disabled={deletingId === attachment.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isPDF(attachment.tipo_mime) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(attachment.url, '_blank')}
                              className="flex-1"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(attachment)}
                            className={isPDF(attachment.tipo_mime) ? "flex-1" : "w-full"}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.tamanho)} • {attachment.tipo_mime}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Excluir Anexo"
        description="Tem certeza que deseja excluir este anexo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={deletingId !== null}
      />
    </>
  )
}

