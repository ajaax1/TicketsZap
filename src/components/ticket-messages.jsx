"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { getTicketMessages, sendTicketMessage, downloadMessageAttachment } from "@/services/messages"
import { toast } from "sonner"
import { Send, Lock, MessageSquare, Loader2, Paperclip, X, Download, Eye, File, ChevronDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { format } from "date-fns"
import { usePermissions } from "@/hooks/usePermissions"
import { cn } from "@/lib/utils"

export function TicketMessages({ ticketId }) {
  const { isAdmin, isSupport, isAssistant, isCliente, user, canSendInternalMessages } = usePermissions()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  const lastMessageCountRef = useRef(0)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setHasNewMessages(false)
  }

  // Verifica se o usuário está no final do scroll
  const checkIfAtBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return false
    
    const threshold = 100 // 100px de margem para considerar "no final"
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
    return isAtBottom
  }, [])

  // Handler para scroll
  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom()
    setIsAtBottom(atBottom)
    
    // Se o usuário rolar até o final, remove a notificação
    if (atBottom) {
      setHasNewMessages(false)
    }
  }, [checkIfAtBottom])

  // Função principal para carregar mensagens
  const loadMessages = useCallback(async () => {
    if (!ticketId) return
    
    try {
      setLoading(true)
      const data = await getTicketMessages(ticketId)
      const newMessages = Array.isArray(data) ? data : []
      setMessages(newMessages)
      lastMessageCountRef.current = newMessages.length
      setHasNewMessages(false)
      
      // Faz scroll apenas na primeira carga
      setTimeout(() => {
        scrollToBottom()
        setIsAtBottom(true)
      }, 100)
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error)
      const errorMessage = error?.response?.data?.message || "Erro ao carregar mensagens"
      toast.error(errorMessage)
      setMessages([])
      lastMessageCountRef.current = 0
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  // Carrega mensagens silenciosamente (sem mostrar loading) - usado no polling
  const loadMessagesSilently = useCallback(async () => {
    if (!ticketId) return
    
    try {
      const data = await getTicketMessages(ticketId)
      const newMessages = Array.isArray(data) ? data : []
      
      // Só atualiza se houver novas mensagens (compara quantidade)
      if (newMessages.length !== lastMessageCountRef.current) {
        const previousCount = lastMessageCountRef.current
        const newCount = newMessages.length
        const newMessagesCount = newCount - previousCount
        
        // Pega as mensagens novas (as últimas que foram adicionadas)
        const newMessagesAdded = newMessages.slice(previousCount)
        
        // Verifica se alguma das mensagens novas é de um administrador
        const isFromAdmin = newMessagesAdded.some(msg => msg.user?.role === 'admin')
        
        // Verifica se TODAS as mensagens novas são internas (se todas forem, cliente não deve ver)
        const allMessagesAreInternal = newMessagesAdded.length > 0 && newMessagesAdded.every(msg => msg.is_internal === true)
        
        setMessages(newMessages)
        lastMessageCountRef.current = newMessages.length
        
        // NUNCA faz scroll automático quando novas mensagens chegam via polling
        // Sempre mostra o botão de notificação quando há novas mensagens
        setHasNewMessages(true)
        
        // Dispara evento para notificar a página do ticket e a lista de tickets
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('new-ticket-message', {
            detail: { 
              ticketId,
              newMessagesCount: newMessagesCount > 0 ? newMessagesCount : 1,
              isFromAdmin: isFromAdmin || false,
              isInternal: allMessagesAreInternal || false
            }
          }))
        }
      }
    } catch (error) {
      // Silenciosamente ignora erros no polling
      console.error("Erro ao atualizar mensagens (polling):", error)
    }
  }, [ticketId])

  // Carrega mensagens quando o ticketId muda
  useEffect(() => {
    if (ticketId) {
      loadMessages()
    }
  }, [ticketId, loadMessages])

  // Polling automático para verificar novas mensagens a cada 10 segundos
  useEffect(() => {
    if (!ticketId) return

    const interval = setInterval(() => {
      // Recarrega mensagens silenciosamente (sem mostrar loading)
      loadMessagesSilently()
    }, 10000) // 10 segundos

    return () => clearInterval(interval)
  }, [ticketId, loadMessagesSilently])

  // Escuta eventos de atualização de mensagens (disparados por notificações)
  useEffect(() => {
    if (!ticketId) return

    const handleRefreshMessages = (event) => {
      const eventTicketId = event.detail?.ticketId
      // Se o evento for para este ticket ou para todos, recarrega silenciosamente
      // (sem fazer scroll automático, apenas mostra notificação se necessário)
      if (!eventTicketId || String(eventTicketId) === String(ticketId)) {
        loadMessagesSilently()
      }
    }

    window.addEventListener('refresh-ticket-messages', handleRefreshMessages)
    return () => {
      window.removeEventListener('refresh-ticket-messages', handleRefreshMessages)
    }
  }, [ticketId, loadMessagesSilently])

  // Escuta evento para fazer scroll até as mensagens (disparado pela notificação fixa)
  useEffect(() => {
    if (!ticketId) return

    const handleScrollToMessages = (event) => {
      const eventTicketId = event.detail?.ticketId
      // Se o evento for para este ticket ou para todos, faz scroll
      if (!eventTicketId || String(eventTicketId) === String(ticketId)) {
        setTimeout(() => {
          scrollToBottom()
          setIsAtBottom(true)
          setHasNewMessages(false)
        }, 100)
      }
    }

    window.addEventListener('scroll-to-messages', handleScrollToMessages)
    return () => {
      window.removeEventListener('scroll-to-messages', handleScrollToMessages)
    }
  }, [ticketId])

  // Listener de scroll para detectar quando o usuário está no final
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    
    // Verifica a posição inicial
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])


  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validação: máximo 10 arquivos
    const totalFiles = selectedFiles.length + files.length
    if (totalFiles > 10) {
      toast.error("Máximo de 10 arquivos por mensagem")
      return
    }

    // Validação: tamanho máximo 10MB por arquivo
    const maxSize = 10 * 1024 * 1024 // 10MB
    const invalidFiles = files.filter(f => f.size > maxSize)
    if (invalidFiles.length > 0) {
      toast.error(`Alguns arquivos excedem 10MB: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    // Validação: tipos permitidos
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
    const invalidTypes = files.filter(f => !allowedTypes.includes(f.type))
    if (invalidTypes.length > 0) {
      toast.error(`Tipos de arquivo não permitidos: ${invalidTypes.map(f => f.name).join(', ')}`)
      return
    }

    setSelectedFiles((prev) => [...prev, ...files])
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!messageText.trim() && selectedFiles.length === 0) {
      toast.error("Digite uma mensagem ou anexe um arquivo antes de enviar")
      return
    }

    // Validação: clientes não podem enviar mensagens internas
    if (isInternal && !canSendInternalMessages) {
      toast.error("Você não tem permissão para enviar mensagens internas")
      setIsInternal(false)
      return
    }

    try {
      setSending(true)
      const response = await sendTicketMessage(ticketId, messageText.trim() || "", isInternal, selectedFiles)
      
      // A resposta pode vir como { message: {...}, attachments: [...] } ou apenas a mensagem
      let newMessage = response.message || response
      
      // Se a resposta tem attachments separados, adiciona à mensagem
      if (response.attachments && Array.isArray(response.attachments)) {
        newMessage = {
          ...newMessage,
          attachments: response.attachments
        }
      }
      
      // Adiciona a nova mensagem à lista
      setMessages((prev) => {
        lastMessageCountRef.current = prev.length + 1
        return [...prev, newMessage]
      })
      
      // Limpa o formulário
      setMessageText("")
      setIsInternal(false)
      setSelectedFiles([])
      
      // Quando o usuário envia uma mensagem, sempre faz scroll para mostrar sua mensagem
      setTimeout(() => {
        scrollToBottom()
        setIsAtBottom(true)
        setHasNewMessages(false)
      }, 100)
      
      toast.success("Mensagem enviada com sucesso!")
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      const errorMessage = error?.response?.data?.message || "Erro ao enviar mensagem"
      const apiErrors = error?.response?.data?.errors
      
      if (apiErrors?.message) {
        const firstError = Array.isArray(apiErrors.message) 
          ? apiErrors.message[0] 
          : apiErrors.message
        toast.error(firstError)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setSending(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500"
      case "support":
        return "bg-blue-500"
      case "assistant":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const isImage = (mimeType) => {
    return mimeType?.startsWith('image/')
  }

  const isPDF = (mimeType) => {
    return mimeType === 'application/pdf'
  }

  const handleDownloadAttachment = async (attachment) => {
    try {
      const blob = await downloadMessageAttachment(attachment.id)
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
      console.error("Erro ao fazer download:", error)
    }
  }

  // Filtrar mensagens baseado nas permissões
  const visibleMessages = messages.filter((msg) => {
    // Admin e Support veem todas as mensagens
    if (isAdmin || isSupport) return true
    
    // Assistant e Cliente veem apenas mensagens não-internas
    return !msg.is_internal
  })

  if (!ticketId) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens Internas
          </CardTitle>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de mensagens */}
        <div 
          ref={messagesContainerRef}
          className="space-y-4 max-h-[500px] overflow-y-auto pr-2 relative"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando mensagens...</span>
            </div>
          ) : visibleMessages.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhuma mensagem ainda. Seja o primeiro a comentar!
            </div>
          ) : (
            visibleMessages.map((message) => {
              const isCurrentUser = user?.id === message.user_id
              const messageDate = new Date(message.created_at)
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 p-4 rounded-lg border",
                    isCurrentUser 
                      ? "bg-primary/5 border-primary/20 ml-8" 
                      : "bg-muted/30 mr-8"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className={getRoleColor(message.user?.role)}>
                      <span className="text-white text-xs font-semibold">
                        {getInitials(message.user?.name)}
                      </span>
                    </AvatarFallback>
                  </Avatar>

                  {/* Conteúdo da mensagem */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {message.user?.name || "Usuário desconhecido"}
                      </span>
                      {message.is_internal && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Lock className="h-3 w-3" />
                          Interna
                        </Badge>
                      )}
                      {message.user?.role && (
                        <Badge variant="secondary" className="text-xs">
                          {message.user.role === "admin" && "Admin"}
                          {message.user.role === "support" && "Suporte"}
                          {message.user.role === "assistant" && "Assistente"}
                          {message.user.role === "cliente" && "Cliente"}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.message}
                    </p>

                    {/* Anexos da mensagem */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <Paperclip className="h-3 w-3" />
                          <span>Anexos ({message.attachments.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-2 p-2 border rounded-md bg-background hover:bg-accent transition-colors"
                            >
                              {isImage(attachment.tipo_mime) ? (
                                <img
                                  src={attachment.url}
                                  alt={attachment.nome_arquivo}
                                  className="h-8 w-8 object-cover rounded"
                                />
                              ) : (
                                <File className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-xs truncate max-w-[150px]" title={attachment.nome_arquivo}>
                                {attachment.nome_arquivo}
                              </span>
                              <div className="flex items-center gap-1">
                                {(isImage(attachment.tipo_mime) || isPDF(attachment.tipo_mime)) && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => window.open(attachment.url, '_blank')}
                                    title="Visualizar"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleDownloadAttachment(attachment)}
                                  title="Download"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(messageDate, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {format(messageDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulário de envio */}
        <form onSubmit={handleSendMessage} className="space-y-3 border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="message">Nova Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem aqui..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              maxLength={5000}
              disabled={sending}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {messageText.length}/5000 caracteres
              </span>
              {canSendInternalMessages && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_internal"
                    checked={isInternal}
                    onCheckedChange={(checked) => setIsInternal(checked)}
                    disabled={sending}
                  />
                  <Label
                    htmlFor="is_internal"
                    className="text-sm font-normal cursor-pointer flex items-center gap-1"
                  >
                    <Lock className="h-3 w-3" />
                    Mensagem interna (apenas admin/support)
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Seleção de arquivos */}
          <div className="space-y-2">
            <Label>Anexos (opcional)</Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={handleFileSelect}
                disabled={sending}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={sending || selectedFiles.length >= 10}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <Paperclip className="mr-2 h-4 w-4" />
                    Anexar Arquivos
                  </span>
                </Button>
              </label>
              {selectedFiles.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </span>
              )}
            </div>

            {/* Preview dos arquivos selecionados */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-md bg-background"
                  >
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs truncate max-w-[150px]" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(file.size)})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                      disabled={sending}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Máximo 10 arquivos, 10MB por arquivo. Tipos permitidos: imagens, PDF, DOC, DOCX, XLS, XLSX, TXT
            </p>
          </div>
          
          <Button
            type="submit"
            disabled={sending || (!messageText.trim() && selectedFiles.length === 0)}
            className="w-full sm:w-auto"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

